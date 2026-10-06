#!/usr/bin/env python3
"""Generate app icon, adaptive icon layers, splash and favicon.
Mark: a minimal balance scale in white on deep green."""
from PIL import Image, ImageDraw
import os

GREEN = (12, 59, 46, 255)
WHITE = (255, 255, 255, 255)
BRASS = (255, 186, 0, 255)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')

def scale_mark(size, color=WHITE, pad=0.22, stroke=None, accent=None):
    """Draw a balance scale centred in a transparent square."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size
    st = stroke or max(2, int(s * 0.045))
    x0 = s * pad; x1 = s * (1 - pad); w = x1 - x0
    cx = s / 2
    top = s * (pad + 0.06)
    beam_y = top + w * 0.16
    base_y = s * (1 - pad - 0.02)
    # column
    d.line([(cx, beam_y), (cx, base_y - st)], fill=color, width=st)
    # base
    d.rounded_rectangle([x0 + w * 0.22, base_y - st, x1 - w * 0.22, base_y + st * 0.2], radius=st // 2, fill=color)
    # beam
    d.line([(x0 + w * 0.08, beam_y), (x1 - w * 0.08, beam_y)], fill=color, width=st)
    # finial
    d.ellipse([cx - st * 0.9, top - st * 0.2, cx + st * 0.9, top + st * 1.6], fill=accent or color)
    # pans
    for px in (x0 + w * 0.14, x1 - w * 0.14):
        pan_y = beam_y + w * 0.34
        d.line([(px, beam_y), (px - w * 0.11, pan_y)], fill=color, width=max(2, st // 2))
        d.line([(px, beam_y), (px + w * 0.11, pan_y)], fill=color, width=max(2, st // 2))
        d.chord([px - w * 0.16, pan_y - w * 0.09, px + w * 0.16, pan_y + w * 0.09], 0, 180, fill=color)
    return img

def rounded_bg(size, color, radius_ratio=0.225):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=color)
    return img

S = 1024
# App icon (iOS/Play store): green rounded square + white mark with brass finial
icon = rounded_bg(S, GREEN)
icon.alpha_composite(scale_mark(S, pad=0.24, accent=BRASS))
icon.save(os.path.join(OUT, 'icon.png'))
# Adaptive: foreground mark must sit within the safe zone (66%) -> more padding
fg = scale_mark(S, pad=0.285, accent=BRASS)
fg.save(os.path.join(OUT, 'android-icon-foreground.png'))
Image.new('RGBA', (S, S), GREEN).save(os.path.join(OUT, 'android-icon-background.png'))
mono = scale_mark(S, pad=0.285, color=WHITE)
mono.save(os.path.join(OUT, 'android-icon-monochrome.png'))
# Splash: transparent mark, shown on green background
scale_mark(S, pad=0.2, accent=BRASS).save(os.path.join(OUT, 'splash-icon.png'))
# Favicon
icon.resize((96, 96), Image.LANCZOS).save(os.path.join(OUT, 'favicon.png'))
print('icons written')
