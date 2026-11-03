#!/usr/bin/env python3
"""Bangun ulang halaman katalog dari data desain di repositori Hallmark.

Sumber:
  skills/hallmark/references/themes/index.json
  skills/hallmark/references/themes/<slug>.md   (token warna dan huruf)
  site/assets/themes/*.webp                    (gambar contoh, disalin)
  site/assets/desk/*.webp                     (tiga pelat contoh, disalin)

Jalankan dari mana saja:  python3 design/build.py
Hasil: design/themes.js, design/index.html, design/assets/
"""

from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
REF = ROOT / "skills" / "hallmark" / "references" / "themes"
SITE_ASSETS = ROOT / "site" / "assets"

GENRE_LABEL = {
    "editorial": "Editorial",
    "modern-minimal": "Modern minimal",
    "atmospheric": "Atmospheric",
    "playful": "Playful",
}
GENRE_ORDER = ["editorial", "modern-minimal", "atmospheric", "playful"]


def token(md: str, name: str) -> str | None:
    m = re.search(r"--" + re.escape(name) + r":\s*([^;]+);", md)
    return m.group(1).strip() if m else None


def read_themes() -> list[dict]:
    entries = json.loads((REF / "index.json").read_text())["themes"]
    out = []
    for t in entries:
        md = (REF / (t["slug"] + ".md")).read_text()
        out.append(
            {
                "slug": t["slug"],
                "name": t["name"],
                "genre": t["genre"],
                "posture": t["posture"],
                "material": t["material"],
                "display": t["display"]["face"],
                "paperBand": t["paper"]["band"],
                "paperL": t["paper"]["L"],
                "paperHue": t["paper"]["hue"],
                "accentBand": t["accent"]["band"],
                "accentHue": t["accent"]["hue"],
                "pictured": t["pictured"],
                "colors": {
                    "paper": token(md, "color-paper"),
                    "ink": token(md, "color-ink"),
                    "accent": token(md, "color-accent"),
                },
                "fonts": {
                    "display": token(md, "font-display"),
                    "body": token(md, "font-body"),
                },
            }
        )
    return out


def copy_assets() -> None:
    (HERE / "assets" / "themes").mkdir(parents=True, exist_ok=True)
    (HERE / "assets" / "plates").mkdir(parents=True, exist_ok=True)
    for src in sorted((SITE_ASSETS / "themes").glob("*.webp")):
        shutil.copy2(src, HERE / "assets" / "themes" / src.name)
    for slug in ("hedgerow", "atelier", "furrow", "dusk"):
        src = SITE_ASSETS / "desk" / (slug + ".webp")
        if src.exists():
            shutil.copy2(src, HERE / "assets" / "plates" / src.name)


def rows_html(themes: list[dict]) -> str:
    lines = []
    for i, t in enumerate(themes, start=1):
        active = "true" if t["slug"] == "almanac" else "false"
        lines.append(
            "          <li><button type=\"button\" class=\"baris\" data-slug=\"{slug}\" "
            "data-genre=\"{genre}\" aria-pressed=\"{active}\">"
            "<span class=\"num\">{no:02d}</span>"
            "<span class=\"baris__nama\">{name}</span>"
            "<span class=\"baris__kertas num\">{paper}%</span>"
            "</button></li>".format(
                slug=html.escape(t["slug"], quote=True),
                genre=html.escape(t["genre"], quote=True),
                active=active,
                no=i,
                name=html.escape(t["name"]),
                paper=t["paperL"],
            )
        )
    return "\n".join(lines)


def filter_html(themes: list[dict]) -> str:
    counts = {g: sum(1 for t in themes if t["genre"] == g) for g in GENRE_ORDER}
    parts = [
        '          <button type="button" class="seg__tombol" data-genre="all" aria-pressed="true">Semua <span class="num">50</span></button>'
    ]
    for g in GENRE_ORDER:
        parts.append(
            '          <button type="button" class="seg__tombol" data-genre="{g}" aria-pressed="false">{label} <span class="num">{n}</span></button>'.format(
                g=g, label=GENRE_LABEL[g], n=counts[g]
            )
        )
    return "\n".join(parts)


