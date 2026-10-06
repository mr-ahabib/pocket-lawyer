#!/usr/bin/env python3
"""Scrape the official Laws of Bangladesh site (bdlaws.minlaw.gov.bd) into JSON.

Usage: python3 scripts/scrape_bdlaws.py --out data/bdlaws.json [--max-id 1700] [--workers 8]
Each act id maps to http://bdlaws.minlaw.gov.bd/act-print-<id>.html
"""
import argparse, html, json, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = "http://bdlaws.minlaw.gov.bd/act-print-{}.html"
WS = re.compile(r"\s+")
TAG = re.compile(r"<[^>]+>")

def clean(fragment: str) -> str:
    """HTML fragment -> plain text, keeping paragraph breaks."""
    s = re.sub(r'<div class="(clbr|na)">&nbsp;</div>', "\n", fragment)
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</p>|</div>|</li>", "\n", s)
    s = re.sub(r"<sup[^>]*>.*?</sup>", "", s, flags=re.S)          # footnote markers
    s = TAG.sub("", s)
    s = html.unescape(s).replace("‌", "").replace("‍", "").replace("\xa0", " ")
    lines = [WS.sub(" ", ln).strip() for ln in s.split("\n")]
    out, prev_blank = [], False
    for ln in lines:
        if ln:
            out.append(ln); prev_blank = False
        elif not prev_blank and out:
            out.append(""); prev_blank = True
    return "\n".join(out).strip()

SEC_NUM = re.compile(r"^\s*([0-9০-৯]+[A-Za-zক-হ]{0,3})\s*[।৷\.]\s*")

def fetch(url, retries=4):
    for i in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "Mozilla/5.0 (PocketLawyer dataset builder)"})
            with urlopen(req, timeout=60) as r:
                if r.status != 200:
                    return None
                return r.read().decode("utf-8", "ignore")
        except HTTPError as e:
            if e.code in (404, 302, 500):
                return None
            time.sleep(2 * (i + 1))
        except (URLError, TimeoutError, OSError):
            time.sleep(2 * (i + 1))
    return None

def parse(act_id, page):
    s = WS.sub(" ", page)
    if "txt-details" not in s and "act-role-style" not in s:
        return None
    m = re.search(r'id="printheader">(.*?)</div>', s)
    title = clean(m.group(1)) if m else ""
    if not title:
        m = re.search(r"<h3>(.*?)</h3>", s)
        title = clean(m.group(1)) if m else f"Act {act_id}"
    m = re.search(r"<h4[^>]*>(.*?)</h4>", s)
    act_no_line = clean(m.group(1)).strip("() ") if m else ""
    m = re.search(r'publish-date">(.*?)</p>', s)
    pub = clean(m.group(1)).strip("[] ") if m else ""
    m = re.search(r'act-role-style">(.*?)</div>', s)
    long_title = clean(m.group(1)) if m else ""
    m = re.search(r'bt-act-repealed[^>]*>(.*?)</section>', s)
    repeal_note = clean(m.group(1)) if m else ""
    repealed = bool(repeal_note) or "bn-repealed" in s
    m = re.search(r'pad-right">(.*?)</div> </div> </div> </div> </div> </section>', s)
    preamble = clean(m.group(1)) if m else ""

    sections, chapter = [], None
    body_start = s.find("bg-striped")
    body = s[body_start:] if body_start > 0 else s
    body = body.split('class="footnoteListAll"')[0]
    # iterate rows in order
    for row in re.finditer(r'<div class="row lineremoves[^"]*">(.*?)(?=<div class="row lineremoves|<hr/>|$)', body, re.S):
        chunk = row.group(1)
        ch = re.search(r'act-chapter-no">(.*?)</p>.*?act-chapter-name"[^>]*>(.*?)</p>', chunk, re.S)
        if ch:
            chapter = {"no": clean(ch.group(1)), "name": clean(ch.group(2))}
        head = re.search(r'txt-head"[^>]*>(.*?)</div>', chunk, re.S)
        det = re.search(r'txt-details"[^>]*>(.*)', chunk, re.S)
        if not det:
            continue
        text = clean(det.group(1))
        if not text:
            continue
        num = ""
        mm = SEC_NUM.match(text)
        if mm:
            num = mm.group(1)
            text = text[mm.end():].strip()
        sections.append({
            "no": num,
            "title": clean(head.group(1)) if head else "",
            "text": text,
            "chapter": chapter["name"] if chapter else "",
        })
    foot = []
    fl = s.find('class="footnoteListAll"')
    if fl > 0:
        for li in re.finditer(r"<li[^>]*>(.*?)</li>", s[fl:], re.S):
            t = clean(li.group(1))
            if t:
                foot.append(t)
    year = ""
    ym = re.search(r"(১৯|২০|১৮|১৭)[০-৯]{2}|(1[789]|20)\d{2}", title)
    if ym:
        year = ym.group(0)
    lang = "bn" if re.search(r"[ঀ-৿]", title) else "en"
    return {
        "id": act_id, "title": title, "act_no": act_no_line, "year": year, "lang": lang,
        "published": pub, "long_title": long_title, "preamble": preamble,
        "repealed": repealed, "repeal_note": repeal_note,
        "sections": sections, "footnotes": foot,
        "source_url": BASE.format(act_id),
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--min-id", type=int, default=1)
    ap.add_argument("--max-id", type=int, default=1900)
    ap.add_argument("--merge", help="existing json to merge into")
    ap.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()
    ids = list(range(a.min_id, a.max_id + 1))
    acts, done = {}, 0
    if a.merge and os.path.exists(a.merge):
        for act in json.load(open(a.merge))["acts"]:
            acts[act["id"]] = act
    with ThreadPoolExecutor(a.workers) as ex:
        futs = {ex.submit(fetch, BASE.format(i)): i for i in ids}
        for f in as_completed(futs):
            i = futs[f]; done += 1
            page = f.result()
            if page:
                try:
                    act = parse(i, page)
                    if act and (act["sections"] or act["long_title"]):
                        acts[i] = act
                except Exception as e:
                    print("parse error", i, e, file=sys.stderr)
            if done % 100 == 0:
                print(f"{done}/{len(ids)} fetched, {len(acts)} acts", file=sys.stderr, flush=True)
    out = sorted(acts.values(), key=lambda x: x["id"])
    json.dump({"source": "http://bdlaws.minlaw.gov.bd", "scraped_at": time.strftime("%Y-%m-%d"),
               "count": len(out), "acts": out}, open(a.out, "w"), ensure_ascii=False)
    print(f"wrote {len(out)} acts, {sum(len(x['sections']) for x in out)} sections -> {a.out}", file=sys.stderr)

if __name__ == "__main__":
    main()
