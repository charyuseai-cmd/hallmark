/* Perilaku halaman katalog. Tanpa skrip, 50 baris dan pratinjau awal tetap terbaca. */
(() => {
  'use strict';

  const themes = window.HALLMARK_THEMES || [];
  if (!themes.length) return;

  const bySlug = new Map(themes.map((t) => [t.slug, t]));
  const rows = Array.from(document.querySelectorAll('.baris'));
  const filters = Array.from(document.querySelectorAll('.seg__tombol'));

  const gambar = document.querySelector('[data-gambar]');
  const caption = document.querySelector('[data-caption]');
  const nama = document.querySelector('[data-nama]');
  const bahan = document.querySelector('[data-bahan]');
  const genre = document.querySelector('[data-genre]');
  const huruf = document.querySelector('[data-huruf]');
  const kertas = document.querySelector('[data-kertas]');
  const sinyal = document.querySelector('[data-sinyal]');
  const swatch = document.querySelector('[data-swatch]');
  const tautan = document.querySelector('[data-link]');

  function pilih(slug) {
    const t = bySlug.get(slug);
    if (!t) return;

    rows.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.slug === slug)));

    gambar.src = 'assets/themes/' + t.slug + '.webp';
    gambar.alt = 'Contoh halaman bertema ' + t.name + ', ' + t.pictured + '.';
    caption.textContent = t.name + '. ' + t.pictured + '.';
    nama.textContent = t.name;
    bahan.textContent = t.material;
    genre.textContent = t.genre;
    huruf.textContent = t.display;
    kertas.textContent = t.paperBand + ', ' + t.paperL + '%, rona ' + t.paperHue;
    sinyal.textContent = t.accentBand + ', rona ' + t.accentHue;

    swatch.style.setProperty('--sw-paper', t.colors.paper);
    swatch.style.setProperty('--sw-ink', t.colors.ink);
    swatch.style.setProperty('--sw-accent', t.colors.accent);
    tautan.href = 'https://www.usehallmark.com/themes/' + t.slug + '/';
  }

  rows.forEach((b) => b.addEventListener('click', () => pilih(b.dataset.slug)));

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const g = btn.dataset.genre;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      rows.forEach((b) => {
        b.closest('li').hidden = g !== 'all' && b.dataset.genre !== g;
      });
    });
  });

  const acak = document.querySelector('[data-acak]');
  if (acak) {
    acak.addEventListener('click', () => {
      const t = themes[Math.floor(Math.random() * themes.length)];
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.genre === 'all')));
      rows.forEach((b) => { b.closest('li').hidden = false; });
      pilih(t.slug);
      const aktif = rows.find((b) => b.dataset.slug === t.slug);
      if (aktif) aktif.scrollIntoView({ block: 'nearest' });
    });
  }

  const salin = document.querySelector('[data-salin]');
  const teksTombol = document.querySelector('[data-salin-teks]');
  const status = document.querySelector('[data-status]');
  const perintah = 'npx skills add nutlope/hallmark -g';

  if (salin) {
    salin.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(perintah);
        } else {
          const area = document.createElement('textarea');
          area.value = perintah;
          area.setAttribute('readonly', '');
          area.style.position = 'absolute';
          area.style.left = '-9999px';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        teksTombol.textContent = 'Tersalin';
        status.textContent = 'Perintah tersalin ke papan klip.';
      } catch (e) {
        status.textContent = 'Salin manual dari kotak di atas.';
      }
      window.setTimeout(() => {
        teksTombol.textContent = 'Salin perintah';
        status.textContent = '';
      }, 2400);
    });
  }
})();
