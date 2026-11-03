# Hardware Explorer: desain dan catatan teknis

Situs satu halaman dengan pengalaman 3D yang **benar-benar digerakkan posisi gulir**. Dibangun di atas repositori `hallmark` sebagai dasar rupa.

## Tentang gambar referensi

Saya mencari berkas gambar yang diunggah terpisah di `/home/user`, `/tmp`, `/mnt/data`, `/workspace` dan di dalam repo. **Tidak ada berkas referensi baru yang ditemukan** pada sesi ini. Karena itu, sesuai permintaan pertama Anda, saya memakai dua gambar referensi yang memang ada di repositori sebagai arah visual utama:

- `site/assets/themes/blueprint.webp`, contoh halaman tema **Blueprint**.
- `site/assets/themes/vantage.webp`, contoh halaman tema **Vantage** dengan visualisasi teknis tiga dimensi.

Keduanya dibaca ulang sebelum desain dibuat. Bila gambar referensi baru diunggah kemudian, palet, komposisi dan perlakuan cahaya bisa saya selaraskan lagi tanpa mengubah sistem gulir 3D-nya.

## Analisis visual referensi

| Unsur | Blueprint | Vantage | Terjemahan di Hardware Explorer |
| --- | --- | --- | --- |
| Gaya keseluruhan | Lembar gambar arsitektur, biru Prusia | Ruang teknis gelap, objek 3D terukur | Satu lembar biru terus-menerus, kanvas 3D tetap di belakang seluruh halaman |
| Komposisi | Judul besar kiri, citra kanan, ruang kosong luas | Objek 3D di tengah, angka di tepi | Teks di kiri pada hero, lalu kolom kanan untuk tujuh tahap, objek 3D tetap di tengah |
| Palet | Biru tua, tinta putih, tanpa warna kedua | Hitam, tinta putih, satu sinyal terang | `--color-paper` biru Prusia, `--color-ink` putih, garis putih sebagai satu-satunya sinyal |
| Tipografi | Chakra Petch kapital, IBM Plex Sans, mono untuk ukuran | Grotesk teknis, angka mono | Chakra Petch 600 kapital untuk h1/h2, IBM Plex Sans untuk teks, IBM Plex Mono untuk angka |
| Jarak dan proporsi | Keyline 1 px, sudut persegi, tanpa kartu | Grid halus, banyak ruang negatif | Satu wadah 1240 px, satu jarak kolom, garis 1 px dan 2 px, radius nol |
| Latar | Kertas biru, garis grid gambar kerja | Gelap dengan butiran data | Grid 24 px dan 120 px pada `.backdrop`, kanvas transparan di atasnya |
| Objek 3D | Foto cyanotype bangunan | Awan titik dan struktur 3D | Papan induk prosedural dengan CPU, pendingin, RAM, GPU, penyimpanan, regulator dan port |
| Cahaya | Cetak cyanotype, kontras datar | Rim light pada objek | Hemisphere, satu directional key dengan bayangan, satu rim, satu fill |
| Animasi | Hampir statis, garis boleh tergambar sekali | Objek teknis diam, data berubah | Tidak ada animasi otonom; semua perubahan berasal dari progress gulir |
| Navigasi | Markah kata, tiga tautan, satu tombol | Bar atas ringkas | Palang atas lengket dengan markah, tiga tautan, satu tombol isi |
| Interaksi | Tautan bergaris, tombol kotak | Angka ukur | HUD tahap, rel progress, register komponen, diagram lepas alternatif |

Prinsip yang dipertahankan: **satu bidang, satu warna sinyal, tipografi teknis, keyline bukan kartu, objek menjadi pusat, teks pendek**. Yang diubah untuk konsep edukatif: objeknya bukan bangunan atau awan titik, melainkan papan induk yang bisa dibongkar; tipografi kapital dipakai hanya pada judul; angka yang ditampilkan adalah satuan adegan, bukan spesifikasi perangkat karangan.

## Integrasi 3D dan gulir

- **Satu kanvas tetap**, bukan beberapa section yang di-pin. `position: fixed` pada `#scene` dan `.backdrop`, konten mengalir alami di atasnya. Tidak ada `ScrollTrigger.pin`.
- **Satu master timeline** `gsap.timeline` dengan `ScrollTrigger` `scrub: 0.8`, `trigger: #journey`, `start: 'top top'`, `end: 'bottom bottom'`.
- Timeline menggerakkan secara bersamaan: `camera.position`, titik `lookAt`, `rig.rotation`, dan `position` + `rotation` tujuh grup komponen.
- `onUpdate` timeline menyalakan `needsRender`, menyinkronkan kelas `.is-active` pada tujuh artikel teks, mengisi HUD, dan mengumumkan tahap lewat `aria-live`.

