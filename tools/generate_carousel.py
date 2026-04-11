#!/usr/bin/env python3
"""
Rancabango Hotel — Liburan Sekolah Juli 2026
Instagram Carousel Generator: 3 carousels x 5 slides = 15 JPG (1080x1080px)
@social-creative-designer — Mote Kreatif
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ── Paths ──────────────────────────────────────────────────────
BASE   = "/Users/nanansomanan/Documents/GitHub/mote-team"
ASSETS = f"{BASE}/context/clients/rancabango/assets"
OUT    = f"{BASE}/workspace/social-media/rancabango/final"
FDIR   = "/Users/nanansomanan/Library/Fonts"
os.makedirs(OUT, exist_ok=True)

# ── Photos (1440x1920 portrait) ────────────────────────────────
P = [
    f"{ASSETS}/573589149_18433328704103623_1615188499120710603_n.jpg",
    f"{ASSETS}/573648752_18433328722103623_1379267767715245215_n.jpg",
    f"{ASSETS}/574746355_18433328731103623_5207890196615266511_n.jpg",
]

# ── Logo ───────────────────────────────────────────────────────
LOGO_SQ   = f"{ASSETS}/logovertical2.png"    # 500x500 compact
LOGO_WIDE = f"{ASSETS}/logovertical1.png"    # 1024x329 wide

# ── Colors ─────────────────────────────────────────────────────
WHITE   = (255, 255, 255, 255)
W85     = (255, 255, 255, 217)
W65     = (255, 255, 255, 166)
W40     = (255, 255, 255, 102)
GOLD    = (196, 163, 90,  255)
GOLD_L  = (226, 200, 138, 255)
GOLD_D  = (160, 130, 60,  255)
TEAL_D  = (26,  63,  74,  255)
TEAL    = (61,  122, 138, 255)
GREEN_A = (122, 232, 160, 255)
RED_A   = (224, 92,  92,  255)
WA_GRN  = (37,  211, 102, 255)
BLACK   = (0,   0,   0,   255)
TRANSP  = (0,   0,   0,   0)

SIZE = 1080


# ═══════════════════════════════════════════════════════════════
# FONT HELPERS
# ═══════════════════════════════════════════════════════════════

def F(name, size):
    paths = {
        "sb":  f"{FDIR}/PlayfairDisplay-Black.ttf",
        "sb2": f"{FDIR}/PlayfairDisplay-Bold.ttf",
        "si":  f"{FDIR}/PlayfairDisplay-Italic.ttf",
        "sr":  f"{FDIR}/PlayfairDisplay-Regular.ttf",
        "mb":  f"{FDIR}/Montserrat-Black.ttf",
        "mxb": f"{FDIR}/Montserrat-ExtraBold.ttf",
        "mbd": f"{FDIR}/Montserrat-Bold.ttf",
        "msb": f"{FDIR}/Montserrat-SemiBold.ttf",
        "mm":  f"{FDIR}/Montserrat-Medium.ttf",
        "mr":  f"{FDIR}/Montserrat-Regular.ttf",
        "ml":  f"{FDIR}/Montserrat-Light.ttf",
    }
    return ImageFont.truetype(paths[name], size)


# ═══════════════════════════════════════════════════════════════
# CORE HELPERS
# ═══════════════════════════════════════════════════════════════

def crop_center(photo_idx, voffset=0.5):
    """Load photo, center-crop to 1080x1080. voffset 0=top, 1=bottom."""
    img = Image.open(P[photo_idx]).convert("RGB")
    w, h = img.size
    # photo is portrait (1440x1920) — crop to square
    side = min(w, h)
    left = (w - side) // 2
    top  = int((h - side) * voffset)
    top  = max(0, min(top, h - side))
    img  = img.crop((left, top, left + side, top + side))
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def make_canvas(photo_idx, voffset=0.5, overlay_alpha=0.48):
    """Return RGBA canvas: photo + dark overlay."""
    bg      = crop_center(photo_idx, voffset).convert("RGBA")
    overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, int(255 * overlay_alpha)))
    return Image.alpha_composite(bg, overlay)


def new_draw(canvas):
    return ImageDraw.Draw(canvas, "RGBA")


def tc(color, alpha):
    """Tweak alpha of a color tuple."""
    return (color[0], color[1], color[2], alpha)


# ── Text helpers ───────────────────────────────────────────────

def bbox_wh(draw, text, font_obj):
    bb = draw.textbbox((0, 0), text, font=font_obj)
    return bb[2] - bb[0], bb[3] - bb[1]


def text_cx(draw, text, y, font_obj, color, shadow_strength=80):
    """Draw text centered horizontally at y."""
    w, h = bbox_wh(draw, text, font_obj)
    x = (SIZE - w) // 2
    if shadow_strength:
        draw.text((x+2, y+2), text, font=font_obj, fill=(0, 0, 0, shadow_strength))
    draw.text((x, y), text, font=font_obj, fill=color)
    return h  # returns text height


def text_xy(draw, text, x, y, font_obj, color, shadow_strength=60):
    """Draw text at (x, y)."""
    if shadow_strength:
        draw.text((x+2, y+2), text, font=font_obj, fill=(0, 0, 0, shadow_strength))
    draw.text((x, y), text, font=font_obj, fill=color)
    _, h = bbox_wh(draw, text, font_obj)
    return h


def multiline_cx(draw, lines, start_y, font_obj, color, gap=10, shadow_strength=80):
    """Draw multiple lines centered. Returns y after last line."""
    y = start_y
    for line in lines:
        h = text_cx(draw, line, y, font_obj, color, shadow_strength)
        y += h + gap
    return y


# ── Gold bars ──────────────────────────────────────────────────

def gold_bar_top(draw, height=6):
    draw.rectangle([0, 0, SIZE, height], fill=(196, 163, 90))


def gold_bar_bottom(draw, height=6):
    draw.rectangle([0, SIZE - height, SIZE, SIZE], fill=(196, 163, 90))


def gold_divider(draw, y, width=120, cx=540):
    x0, x1 = cx - width // 2, cx + width // 2
    draw.rectangle([x0, y, x1, y + 2], fill=(196, 163, 90, 200))


# ── Logo ───────────────────────────────────────────────────────

def paste_logo(canvas, size=125, margin=32, logo_path=None):
    lp   = logo_path or LOGO_SQ
    logo = Image.open(lp).convert("RGBA")
    lw, lh = logo.size
    if lw >= lh:
        nw, nh = size, int(lh * size / lw)
    else:
        nh, nw = size, int(lw * size / lh)
    logo = logo.resize((nw, nh), Image.LANCZOS)
    x = SIZE - nw - margin
    y = margin
    canvas.paste(logo, (x, y), logo)


# ── Footer ─────────────────────────────────────────────────────

def footer(draw, slide_n, total=5):
    ft    = F("mr", 17)
    label = "Rancabango Hotel \u00a9 2026"
    w, _  = bbox_wh(draw, label, ft)
    draw.text(((SIZE - w) // 2, SIZE - 38), label, font=ft, fill=(255, 255, 255, 110))
    num_str = f"{slide_n} / {total}"
    nw, _   = bbox_wh(draw, num_str, ft)
    draw.text((SIZE - nw - 36, SIZE - 38), num_str, font=ft, fill=(255, 255, 255, 70))


# ── Badge ──────────────────────────────────────────────────────

def badge(draw, text, cx, top_y, bg_col, text_col, font_obj, px=26, py=10, r=4):
    tw, th = bbox_wh(draw, text, font_obj)
    x0 = cx - tw // 2 - px
    y0 = top_y
    x1 = cx + tw // 2 + px
    y1 = top_y + th + py * 2
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=bg_col)
    draw.text((cx - tw // 2, top_y + py), text, font=font_obj, fill=text_col)
    return y1 - y0  # height


# ── Pill row ───────────────────────────────────────────────────

def pill_row(draw, labels, cy, font_obj, gap=16, px=20, py=9):
    widths = [bbox_wh(draw, t, font_obj)[0] + px * 2 for t in labels]
    total  = sum(widths) + gap * (len(labels) - 1)
    x = (SIZE - total) // 2
    pill_h = bbox_wh(draw, labels[0], font_obj)[1] + py * 2
    for text, w in zip(labels, widths):
        draw.rounded_rectangle([x, cy, x + w, cy + pill_h], radius=pill_h // 2,
                                fill=(255, 255, 255, 22), outline=(196, 163, 90, 70), width=1)
        tw, th = bbox_wh(draw, text, font_obj)
        draw.text((x + (w - tw) // 2, cy + (pill_h - th) // 2), text,
                  font=font_obj, fill=(255, 255, 255, 210))
        x += w + gap


# ── Checkmark list ─────────────────────────────────────────────

def check_list(draw, items, x, y, font_obj, dot_color=TEAL, line_gap=6):
    for text in items:
        draw.ellipse([x, y + 9, x + 9, y + 18], fill=dot_color)
        text_xy(draw, text, x + 20, y, font_obj, (255, 255, 255, 225), shadow_strength=50)
        _, h = bbox_wh(draw, text, font_obj)
        y += h + line_gap + 4
    return y


# ── Icon list ──────────────────────────────────────────────────

def icon_list(draw, items, x, y, icon_font, text_font, gap=8):
    """items = list of (icon, text) tuples"""
    for icon, text in items:
        draw.text((x, y), icon, font=icon_font, fill=WHITE)
        text_xy(draw, text, x + 48, y + 2, text_font, (255, 255, 255, 220), shadow_strength=40)
        _, h = bbox_wh(draw, text, text_font)
        y += h + gap + 6
    return y


# ── Stat cards ─────────────────────────────────────────────────

def stat_cards(draw, cards, top_y, card_w=220, h=105, gap=30):
    """cards = list of (value, label). Auto-center the row."""
    total = len(cards) * card_w + (len(cards) - 1) * gap
    x = (SIZE - total) // 2
    for val, lbl in cards:
        draw.rounded_rectangle([x, top_y, x + card_w, top_y + h], radius=12,
                                fill=(255, 255, 255, 14), outline=(196, 163, 90, 55), width=1)
        vf    = F("sb2", 34)
        vw, _ = bbox_wh(draw, val, vf)
        draw.text((x + (card_w - vw) // 2, top_y + 12), val, font=vf, fill=GOLD)
        lf    = F("mr", 14)
        lw, _ = bbox_wh(draw, lbl, lf)
        draw.text((x + (card_w - lw) // 2, top_y + 58), lbl, font=lf, fill=(255, 255, 255, 140))
        x += card_w + gap


# ── WA CTA bar ─────────────────────────────────────────────────

def wa_bar(draw, y):
    """Full-width dark teal bar with WA booking info."""
    draw.rectangle([0, y, SIZE, SIZE], fill=(26, 63, 74, 235))
    tf = F("mbd", 20)
    text_cx(draw, "📲  Pesan via WhatsApp  \u00b7  +62 896-6215-8784",
            y + 16, tf, WHITE, shadow_strength=0)


# ── Save ───────────────────────────────────────────────────────

def save(canvas, name):
    path = f"{OUT}/{name}"
    canvas.convert("RGB").save(path, "JPEG", quality=95, optimize=True)
    print(f"  \u2713  {name}")


# ═══════════════════════════════════════════════════════════════
# CAROUSEL 1 — "Paket Liburan Sekolah Juli 2026"
# ═══════════════════════════════════════════════════════════════

def c1s1():
    """Cover — Liburan Sekolah Juli 2026"""
    cv = make_canvas(0, voffset=0.38, overlay_alpha=0.52)
    d  = new_draw(cv)
    gold_bar_top(d); gold_bar_bottom(d)
    paste_logo(cv)

    badge(d, "\u2736  PROMO SPESIAL  \u2736", 540, 110,
          GOLD, TEAL_D, F("mbd", 16))

    multiline_cx(d, ["Liburan", "Sekolah"], 196,
                 F("sb", 126), WHITE, gap=-14)

    text_cx(d, "JULI  2026", 562, F("ml", 50), (255, 255, 255, 110))

    gold_divider(d, 642, width=160)

    text_cx(d, "Kenangan Selamanya \u00b7 Rasakan Bali, Tanpa Harus Jauh",
            668, F("mr", 22), W85)

    pill_row(d,
             ["\U0001f3ca Kids Pool", "\U0001f33f View Gunung",
              "\U0001f3e8 Nuansa Bali", "\U0001f4cd 2 Jam dari Bandung"],
             752, F("mr", 18))

    footer(d, 1)
    save(cv, "carousel-1-slide-1.jpg")


def c1s2():
    """Paket Family 2D1N"""
    cv = make_canvas(1, voffset=0.42, overlay_alpha=0.60)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    text_cx(d, "PAKET UTAMA", 74, F("msb", 15), GOLD)
    text_cx(d, "\U0001f3e1", 104, F("mr", 60), WHITE)
    multiline_cx(d, ["Family", "2D1N"], 182, F("sb", 96), WHITE, gap=-10)

    text_cx(d, "Cocok untuk keluarga 2 dewasa + 2 anak",
            392, F("mr", 21), W65)

    text_cx(d, "Mulai Dari", 450, F("mr", 18), W65)
    text_cx(d, "Rp 899.000", 480, F("sb", 72), GOLD_L)
    text_cx(d, "per malam \u00b7 sudah termasuk sarapan",
            566, F("mr", 19), W65)

    gold_divider(d, 614, width=100)

    text_cx(d, "\u2736  SUDAH TERMASUK  \u2736", 634, F("msb", 14), GOLD)
    check_list(d,
               ["Kamar Deluxe dengan view gunung atau taman",
                "Sarapan keluarga untuk 2 dewasa + 2 anak",
                "Akses penuh kolam renang & kids pool",
                "Aktivitas anak terjadwal setiap hari jam 10.00"],
               200, 672, F("mr", 20), dot_color=TEAL)

    wa_bar(d, 970)
    footer(d, 2)
    save(cv, "carousel-1-slide-2.jpg")


def c1s3():
    """Paket Weekend Plus — Most Popular"""
    cv = make_canvas(2, voffset=0.45, overlay_alpha=0.58)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    badge(d, "\u2b50  PALING POPULER", 540, 62,
          GOLD, TEAL_D, F("mbd", 16))

    text_cx(d, "BEST VALUE", 130, F("msb", 15), GOLD_L)
    text_cx(d, "\U0001f31f", 162, F("mr", 58), WHITE)
    multiline_cx(d, ["Weekend", "Plus"], 238, F("sb", 94), WHITE, gap=-10)
    text_cx(d, "2D1N + Aktivitas Premium", 438, F("mr", 23), W65)

    text_cx(d, "Harga Spesial Liburan Sekolah", 498, F("mr", 18), W65)
    text_cx(d, "Rp 1,2 Juta", 526, F("sb", 70), GOLD_L)
    text_cx(d, "per malam \u00b7 all-inclusive \u00b7 hemat 20% vs harga normal",
            608, F("mr", 19), W65)

    gold_divider(d, 654, width=100)

    text_cx(d, "\u2736  TERMASUK EKSTRA  \u2736", 673, F("msb", 14), GOLD)
    check_list(d,
               ["BBQ dinner di area outdoor dengan view malam",
                "Welcome drink satu set untuk seluruh keluarga",
                "1x foto keluarga di spot terbaik (cetak 4R)",
                "Diskon 10% F&B selama menginap"],
               200, 710, F("mr", 20), dot_color=GOLD)

    wa_bar(d, 970)
    footer(d, 3)
    save(cv, "carousel-1-slide-3.jpg")


def c1s4():
    """Paket Extended 3D2N — Premium"""
    cv = make_canvas(0, voffset=0.65, overlay_alpha=0.62)
    d  = new_draw(cv)
    # Warm gold top bar
    d.rectangle([0, 0, SIZE, 6], fill=(196, 163, 90))
    paste_logo(cv)

    text_cx(d, "LONG STAY", 76, F("msb", 15), GOLD_L)
    text_cx(d, "\U0001f451", 106, F("mr", 58), WHITE)
    multiline_cx(d, ["Extended", "3D2N"], 180, F("sb", 94), GOLD_L, gap=-10)
    text_cx(d, "Makin lama, makin hemat", 380, F("mr", 23), W65)

    text_cx(d, "Total Paket", 440, F("mr", 18), W65)
    text_cx(d, "Rp 2,1 Juta", 468, F("sb", 70), GOLD_L)
    text_cx(d, "untuk 3 hari 2 malam \u00b7 hemat Rp 300.000",
            550, F("mr", 19), W65)

    gold_divider(d, 598, width=100)

    text_cx(d, "\u2736  BONUS KHUSUS LONG STAY  \u2736", 618, F("msb", 14), GOLD_L)
    check_list(d,
               ["Upgrade kamar ke Suite (subject to availability)",
                "1x city tour Garut dengan driver resort (half day)",
                "Laundry gratis hingga 5 kg per malam",
                "Priority booking untuk Agustus 2026"],
               200, 656, F("mr", 20), dot_color=GOLD)

    # Gold-toned CTA bar
    d.rectangle([0, 970, SIZE, SIZE], fill=(42, 26, 0, 235))
    text_cx(d, "📲  Pesan via WhatsApp  \u00b7  +62 896-6215-8784",
            988, F("mbd", 20), GOLD_L, shadow_strength=0)

    footer(d, 4)
    save(cv, "carousel-1-slide-4.jpg")


def c1s5():
    """CTA — Liburan Sekolah Terbaik Dimulai di Sini"""
    cv = make_canvas(1, voffset=0.55, overlay_alpha=0.68)
    d  = new_draw(cv)
    gold_bar_top(d); gold_bar_bottom(d)
    paste_logo(cv)

    badge(d, "\u26a1  SLOT TERBATAS \u2014 PESAN SEKARANG", 540, 100,
          RED_A, WHITE, F("mbd", 16), px=24)

    multiline_cx(d, ["Liburan Sekolah", "Terbaik"], 214,
                 F("sb", 88), WHITE, gap=-8)
    text_cx(d, "Dimulai di Sini", 402, F("sb", 88), GOLD)

    gold_divider(d, 516, width=140)

    text_cx(d, "Garut  \u00b7  Nuansa Bali  \u00b7  Fasilitas Keluarga Lengkap",
            540, F("mr", 22), W85)
    text_cx(d, "16 Juni \u2013 31 Juli 2026", 580, F("msb", 22), GOLD_L)

    stat_cards(d, [("2 Jam", "dari Bandung"),
                   ("3 Paket", "tersedia"),
                   ("\u2b50 4.8", "rating tamu")], 628)

    # WA button
    d.rounded_rectangle([220, 780, 860, 860], radius=40, fill=(*WA_GRN[:3], 240))
    text_cx(d, "📲  Hubungi via WhatsApp", 796, F("mbd", 26), WHITE, shadow_strength=0)
    text_cx(d, "+62 896-6215-8784", 880, F("mr", 20), W65)

    text_cx(d, "@rancabango_hotel", 940, F("mr", 18), W40)
    footer(d, 5)
    save(cv, "carousel-1-slide-5.jpg")


# ═══════════════════════════════════════════════════════════════
# CAROUSEL 2 — "5 Fasilitas untuk Keluarga"
# ═══════════════════════════════════════════════════════════════

def c2s1():
    """Cover — 5 Fasilitas untuk Keluargamu"""
    cv = make_canvas(2, voffset=0.28, overlay_alpha=0.55)
    d  = new_draw(cv)
    gold_bar_top(d); gold_bar_bottom(d)
    paste_logo(cv)

    text_cx(d, "KENAPA PILIH KAMI?", 88, F("msb", 16), GOLD)

    multiline_cx(d, ["5 Fasilitas", "untuk"], 174, F("sb", 96), WHITE, gap=-8)
    text_cx(d, "Keluargamu", 376, F("sb", 96), GOLD)

    gold_divider(d, 494, width=140)

    multiline_cx(d,
                 ["Geser untuk melihat semua yang sudah kami siapkan",
                  "untuk liburan sekolah terbaik anak-anakmu."],
                 520, F("mr", 22), W85, gap=10)

    pill_row(d, ["\U0001f3ca Kolam Renang", "\U0001f6cf Kamar Keluarga", "\U0001f304 View Gunung"],
             650, F("mr", 20))
    pill_row(d, ["\U0001f373 Sarapan Inklusif", "\U0001f3ad Aktivitas Anak"],
             714, F("mr", 20))

    footer(d, 1)
    save(cv, "carousel-2-slide-1.jpg")


def c2s2():
    """Fasilitas 01: Kolam Renang"""
    cv = make_canvas(0, voffset=0.50, overlay_alpha=0.58)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    text_cx(d, "FASILITAS  01", 68, F("msb", 15), GOLD)
    text_cx(d, "\U0001f3ca", 98, F("mr", 68), WHITE)
    multiline_cx(d, ["Kolam", "Renang"], 186, F("sb", 100), WHITE, gap=-10)
    text_cx(d, "Adults & Kids Pool", 398, F("mr", 24), GOLD_L)

    gold_divider(d, 456)

    multiline_cx(d,
                 ["Kolam utama dengan view pegunungan Garut,",
                  "plus kolam khusus anak yang aman dan menyenangkan."],
                 484, F("mr", 21), W85, gap=10)

    icon_list(d,
              [("\U0001f30a", "Main pool backdrop gunung \u2014 spot foto paling favorit tamu"),
               ("\U0001f476", "Kids pool kedalaman 40\u201360 cm, aman untuk balita"),
               ("\u2600\ufe0f",  "Buka 07.00\u201320.00 WIB \u2014 pagi, siang, sampai sore"),
               ("\U0001f6c1", "Kamar bilas bersih + loker di area kolam")],
              150, 594, F("mr", 24), F("mr", 20), gap=8)

    d.rectangle([0, 960, SIZE, 1020], fill=(*TEAL_D[:3], 225))
    text_cx(d, "@rancabango_hotel  \u00b7  Geser \u2192 Fasilitas Berikutnya",
            977, F("mr", 18), W65, shadow_strength=0)

    footer(d, 2)
    save(cv, "carousel-2-slide-2.jpg")


def c2s3():
    """Fasilitas 02: Kamar Keluarga"""
    cv = make_canvas(1, voffset=0.50, overlay_alpha=0.62)
    d  = new_draw(cv)
    d.rectangle([0, 0, SIZE, 6], fill=(138, 92, 40))  # warm brown bar
    paste_logo(cv)

    text_cx(d, "FASILITAS  02", 68, F("msb", 15), (226, 200, 138, 255))
    text_cx(d, "\U0001f6cf\ufe0f", 98, F("mr", 68), WHITE)
    multiline_cx(d, ["Kamar", "Keluarga"], 186, F("sb", 100), WHITE, gap=-10)
    text_cx(d, "Deluxe & Suite", 398, F("mr", 24), (226, 200, 138, 255))

    gold_divider(d, 456)

    multiline_cx(d,
                 ["Kamar bergaya Bali yang hangat dan fungsional.",
                  "Tersedia untuk keluarga 2 orang tua + 2\u20133 anak."],
                 484, F("mr", 21), W85, gap=10)

    icon_list(d,
              [("\U0001f304", "Kamar view gunung \u2014 tirai dibuka, langsung alam Garut"),
               ("\U0001f6cc", "Extra bed tersedia \u2014 cocok untuk keluarga 3+ anak"),
               ("\u2744\ufe0f",  "AC + kipas \u2014 suhu Garut sejuk, kamar tetap nyaman"),
               ("\U0001f3ef", "Desain nuansa Bali \u2014 ornamen kayu, tekstil, tenang")],
              150, 594, F("mr", 24), F("mr", 20), gap=8)

    d.rectangle([0, 960, SIZE, 1020], fill=(74, 40, 0, 225))
    text_cx(d, "@rancabango_hotel  \u00b7  Geser \u2192 Area Outdoor",
            977, F("mr", 18), W65, shadow_strength=0)

    footer(d, 3)
    save(cv, "carousel-2-slide-3.jpg")


def c2s4():
    """Fasilitas 03: Area Outdoor"""
    cv = make_canvas(2, voffset=0.60, overlay_alpha=0.56)
    d  = new_draw(cv)
    d.rectangle([0, 0, SIZE, 6], fill=(30, 96, 64))  # green bar
    paste_logo(cv)

    text_cx(d, "FASILITAS  03", 68, F("msb", 15), (122, 232, 160, 255))
    text_cx(d, "\U0001f33f", 98, F("mr", 68), WHITE)
    multiline_cx(d, ["Area", "Outdoor"], 186, F("sb", 100), WHITE, gap=-10)
    text_cx(d, "Activities & Garden", 398, F("mr", 24), (122, 232, 160, 255))

    gold_divider(d, 456)

    multiline_cx(d,
                 ["Ruang bermain alami yang merangsang kreativitas",
                  "anak sekaligus tempat orang tua bisa beristirahat."],
                 484, F("mr", 21), W85, gap=10)

    icon_list(d,
              [("\U0001f3ad", "Aktivitas anak terjadwal jam 10.00 & 15.00 WIB"),
               ("\U0001f33a", "Taman tropis Bali \u2014 spot foto tanpa filter diperlukan"),
               ("\U0001f525", "Area BBQ outdoor tersedia (reservasi sehari sebelum)"),
               ("\U0001f319", "Area duduk malam \u2014 bintang + lampu taman + angin Garut")],
              150, 594, F("mr", 24), F("mr", 20), gap=8)

    d.rectangle([0, 960, SIZE, 1020], fill=(15, 48, 32, 225))
    text_cx(d, "@rancabango_hotel  \u00b7  Geser \u2192 Booking Sekarang!",
            977, F("mr", 18), W65, shadow_strength=0)

    footer(d, 4)
    save(cv, "carousel-2-slide-4.jpg")


def c2s5():
    """CTA — Semua Fasilitas, Satu Tempat"""
    cv = make_canvas(0, voffset=0.70, overlay_alpha=0.65)
    d  = new_draw(cv)
    gold_bar_top(d); gold_bar_bottom(d)
    paste_logo(cv)

    text_cx(d, "LIBURAN SEKOLAH JULI 2026", 78, F("msb", 16), GOLD)

    text_cx(d, "Semua Fasilitas,", 136, F("sb", 82), WHITE)
    text_cx(d, "Satu Tempat", 232, F("sb", 82), GOLD)

    gold_divider(d, 340)

    text_cx(d, "Bali di Garut \u2014 2 jam dari Bandung", 368, F("mr", 24), W85)
    text_cx(d, "Kenangan keluarga yang tidak akan terlupakan", 408, F("mr", 21), W65)

    pill_row(d,
             ["\U0001f3ca Kolam Renang", "\U0001f6cf Kamar Keluarga", "\U0001f33f Area Outdoor"],
             476, F("mr", 20))
    pill_row(d, ["\U0001f373 Sarapan Inklusif", "\U0001f3ad Aktivitas Anak"], 540, F("mr", 20))

    # WA button
    d.rounded_rectangle([210, 616, 870, 700], radius=42, fill=(*WA_GRN[:3], 240))
    text_cx(d, "📲  Booking via WhatsApp", 632, F("mbd", 28), WHITE, shadow_strength=0)
    text_cx(d, "+62 896-6215-8784", 724, F("mr", 21), W65)

    text_cx(d, "@rancabango_hotel", 790, F("mr", 18), W40)
    footer(d, 5)
    save(cv, "carousel-2-slide-5.jpg")


# ═══════════════════════════════════════════════════════════════
# CAROUSEL 3 — "Bali di Garut"
# ═══════════════════════════════════════════════════════════════

def c3s1():
    """Cover — Ini bukan Bali. Ini Garut."""
    cv = make_canvas(1, voffset=0.30, overlay_alpha=0.54)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    text_cx(d, "\u2736  KENAPA RANCABANGO  \u2736", 76, F("msb", 16), GOLD)

    text_cx(d, "ini bukan", 162, F("si", 44), (255, 255, 255, 155))
    text_cx(d, "Bali.", 212, F("sb", 130), WHITE)

    gold_divider(d, 374, width=90)
    text_cx(d, "Ini Garut", 396, F("msb", 30), GOLD)
    gold_divider(d, 448, width=70)

    text_cx(d, "Nuansa Bali, Jarak Bandung", 472, F("sb2", 48), W85)

    gold_divider(d, 542, width=80)

    multiline_cx(d,
                 ["Geser untuk tahu 3 alasan utama mengapa ribuan",
                  "keluarga memilih Rancabango \u2014 bukan Bali,",
                  "bukan Lombok, tapi Garut."],
                 568, F("mr", 21), W85, gap=10)

    items = [
        "Hanya 2 jam dari Bandung, tanpa kemacetan parah",
        "Desain & suasana autentik bergaya Bali",
        "Fasilitas keluarga lengkap, harga bersahabat",
    ]
    y = 710
    bf = F("mr", 19)
    for item in items:
        iw, _ = bbox_wh(d, "\u2736", bf)
        x0 = (SIZE - 600) // 2
        d.text((x0, y), "\u2736", font=bf, fill=GOLD)
        d.text((x0 + 26, y), item, font=bf, fill=(255, 255, 255, 210))
        _, h = bbox_wh(d, item, bf)
        y += h + 8

    footer(d, 1)
    save(cv, "carousel-3-slide-1.jpg")


def c3s2():
    """USP 1: Lokasi — Dekat tapi terasa Jauh"""
    cv = make_canvas(2, voffset=0.40, overlay_alpha=0.68)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    text_cx(d, "ALASAN  #1  \u2014  LOKASI", 68, F("msb", 16), GOLD)
    text_cx(d, "\U0001f4cd", 100, F("mr", 68), WHITE)

    multiline_cx(d, ["Dekat,", "tapi terasa"], 190, F("sb", 88), WHITE, gap=-8)
    text_cx(d, "Jauh", 372, F("sb", 88), GOLD)

    text_cx(d, "Dari Bandung hanya 2 jam. Dari Jakarta ~3,5 jam.",
            476, F("mr", 23), W85)

    gold_divider(d, 534, width=100)

    stat_cards(d,
               [("~2 Jam",  "dari Kota Bandung"),
                ("~3.5 Jam","dari Jakarta"),
                ("0 Tiket", "pesawat diperlukan")],
               562, card_w=240, h=108, gap=24)

    text_cx(d, "Hemat jutaan rupiah dibanding liburan ke Bali",
            716, F("mr", 22), W65)

    gold_divider(d, 768, width=80)
    text_cx(d, "Geser \u2192 Alasan #2", 792, F("mr", 18), tc(GOLD, 150))

    footer(d, 2)
    save(cv, "carousel-3-slide-2.jpg")


def c3s3():
    """USP 2: Estetika — Bali itu soal Suasana"""
    cv = make_canvas(0, voffset=0.45, overlay_alpha=0.62)
    d  = new_draw(cv)
    gold_bar_top(d)
    paste_logo(cv)

    text_cx(d, "ALASAN  #2  \u2014  ESTETIKA", 68, F("msb", 16), GOLD_L)
    text_cx(d, "\U0001f3ef", 100, F("mr", 68), WHITE)

    multiline_cx(d, ["Bali itu Bukan", "Soal Lokasi \u2014"], 190, F("sb", 76), WHITE, gap=-8)
    text_cx(d, "Tapi Suasana", 356, F("sb", 76), GOLD)

    text_cx(d, "Dan suasana itu, kami hadirkan di Garut.",
            448, F("mr", 24), W85)

    gold_divider(d, 510)

    # Feature cards
    rows = [
        ("\U0001f3db\ufe0f", "Arsitektur", "Ornamen Bali \u2014 ukiran, kayu, atap alang-alang"),
        ("\U0001f33a", "Taman",       "Tanaman tropis, kolam koi, patung batu, bunga Bali"),
        ("\U0001f4f8", "Foto",        'Ribuan foto tamu buktikan vibes-nya "Bali Banget"'),
    ]
    y = 540
    for icon, title, desc in rows:
        d.rounded_rectangle([100, y, SIZE - 100, y + 88], radius=12,
                             fill=(255, 255, 255, 10), outline=(196, 163, 90, 50), width=1)
        d.text((130, y + 22), icon, font=F("mr", 30), fill=WHITE)
        d.text((192, y + 14), title, font=F("mbd", 22), fill=GOLD_L)
        d.text((192, y + 46), desc,  font=F("mr", 19),  fill=(255, 255, 255, 200))
        y += 104

    text_cx(d, "Geser \u2192 Alasan #3", 878, F("mr", 18), tc(GOLD, 150))
    footer(d, 3)
    save(cv, "carousel-3-slide-3.jpg")


def c3s4():
    """USP 3: Value for Money"""
    cv = make_canvas(1, voffset=0.60, overlay_alpha=0.70)
    d  = new_draw(cv)
    d.rectangle([0, 0, SIZE, 6], fill=(46, 122, 80))  # green bar
    paste_logo(cv)

    text_cx(d, "ALASAN  #3  \u2014  VALUE", 68, F("msb", 16), GREEN_A)
    text_cx(d, "\U0001f4b0", 100, F("mr", 68), WHITE)

    text_cx(d, "Pengalaman Mewah,", 190, F("sb", 72), WHITE)
    text_cx(d, "Budget Masuk Akal", 276, F("sb", 72), GREEN_A)

    text_cx(d, "Liburan kelas resort tanpa menguras tabungan.",
            364, F("mr", 23), W85)

    gold_divider(d, 422, width=110)

    # Comparison cards
    cols = [
        ("\u2708\ufe0f",  "Bali",        ["Rp 5\u201315 juta/keluarga", "PP tiket + hotel 2D1N"],     (255, 100, 100, 255)),
        ("\U0001f3e1",  "Rancabango",  ["Rp 900rb\u20131,2 juta/malam", "sarapan inklusif \u00b7 no tiket"], GREEN_A),
        ("\U0001f49a",  "Hemat",       ["Hingga 70% lebih", "terjangkau dari Bali"],              GREEN_A),
    ]
    cx_list = [190, 540, 890]
    for (icon, title, desc_lines, col), cx in zip(cols, cx_list):
        x0, y0 = cx - 140, 450
        d.rounded_rectangle([x0, y0, x0 + 280, y0 + 230], radius=14,
                             fill=(255, 255, 255, 8), outline=(*col[:3], 60), width=1)
        iw, _ = bbox_wh(d, icon, F("mr", 36))
        d.text((cx - iw // 2, y0 + 14), icon, font=F("mr", 36), fill=WHITE)
        tw, _ = bbox_wh(d, title, F("mbd", 22))
        d.text((cx - tw // 2, y0 + 68), title, font=F("mbd", 22), fill=col)
        ty = y0 + 104
        for line in desc_lines:
            lw, lh = bbox_wh(d, line, F("mr", 17))
            d.text((cx - lw // 2, ty), line, font=F("mr", 17), fill=(255, 255, 255, 175))
            ty += lh + 6

    text_cx(d, "Geser \u2192 Testimonial Tamu", 730, F("mr", 18), tc(GREEN_A, 150))
    footer(d, 4)
    save(cv, "carousel-3-slide-4.jpg")


def c3s5():
    """Testimonial + CTA"""
    cv = make_canvas(2, voffset=0.50, overlay_alpha=0.58)
    d  = new_draw(cv)
    d.rectangle([0, 0, SIZE, 8], fill=TEAL_D[:3])           # top bar
    d.rectangle([0, SIZE - 118, SIZE, SIZE], fill=(*TEAL_D[:3], 232))  # bottom strip
    paste_logo(cv)

    # Decorative quote mark
    d.text((54, 76), "\u201c", font=F("sb", 180), fill=(61, 122, 138, 38))

    # Quote
    multiline_cx(d,
                 ["Jujur awalnya skeptis, tapi begitu sampai",
                  "langsung ngerasa \u2018ini beneran mirip Bali!\u2019",
                  "Anak-anak nggak mau pulang, kita pun sama."],
                 188, F("si", 36), (255, 255, 255, 230), gap=10)

    # Stars
    text_cx(d, "\u2605\u2605\u2605\u2605\u2605", 356, F("mr", 30), GOLD)
    text_cx(d, "\u2014 Ibu Sari, tamu dari Bandung  \u00b7  April 2026",
            402, F("mr", 20), W65)

    gold_divider(d, 460)

    # CTA buttons
    d.rounded_rectangle([120, 492, 508, 574], radius=40, fill=(*TEAL_D[:3], 230))
    d.rounded_rectangle([534, 492, 958, 574], radius=40, fill=(*WA_GRN[:3], 232))

    btn_f = F("mbd", 22)
    # Left button text center
    lt = "\U0001f4c5  Juli 2026"
    lw, lh = bbox_wh(d, lt, btn_f)
    d.text((314 - lw // 2, 492 + (82 - lh) // 2), lt, font=btn_f, fill=WHITE)
    # Right button text center
    rt = "📲  Pesan Sekarang"
    rw, rh = bbox_wh(d, rt, btn_f)
    d.text((746 - rw // 2, 492 + (82 - rh) // 2), rt, font=btn_f, fill=WHITE)

    # Bottom info strip
    bot_f  = F("mr", 17)
    bi = [("Rancabango Hotel & Resort", 170, (255, 255, 255, 180)),
          ("rancabangohotel.com",        540, (255, 255, 255, 140)),
          ("@rancabango_hotel",          910, GOLD)]
    for text, cx, col in bi:
        tw, _ = bbox_wh(d, text, bot_f)
        d.text((cx - tw // 2, SIZE - 76), text, font=bot_f, fill=col)

    footer(d, 5)
    save(cv, "carousel-3-slide-5.jpg")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\nGenerating Rancabango Carousel — Liburan Sekolah Juli 2026\n")

    print("Carousel 1: Paket Liburan Sekolah")
    c1s1(); c1s2(); c1s3(); c1s4(); c1s5()

    print("\nCarousel 2: 5 Fasilitas untuk Keluarga")
    c2s1(); c2s2(); c2s3(); c2s4(); c2s5()

    print("\nCarousel 3: Bali di Garut")
    c3s1(); c3s2(); c3s3(); c3s4(); c3s5()

    print(f"\n\u2728 Done! 15 JPG saved to:\n{OUT}\n")
