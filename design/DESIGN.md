# Desain website: Katalog bahan Hallmark

Desain baru untuk sebuah situs satu halaman yang memakai repositori `hallmark` sebagai satu-satunya sumber rupa. Hasilnya ada di `design/index.html`, langsung bisa dibuka lewat pratinjau langsung.

## Dasar yang diambil dari repositori

| Unsur | Sumber | Cara dipakai |
| --- | --- | --- |
| Material halaman | `skills/hallmark/references/themes/almanac.md` | Tema **Almanac** dipilih karena kata kuncinya `reference`, `catalogue`, `index`, `handbook`. Halaman ini memang sebuah katalog rujukan, jadi materialnya kertas slate, tinta biru tua, dua bobot garis, sudut persegi, tanpa kartu dan tanpa bayangan. |
| Token warna dan huruf | `skills/hallmark/references/themes/almanac.md` | Seluruh `oklch()` dan keluarga huruf dideklarasikan di `:root` pada `style.css`. Tiga wajah: Hanken Grotesk untuk judul, Newsreader untuk teks, IBM Plex Mono untuk angka. |
| Data 50 tema | `skills/hallmark/references/themes/index.json` | Nama, genre, material, wajah huruf, nada kertas dan rona aksen dibaca langsung dari berkas rujukan. Tidak ada tema atau angka karangan. |
| Warna tiap tema | `skills/hallmark/references/themes/<slug>.md` | Tiga token `--color-paper`, `--color-ink`, `--color-accent` diekstrak untuk tiga swatch pada pratinjau. |
| Gambar | `site/assets/themes/*.webp`, `site/assets/desk/*.webp` | 50 gambar contoh tema dan empat pelat disalin ke `design/assets/`. Kredit foto mengikuti catatan repositori: Wikimedia Commons dengan lisensi masing-masing. |
| Aturan lantai | `skills/hallmark/SKILL.md` | 16 aturan lantai dipatuhi, empat di antaranya ditulis di halaman. Fokus, gerak yang dikurangi, konten tanpa skrip, tanpa eyebrow, tanpa metrik karangan. |
| Motif tanda tangan | `site/index.html` dan `site/style.css` | Markah kata `/hallmark` dengan garis miring berwarna, gagasan "deal" menjadi tombol **Acak satu tema**, dan pratinjau yang berubah saat satu baris dipilih. |

## Keputusan rupa

- **Bentuk:** Workbench. Katalog 50 baris di kiri, pratinjau yang menempel di kanan. Layar pertama memasangkan judul dengan sebuah lembar spesimen berisi token Almanac.
- **Postur:** restrained. Magenta hanya pada garis miring, satu tombol isi, angka urut aturan, dan garis aktif pada daftar. Porsinya di bawah lima persen layar.
- **Satu band gelap:** bagian alur kerja memakai bidang tinta biru tua. Bagian lain tetap pada kertas slate. Tidak ada gradien, tidak ada kartu bersarang.
- **Jarak:** satu lebar kolom untuk semua bagian multi-kolom, satu wadah maksimum 1240 px, garis 1 px dan 2 px sebagai satu-satunya pembatas.
- **Bahasa:** seluruh antarmuka berbahasa Indonesia. Kutipan `material` tema tetap dalam bahasa Inggris karena itu teks asli repositori.

## Isi halaman

1. **Layar pertama** — judul enam kata, satu kalimat, dua tindakan, lembar spesimen Almanac.
2. **Katalog 50 bahan** — saringan empat genre, daftar 50 baris, pratinjau gambar, keterangan material, tiga swatch warna, tautan ke halaman tema, dan pemilih acak.
3. **Aturan yang tidak ditawar** — empat aturan lantai sebagai daftar bernomor.
4. **Dari kalimat ke halaman** — empat langkah alur kerja pada bidang gelap, plus perintah pasang yang bisa disalin.
5. **Tiga halaman jadi** — pelat Hedgerow, Atelier dan Furrow.
6. **Kaki** — sumber, lisensi, perintah pasang, kredit foto.

## Menjalankan dan membangun ulang

Pratinjau langsung memakai server statis:

```sh
python3 -m http.server 4174 --bind 0.0.0.0 --directory design
```

Data halaman dihasilkan ulang dari repositori, bukan diketik ulang:

```sh
python3 design/build.py
```

`build.py` menulis `themes.js` dan `index.html`, lalu menyalin aset gambar. `style.css`, `app.js` dan `DESIGN.md` ditulis tangan dan tidak ditimpa.

Pemeriksaan mutu memakai linter bawaan repositori:

```sh
node skills/hallmark/scripts/sloplint.mjs design/index.html design/style.css --genre editorial
```

Hasil pemeriksaan statis: **0 FAIL, 0 REFLEX, 0 WARN**. Tingkat `--render` tidak dijalankan di sandbox ini karena tidak ada Chrome atau `puppeteer-core`; ukuran lipatan, kontras piksel dan fokus dengan tab perlu diverifikasi di browser saat pratinjau hidup. Kontras pasangan warna utama sudah dihitung manual: tinta di atas kertas 7,19:1, kertas di atas tinta 7,19:1, magenta di atas kertas 5,35:1.

## Berkas

| Berkas | Isi |
| --- | --- |
| `index.html` | Halaman jadi, 50 baris tetap terbaca tanpa JavaScript. |
| `style.css` | Token, tata letak, keadaan kendali, media query. Baris pertama adalah cap Hallmark. |
| `app.js` | Pemilih tema, saringan genre, pemilih acak, salin perintah. |
| `themes.js` | Data 50 tema hasil ekstraksi. |
| `build.py` | Pembangun ulang dari sumber repositori. |
| `assets/` | 50 gambar tema dan empat pelat contoh. |
