# Hardware Explorer · edisi Vantage

Remake penuh dari Hardware Explorer. Sistem rupa, komposisi dan objek 3D diganti; **seluruh konten dan kabel tetap**: tujuh tahap edukatif, kamera yang mendekati CPU/RAM/GPU, komponen yang lepas, tampilan exploded, kembali ke posisi semula, dan penutup rakit utuh.

## Catatan gambar referensi

Sampai turn ini **tidak ada berkas gambar yang diunggah pengguna** ke workspace, meski brief awal meminta gambar referensi dipakai sebagai arahan utama. Yang tersedia hanyalah aset repo. Karena itu arahan visual diambil dari dua berkas repo, bukan dari unggahan:

| Berkas | Yang dibaca |
| --- | --- |
| `skills/hallmark/references/themes/vantage.jpg` | Ground biru-hitam, point cloud objek hasil pindai, sweep yang menyalakan titik, Geologica 300 dengan sudut tajam, bingkai hairline dengan corner ticks, angka dengan satuan, satu sinyal lime untuk yang ditemukan |
| `site/assets/themes/vantage.webp` | Tangkapan layar tema yang sama: visualisasi teknis 3D gelap, label ukur, metrik, lime hanya pada penanda |
| `site/assets/themes/blueprint.webp` | Dipakai pada versi sebelumnya (cyanotype), sengaja ditinggalkan agar remake tidak menjadi restyle |

Prinsip yang diterjemahkan: ground gelap tanpa gradien, titik tanpa garis penghubung dan tanpa bloom, tinta baja, tipografi sentence case tanpa mono, angka tabular dengan satuan, frame hanya di sudut, lime khusus untuk *ditemukan / hidup / aksi utama*. Bila gambar referensi kemudian diunggah, analisis ulang sebelum hasil dianggap final.

## Arahan repo yang dijalankan

| Langkah | Perintah | Hasil |
| --- | --- | --- |
| Deal | `theme.mjs deal --genre modern-minimal --prompt "three dimensional point cloud scan of a computer motherboard..."` | 1. Vantage · 2. Rim · 3. Cobalt |
| Pilih | Lihat `vantage.jpg`, `rim.jpg`, `cobalt.jpg` | **Vantage**: materialnya memang pindai 3D; Rim mengandalkan foto udara, Cobalt mengandalkan lembar ASCII terang |
| Draw | `theme.mjs draw --material product --job try --theme vantage` | `180c3e` · Narrative Workflow · hero Corridor · nav floating pill · footer statement |
| Scaffold | `theme.mjs scaffold vantage --dealt "1/3, seed ..."` | `tokens.css` + `base.css`, stamp dan import |
| Gates | `SKILL.md` Floor, `gates.md` § 1–4, `craft.md`, `layout.md`, `scroll-choreography.md` | satu pola gulir, bukan dua |

Satu penyimpangan yang dicatat: Vantage menggerakkan awan titik dan sweep secara otonom, tetapi brief inti melarang autoplay berbasis waktu. **Sapuan dan rotasi kamera sepenuhnya digerakkan `ScrollTrigger scrub`**, sehingga aturan pengguna mengalahkan tema. Rotasi lambat otonom tidak dipakai.

## Picks

**Hallmark · v2.0.0**

- **Redesign** · full · 1 halaman (`hardware-explorer/`) · before: cyanotype Blueprint statis, tujuh tahap
- **Keeps** · semua tautan, `id`, handler, tujuh tahap teks, register, diagram alternatif · wiring Three.js + GSAP ScrollTrigger
- **Files** · edit: `index.html`, `style.css`, `app.js`, `DESIGN.md`, `Hardware-Explorer-standalone.html` · create: `tokens.css`, `base.css` · delete: none
- **Shape** · Narrative Workflow, draw `180c3e` · genre modern-minimal · job: try
- **Theme** · Vantage, dealt 1/3 · `vantage: object/steel` · mengalahkan Rim dan Cobalt karena bendanya adalah pindai 3D, bukan foto atau field ASCII
- **Chrome** · nav: floating pill · footer: statement
- **Hero** · Corridor: head di lima kolom kiri, awan titik di tujuh kolom kanan, satu angka dalam corner ticks, satu callout hidup
- **Signature** · papan induk berupa point cloud yang mengeraskan menjadi geometri padu saat gulir menjalankan sapuan lime
- **Sections** · Hero · Penjelajahan · Lapisan · Register pindai · Potongan · Utuh kembali · Footer
- **Material** · real: tujuh posisi kamera, tujuh grup komponen, empat lapisan titik · pictures: produk dibangun live · absent: logo, kutipan, metrik, foto stok
- **Sweep** · `0 FAIL · 0 REFLEX · 0 WARN` (static) · `--render` tidak dijalankan

## Adegan 3D