HTML = """<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <title>Katalog bahan Hallmark, bahasa rupa untuk web</title>
  <meta name="description" content="Lima puluh tema Hallmark sebagai bahan desain: kertas, huruf, warna dan permukaan, disusun dari isi repositori.">
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="themes.js" defer></script>
  <script src="app.js" defer></script>
</head>
<body>
  <a class="skip" href="#utama">Lewati ke isi</a>

  <header class="bar">
    <div class="wrap bar__in">
      <a class="brand" href="#atas" aria-label="Hallmark, kembali ke atas"><span class="brand__slash" aria-hidden="true">/</span>hallmark</a>
      <nav class="bar__nav" aria-label="Bagian halaman">
        <a href="#katalog">Katalog</a>
        <a href="#aturan">Aturan</a>
        <a href="#alur">Alur</a>
      </nav>
      <a class="btn btn--garis" href="https://github.com/charyuseai-cmd/hallmark">Buka repositori</a>
    </div>
  </header>

  <main id="utama">

    <section class="hero" id="atas" aria-labelledby="judul">
      <div class="wrap hero__grid">
        <div class="hero__text">
          <h1 id="judul">Desain yang terasa dibuat, bukan dihasilkan.</h1>
          <p class="lede">Lima puluh tema, aturan lantai yang tegas, dan pemeriksaan di browser nyata.</p>
          <div class="aksi">
            <a class="btn btn--isi" href="#katalog">Jelajahi katalog</a>
            <a class="btn btn--garis" href="#aturan">Baca aturannya</a>
          </div>
          <p class="fine">Edisi 2.0.0. Disusun dari isi repositori Hallmark.</p>
        </div>

        <figure class="lembar" aria-labelledby="lembar-judul">
          <div class="lembar__kepala">
            <h2 id="lembar-judul">Bahan halaman ini</h2>
            <span class="num">01 / 50</span>
          </div>
          <img class="lembar__gambar" src="assets/themes/almanac.webp" width="400" height="250" alt="Contoh halaman bertema Almanac, tabel pasang surut di atas kertas biru keabuan." fetchpriority="high">
          <dl class="spesimen">
            <div><dt>Kertas</dt><dd>Slate 84%, rona 245</dd></div>
            <div><dt>Huruf</dt><dd>Hanken Grotesk 600, Newsreader 400</dd></div>
            <div><dt>Sinyal</dt><dd>Magenta 45%, rona 350</dd></div>
          </dl>
        </figure>
      </div>
    </section>

    <section class="bag" id="katalog" aria-labelledby="katalog-judul">
      <div class="wrap">
        <div class="kepala">
          <h2 id="katalog-judul">Katalog 50 bahan</h2>
          <p class="lede">Satu tema adalah satu material. Isi halaman ditentukan oleh pekerjaannya.</p>
        </div>

        <div class="katalog">
          <div class="katalog__kiri">
            <div class="seg" role="group" aria-label="Saring tema berdasarkan genre">
<!-- FILTERS -->
            </div>
            <ol class="daftar" data-daftar>
<!-- ROWS -->
            </ol>
            <div class="kaki-daftar">
              <button type="button" class="btn btn--garis" data-acak>Acak satu tema</button>
            </div>
          </div>

          <div class="katalog__kanan">
            <figure class="pratinjau" data-pratinjau>
              <img src="assets/themes/almanac.webp" width="400" height="250" alt="Contoh halaman bertema Almanac, Workbench, Stage hero." data-gambar>
              <figcaption data-caption>Almanac. Workbench, Stage hero.</figcaption>
            </figure>
            <div class="rincian">
              <h3 data-nama>Almanac</h3>
              <p class="bahan" data-bahan>Cool slate stock, blue-black ink, Hanken Grotesk over Newsreader, one chart magenta.</p>
              <dl class="data">
                <div><dt>Genre</dt><dd data-genre>Editorial</dd></div>
                <div><dt>Huruf tampilan</dt><dd data-huruf>Hanken Grotesk</dd></div>
                <div><dt>Kertas</dt><dd data-kertas>Mid, 84%, rona 245</dd></div>
                <div><dt>Sinyal</dt><dd data-sinyal>chromatic-magenta, rona 350</dd></div>
              </dl>
              <div class="swatch" data-swatch aria-label="Tiga warna pokok tema yang dipilih">
                <span class="swatch__item"><i aria-hidden="true"></i>Kertas</span>
                <span class="swatch__item"><i aria-hidden="true"></i>Tinta</span>
                <span class="swatch__item"><i aria-hidden="true"></i>Sinyal</span>
              </div>
              <a class="tautan" data-link href="https://www.usehallmark.com/themes/almanac/">Lihat halaman tema ini</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bag" id="aturan" aria-labelledby="aturan-judul">
      <div class="wrap">
        <div class="kepala">
          <h2 id="aturan-judul">Aturan yang tidak ditawar</h2>
          <p class="lede">Empat dari enam belas aturan lantai.</p>
        </div>
        <ol class="aturan">
          <li>
            <h3>Warna lewat token</h3>
            <p>Setiap warna dan huruf dideklarasikan di root, tidak ditulis langsung.</p>
          </li>
          <li>
            <h3>Fokus muncul seketika</h3>
            <p>Kendali punya keadaan fokus, aktif dan nonaktif. Cincin fokus tanpa transisi.</p>
          </li>
          <li>
            <h3>Tanpa label kecil</h3>
            <p>Tidak ada eyebrow atau kapital berjarak. Keterangan memakai wajah teks.</p>
          </li>
          <li>
            <h3>Gerak punya jalan mundur</h3>
            <p>Isi terbaca tanpa skrip. Transisi punya pengganti saat gerak dikurangi.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="banding" id="alur" aria-labelledby="alur-judul">
      <div class="wrap">
        <div class="kepala kepala--banding">
          <h2 id="alur-judul">Dari kalimat ke halaman</h2>
          <p class="lede">Empat langkah yang tercatat di README repositori.</p>
        </div>
        <table class="alur">
          <thead>
            <tr><th scope="col">No</th><th scope="col">Tahap</th><th scope="col">Keluaran</th></tr>
          </thead>
          <tbody>
            <tr><td class="num">01</td><td>Pre-flight</td><td>Bahan nyata dibaca sekali.</td></tr>
            <tr><td class="num">02</td><td>Deal</td><td>Tiga tema ditawarkan, satu dipilih.</td></tr>
            <tr><td class="num">03</td><td>Build</td><td>Hero dibangun dan diulas dulu.</td></tr>
            <tr><td class="num">04</td><td>Sweep</td><td>Linter berjalan, lalu ulasan segar.</td></tr>
          </tbody>
        </table>
        <div class="salinan">
          <p class="salinan__kalimat">Satu baris untuk memasangnya.</p>
          <div class="salinan__kotak">
            <code>npx skills add nutlope/hallmark -g</code>
            <button class="btn btn--garis btn--kecil" type="button" data-salin aria-label="Salin perintah pemasangan">
              <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.25" y="5.25" width="8" height="8" rx="1.5"/><path d="M10.75 5.25V4.5a1.75 1.75 0 0 0-1.75-1.75H4.5A1.75 1.75 0 0 0 2.75 4.5V9a1.75 1.75 0 0 0 1.75 1.75h.75"/></svg>
              <span data-salin-teks>Salin perintah</span>
            </button>
          </div>
          <p class="fine" data-status aria-live="polite"></p>
        </div>
      </div>
    </section>

    <section class="bag" id="pelat" aria-labelledby="pelat-judul">
      <div class="wrap">
        <div class="kepala">
          <h2 id="pelat-judul">Tiga halaman jadi</h2>
          <p class="lede">Gambar contoh dari repositori.</p>
        </div>
        <div class="pelat-grid">
          <figure class="pelat">
            <img src="assets/plates/hedgerow.webp" width="960" height="600" alt="Halaman Five Mile Gin dalam tema Hedgerow." loading="lazy">
            <figcaption>Hedgerow, Five Mile Gin.</figcaption>
          </figure>
          <figure class="pelat">
            <img src="assets/plates/atelier.webp" width="960" height="600" alt="Halaman Maison Orla dalam tema Atelier." loading="lazy">
            <figcaption>Atelier, Maison Orla.</figcaption>
          </figure>
          <figure class="pelat">
            <img src="assets/plates/furrow.webp" width="960" height="600" alt="Halaman Fieldbook dalam tema Furrow." loading="lazy">
            <figcaption>Furrow, Fieldbook.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  </main>

  <footer class="kaki">
    <div class="wrap kaki__grid">
      <div>
        <a class="brand brand--kaki" href="#atas"><span class="brand__slash" aria-hidden="true">/</span>hallmark</a>
        <p>Desain berdasarkan repositori Hallmark, lisensi MIT.</p>
      </div>
      <div>
        <p class="kaki__judul">Pasang</p>
        <code>npx skills add nutlope/hallmark -g</code>
      </div>
      <div>
        <p class="kaki__judul">Sumber</p>
        <a href="https://github.com/charyuseai-cmd/hallmark">Repositori GitHub</a>
        <a href="https://www.usehallmark.com">usehallmark.com</a>
      </div>
    </div>
    <div class="wrap">
      <p class="kaki__bawah">Foto dari Wikimedia Commons. Teks bahan dari berkas rujukan repositori.</p>
    </div>
  </footer>
</body>
</html>
"""


def main() -> None:
    themes = read_themes()
    copy_assets()
    (HERE / "themes.js").write_text(
        "/* Sumber: skills/hallmark/references/themes/index.json dan references/themes/<slug>.md.\n"
        " * Dihasilkan oleh design/build.py. Jangan ubah langsung, ubah sumbernya di repositori. */\n"
        "window.HALLMARK_THEMES = "
        + json.dumps(themes, ensure_ascii=False, indent=1)
        + ";\n"
    )
    page = HTML.replace("<!-- FILTERS -->", filter_html(themes)).replace(
        "<!-- ROWS -->", rows_html(themes)
    )
    (HERE / "index.html").write_text(page)
    print(f"Dibangun: {len(themes)} tema, {HERE / 'index.html'}, {HERE / 'themes.js'}")


if __name__ == "__main__":
    main()
