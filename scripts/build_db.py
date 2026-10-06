#!/usr/bin/env python3
"""Build the bundled SQLite database (with FTS5) from data/bdlaws.json.

Usage: python3 scripts/build_db.py --in data/bdlaws.json --out assets/db/bdlaws.db
"""
import argparse, json, os, re, sqlite3, unicodedata

def nfc(s):
    return unicodedata.normalize('NFC', s or '')

# Bangla vowel signs, virama, nukta, anusvara etc. must be token characters,
# otherwise unicode61 splits words like "ভোক্তা" into fragments.
BANGLA_TOKENCHARS = "".join(chr(c) for c in list(range(0x0981, 0x0984)) + list(range(0x09BC, 0x09C5))
                            + list(range(0x09C7, 0x09C9)) + list(range(0x09CB, 0x09CE)) + [0x09D7, 0x09E2, 0x09E3, 0x200D])

SEC_NUM_FALLBACK = re.compile(r"^\s*\[?\s*([0-9০-৯]+[A-Za-z\u0995-\u09b9]{0,3})\s*[।৷\.]\s*")

BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

def to_ascii_digits(s):
    return (s or "").translate(BN_DIGITS)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    data = json.load(open(a.inp, encoding="utf-8"))
    acts = data["acts"]
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    if os.path.exists(a.out):
        os.remove(a.out)
    con = sqlite3.connect(a.out)
    cur = con.cursor()
    cur.executescript(f"""
    PRAGMA page_size = 4096;
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE acts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      act_no TEXT, year INTEGER, lang TEXT, published TEXT,
      long_title TEXT, preamble TEXT,
      repealed INTEGER NOT NULL DEFAULT 0, repeal_note TEXT,
      source_url TEXT, section_count INTEGER
    );
    CREATE TABLE sections (
      id INTEGER PRIMARY KEY,
      act_id INTEGER NOT NULL REFERENCES acts(id),
      ord INTEGER NOT NULL,
      no TEXT, no_ascii TEXT, title TEXT, text TEXT NOT NULL, chapter TEXT
    );
    CREATE INDEX idx_sections_act ON sections(act_id, ord);
    CREATE TABLE footnotes (act_id INTEGER, ord INTEGER, text TEXT);
    CREATE VIRTUAL TABLE sections_fts USING fts5(
      title, text, act_title UNINDEXED,
      content='sections_view', content_rowid='id', detail=none,
      tokenize = "unicode61 remove_diacritics 0 tokenchars '{BANGLA_TOKENCHARS}'"
    );
    CREATE VIRTUAL TABLE acts_fts USING fts5(
      title, long_title,
      content='acts', content_rowid='id',
      tokenize = "unicode61 remove_diacritics 0 tokenchars '{BANGLA_TOKENCHARS}'"
    );
    """)
    # external-content view so FTS doesn't duplicate the text
    cur.execute("CREATE VIEW sections_view AS SELECT s.id AS id, s.title AS title, s.text AS text, a.title AS act_title FROM sections s JOIN acts a ON a.id = s.act_id")

    sid = 0
    for act in acts:
        year = to_ascii_digits(act.get("year") or "")
        year_i = int(year) if year.isdigit() else None
        cur.execute("INSERT INTO acts VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (
            act["id"], nfc(act["title"]).strip(), act.get("act_no"), year_i, act.get("lang"), act.get("published"),
            nfc(act.get("long_title")), nfc(act.get("preamble")), 1 if act.get("repealed") else 0, act.get("repeal_note"),
            act.get("source_url"), len(act["sections"])))
        for i, s in enumerate(act["sections"]):
            sid += 1
            if not s.get("no"):
                # amended sections are wrapped in footnote brackets: "[41.(1) The Government..."
                m = SEC_NUM_FALLBACK.match(s["text"])
                if m:
                    s["no"] = m.group(1)
                    s["text"] = s["text"][m.end():].lstrip()
            cur.execute("INSERT INTO sections VALUES (?,?,?,?,?,?,?,?)", (
                sid, act["id"], i, s.get("no") or "", to_ascii_digits(s.get("no") or ""), nfc(s.get("title")), nfc(s["text"]), nfc(s.get("chapter"))))
        for i, f in enumerate(act.get("footnotes") or []):
            cur.execute("INSERT INTO footnotes VALUES (?,?,?)", (act["id"], i, f))
    cur.execute("INSERT INTO sections_fts(sections_fts) VALUES('rebuild')")
    cur.execute("INSERT INTO acts_fts(acts_fts) VALUES('rebuild')")
    cur.execute("INSERT INTO meta VALUES ('source', ?)", (data.get("source"),))
    cur.execute("INSERT INTO meta VALUES ('scraped_at', ?)", (data.get("scraped_at"),))
    cur.execute("INSERT INTO meta VALUES ('act_count', ?)", (str(len(acts)),))
    cur.execute("INSERT INTO meta VALUES ('section_count', ?)", (str(sid),))
    con.commit()
    cur.execute("VACUUM")
    con.close()
    print(f"acts={len(acts)} sections={sid} size={os.path.getsize(a.out)/1e6:.1f}MB -> {a.out}")

if __name__ == "__main__":
    main()