| Tahap | Kamera | Fokus | Yang terjadi |
| --- | --- | --- | --- |
| 00 | `(0, 7.5, 13.5)` | Rakit utuh | Awan titik penuh, sapuan di bawah papan |
| 01 | `(-3.0, 2.8, 4.8)` | CPU | Sapuan melewati soket, cpu terangkat, solid cpu mengeras |
| 02 | `(2.8, 2.6, 4.4)` | RAM | Empat keping naik, kamera bergeser kanan |
| 03 | `(0.6, 2.2, 5.4)` | GPU | Kartu dan dua kipas terangkat dari slot |
| 04 | `(4.4, 3.0, 5.2)` | Daya dan simpan | Drive, regulator dan port ikut lepas |
| 05 | `(0, 9.5, 15.5)` | Exploded | Semua grup bergerak keluar dengan rotasi kecil |
| 06 | `(0, 6.8, 12.5)` | Assembly | Semua kembali ke `home`, papan utuh |

Objeknya asli: `BoxGeometry`, `CylinderGeometry`, `LineSegments` jalur tembaga, `MeshStandardMaterial`, dan `THREE.Points` dengan `ShaderMaterial`. Tidak ada GLB, tekstur eksternal, atau gambar diam. Titik diambil dari permukaan geometri yang sama, sehingga ikut bergerak saat komponen lepas. Shader membaca `uSweepY`, `uFoundGroup` dan empat `uLayer*` dari satu timeline yang sama.

## Interaksi dan akses

- **Satu timeline** `gsap.timeline` dengan `ScrollTrigger` `trigger: #journey`, `start: top top`, `end: bottom bottom`, `scrub: 0.8`, `invalidateOnRefresh`, **tanpa pin**. `onUpdate` menyatukan kamera, objek, shader, HUD, rail, tujuh tombol tahap dan `aria-live`.
- **Tombol tahap** menggulir ke progres yang bersesuaian; **empat sakelar lapisan** benar-benar menyembunyikan kelompok titik lewat uniform shader.
- **Satu callout** mengikuti proyeksi komponen aktif: hairline, titik 3px, label, angka dengan satuan.
- **Mobile**: DPR 1,25, jumlah titik dipangkas, antialias dan bayangan mati, kanvas penuh di belakang panel teks solid, HUD disembunyikan, tabel ditumpuk per baris, diagram `<details>` tetap ada.
- **Reduced motion**: timeline tidak dibuat, kamera di posisi akhir, semua solid tampil, seluruh teks terbaca, callout dan isyarat gulir disembunyikan.
- **Tanpa JS**: seluruh langkah, register dan diagram sudah terlihat di CSS dasar; kanvas hanya dekorasi.
- **Performa**: render sesuai kebutuhan lewat `gsap.ticker`, jeda saat `document.hidden`, geometri dipakai ulang, tidak ada postprocessing/bloom, pustaka divendor lokal.

## Mutu dan cara menjalankan

```sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory hardware-explorer
```

```sh
node skills/hallmark/scripts/sloplint.mjs \
  hardware-explorer/index.html hardware-explorer/style.css \
  hardware-explorer/tokens.css hardware-explorer/base.css --genre modern-minimal
```

Hasil: **0 FAIL, 0 REFLEX, 0 WARN across 4 file(s)**. `node --check` lolos. Smoke test Node dengan `WebGLRenderer` bertubit lolos: geometri, shader points, master timeline, sakelar lapisan dan sinkronisasi UI terbentuk tanpa error runtime. Tingkat `--render` belum dijalankan karena sandbox tidak memiliki Chrome atau `puppeteer-core`; lipatan, kontras piksel dan fokus dengan tab perlu dicek di browser. Font Google punya fallback `ui-sans-serif`.

## Akses publik

Pratinjau Arena memakai host `*.e2b.app` yang tidak selalu terbuka dari jaringan pengguna, dan endpoint GitHub Pages mengembalikan `403 Resource not accessible by integration` untuk token integrasi repo ini. Jalur alternatif:

1. **Halaman live tanpa unduhan**, memakai berkas mandiri:
   `https://htmlpreview.github.io/?https://raw.githubusercontent.com/charyuseai-cmd/hallmark/refs/heads/arena/c5662565-hallmark/hardware-explorer/Hardware-Explorer-standalone.html`
2. **Berkas untuk dibuka lokal** dari `file://`:
   `hardware-explorer/Hardware-Explorer-standalone.html`
3. **Versi multi-berkas** untuk di-host sendiri: folder `hardware-explorer/` atau salinan `docs/`.

Berkas mandiri dibuat dengan `esbuild --bundle --format=iife`, lalu `tokens.css`, `base.css`, `style.css`, GSAP, ScrollTrigger dan bundel disisipkan ke `index.html`. Tidak ada `src`/`href` eksternal tersisa; Google Fonts sengaja dihapus agar fallback sistem bekerja luring.

## Berkas

| Berkas | Isi |
| --- | --- |
| `index.html` | Hero, tujuh tahap, HUD, callout, sakelar, register, potongan, penutup |
| `tokens.css` | Token Vantage dari scaffold repo plus tiga token adegan |
| `base.css` | Aturan Floor dari scaffold repo |
| `style.css` | Stamp, komposisi Corridor, corner ticks, kontrol, responsif, reduced motion |
| `app.js` | Point cloud, shader sapuan, tujuh grup, master timeline, sinkronisasi UI, potongan 2D |
| `vendor/` | Three.js 0.187.0 dan GSAP ScrollTrigger 3.15.0 lokal |
| `Hardware-Explorer-standalone.html` | Satu berkas mandiri |
| `DESIGN.md` | Dokumen ini |