### Jalur kamera

| Tahap | Posisi kamera | Titik pandang | Kejadian pada objek |
| --- | --- | --- | --- |
| 00 | 0, 7.5, 13.5 | 0, 0.2, 0 | Rakit utuh |
| 01 | -1.4, 3.4, 4.2 | -1.4, 0.5, -0.7 | CPU dan pendingin naik |
| 02 | 2.2, 3.0, 3.8 | 2.1, 0.6, -1.0 | Memori naik |
| 03 | 0.4, 2.6, 5.0 | 0.2, 0.5, 1.6 | Kartu grafis naik |
| 04 | 3.0, 2.8, 4.6 | 2.4, 0.4, 1.9 | Penyimpanan, regulator, port naik |
| 05 | 0, 9.5, 15.5 | 0, 1.2, 0 | Semua bagian ke posisi lepas, rotasi kecil |
| 06 | 0, 6.8, 12.5 | 0, 0.2, 0 | Semua kembali ke posisi asal, papan utuh |

Satuan di atas adalah satuan adegan Three.js, bukan ukuran fisik perangkat.

### Objek

Papan induk, jalur tembaga, lubang baut, soket, prosesor, heatsink, kipas, empat keping memori, kartu grafis dengan dua kipas, drive, blok regulator dan port belakang seluruhnya `Mesh` / `LineSegments` asli. Tidak ada gambar diam, tidak ada CSS transform yang berdiri sendiri sebagai pengganti adegan 3D. Tekstur hanya satu `CanvasTexture` grid 512 px yang dibangun di memori.

## Persyaratan teknis

| Persyaratan | Pemenuhan |
| --- | --- |
| Three.js / GLTF | Objek Three.js prosedural, `vendor/three.module.js` + `three.core.js` r0.187.0 |
| GSAP ScrollTrigger scrub | `vendor/gsap.min.js` + `ScrollTrigger.min.js` 3.15.0, satu timeline `scrub: 0.8` |
| Sinkronisasi kamera, objek, teks | Master timeline + `onUpdate` mengatur tujuh artikel, HUD dan `aria-live` |
| Jalur kamera terkendali | Tujuh posisi eksplisit, `ease: 'none'`, transisi halus dari `scrub` |
| Gulir browser alami | Tidak ada pin, tidak ada overflow bersarang, `overflow-x: clip` |
| Pin berlebih | Nol section di-pin, satu kanvas tetap |
| Alternatif mobile | DPR maks 1.25, antialias dan bayangan mati, layout satu kolom, register tabel dan `<details>` diagram lepas |
| Reduced motion | `prefers-reduced-motion` mematikan timeline, menampilkan rakit utuh statis dan seluruh teks |
| Performa | Render sesuai kebutuhan lewat `gsap.ticker`, `IntersectionObserver`, jeda saat `document.hidden`, geometri dipakai ulang, satu tekstur, tanpa berkas eksternal |

## Mutu dan cara menjalankan

```sh
python3 -m http.server 4174 --bind 0.0.0.0 --directory hardware-explorer
```

Pemeriksaan linter bawaan repo:

```sh
node skills/hallmark/scripts/sloplint.mjs hardware-explorer/index.html hardware-explorer/style.css --genre modern-minimal
```

Hasil: **0 FAIL, 0 REFLEX, 0 WARN**. Smoke test Node dengan `WebGLRenderer` bertubit juga lolos: seluruh geometri, material, pembacaan token warna, master timeline dan sinkronisasi UI terbentuk tanpa error runtime. Tingkat `--render` belum dijalankan karena sandbox tidak memiliki Chrome atau `puppeteer-core`; lipatan, kontras piksel dan fokus dengan tab perlu dicek di browser pratinjau. Font dimuat dari Google Fonts dengan fallback `ui-sans-serif`, `ui-serif`, `ui-monospace`.

## Berkas

| Berkas | Isi |
| --- | --- |
| `index.html` | Hero, tujuh tahap teks, register, diagram alternatif, penutup |
| `style.css` | Token Blueprint, keyline, kanvas tetap, HUD, media query, reduced motion |
| `app.js` | Adegan Three.js, pembacaan token warna, master timeline, sinkronisasi UI |
| `vendor/` | Three.js dan GSAP ScrollTrigger lokal, tanpa CDN |
| `DESIGN.md` | Dokumen ini |
