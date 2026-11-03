/* Hardware Explorer: satu kanvas Three.js, satu timeline GSAP ScrollTrigger.
 * Posisi gulir menggerakkan kamera, transformasi objek dan teks secara bersamaan. */
import * as THREE from './vendor/three.module.js';

(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const canvas = document.getElementById('scene');
  const body = document.body;

  const steps = Array.from(document.querySelectorAll('.step'));
  const hudTahap = document.querySelector('[data-hud-tahap]');
  const hudNo = document.querySelector('[data-hud-no]');
  const hudPersen = document.querySelector('[data-hud-persen]');
  const rail = document.querySelector('[data-rail]');
  const announce = document.querySelector('[data-announce]');
  const LABELS = [
    'Rakit utuh', 'Unit pemroses', 'Memori', 'Grafis',
    'Penyimpanan dan daya', 'Tampilan lepas', 'Kembali dan rakit utuh',
  ];

  /* Warna dibaca dari token CSS, lalu diubah ke sRGB untuk Three.js. */
  const rootStyle = getComputedStyle(document.documentElement);
  function oklchToHex(L, C, H) {
    const h = (H * Math.PI) / 180;
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    const ch = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255));
    return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function token(name) {
    const raw = rootStyle.getPropertyValue(name).trim();
    const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)/.exec(raw);
    if (!m) return { hex: '#ffffff', alpha: 1 };
    const L = parseFloat(m[1]) / 100;
    const C = parseFloat(m[2]);
    const H = parseFloat(m[3]);
    let alpha = 1;
    if (m[4]) alpha = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { hex: oklchToHex(L, C, H), alpha: Math.min(1, Math.max(0, alpha)) };
  }
  const C = {
    paper: token('--color-paper'), paper2: token('--color-paper-2'), paper3: token('--color-paper-3'),
    ink: token('--color-ink'), ink2: token('--color-ink-2'), muted: token('--color-muted'),
    rule: token('--color-rule'), rule2: token('--color-rule-2'),
    grid: token('--color-grid'), grid2: token('--color-grid-2'),
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    body.classList.add('is-static');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setClearColor(new THREE.Color(C.paper3.hex), 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(C.paper3.hex), 0.012);
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 7.5, 13.5);
  const target = { x: 0, y: 0.2, z: 0 };

  const hemi = new THREE.HemisphereLight(new THREE.Color(C.ink.hex), new THREE.Color(C.paper3.hex), 1.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(new THREE.Color(C.ink.hex), 2.4);
  key.position.set(-5, 10, 7);
  key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(C.muted.hex), 1.3);
  rim.position.set(7, 5, -9);
  scene.add(rim);
  const fill = new THREE.PointLight(new THREE.Color(C.paper2.hex), 18, 28);
  fill.position.set(2, 4, 6);
  scene.add(fill);

  const matPCB = new THREE.MeshStandardMaterial({ color: C.paper3.hex, roughness: 0.86, metalness: 0.14 });
  const matDark = new THREE.MeshStandardMaterial({ color: C.paper3.hex, roughness: 0.62, metalness: 0.30 });
  const matInk = new THREE.MeshStandardMaterial({ color: C.ink.hex, roughness: 0.38, metalness: 0.50 });
  const matMetal = new THREE.MeshStandardMaterial({ color: C.muted.hex, roughness: 0.30, metalness: 0.78 });
  const matLine = new THREE.LineBasicMaterial({ color: C.rule.hex, transparent: true, opacity: C.rule.alpha });

  function gridTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = C.paper2.hex;
    ctx.fillRect(0, 0, size, size);
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.grid.hex;
    ctx.globalAlpha = C.grid.alpha;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    ctx.strokeStyle = C.grid2.hex;
    ctx.globalAlpha = C.grid2.alpha;
    for (let i = 0; i <= size; i += 128) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.5, 1.75);
    t.anisotropy = 4;
    return t;
  }
  const matSurface = new THREE.MeshStandardMaterial({ map: gridTexture(), roughness: 0.92, metalness: 0.06 });

  const rig = new THREE.Group();
  rig.rotation.set(0.02, -0.18, 0);
  scene.add(rig);
  const board = new THREE.Group();
  rig.add(board);

  function mesh(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = !mobile;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r, h, seg = 20) => new THREE.CylinderGeometry(r, r, h, seg);

  /* Papan induk */
  mesh(board, box(10, 0.18, 7), matPCB, 0, 0, 0);
  const top = mesh(board, new THREE.PlaneGeometry(10, 7), matSurface, 0, 0.095, 0, -Math.PI / 2, 0, 0);
  top.castShadow = false;

  const tracePoints = [];
  const pushLine = (x1, z1, x2, z2) => {
    tracePoints.push(new THREE.Vector3(x1, 0.102, z1), new THREE.Vector3(x2, 0.102, z2));
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 70; i += 1) {
    const x = -4.4 + rnd() * 8.8;
    const z = -3.1 + rnd() * 6.2;
    const len = 0.4 + rnd() * 1.7;
    if (rnd() > 0.5) pushLine(x, z, Math.min(4.6, x + len), z);
    else pushLine(x, z, x, Math.min(3.2, z + len));
  }
  const rect = (cx, cz, w, d) => {
    const a = cx - w / 2, b = cx + w / 2, c = cz - d / 2, e = cz + d / 2;
    pushLine(a, c, b, c); pushLine(b, c, b, e); pushLine(b, e, a, e); pushLine(a, e, a, c);
  };
  rect(-1.4, -0.7, 2.1, 2.1);
  rect(2.1, -1.3, 2.0, 3.0);
  rect(0.2, 1.6, 5.4, 1.7);
  rect(2.6, 2.0, 1.2, 2.9);
  board.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tracePoints), matLine));

  for (const x of [-4.6, 4.6]) for (const z of [-3.2, 3.2]) {
    mesh(board, cyl(0.12, 0.22, 16), matDark, x, 0.1, z);
  }
  mesh(board, box(5.4, 0.08, 0.22), matDark, 0.2, 0.13, 1.6);

  /* Komponen: setiap grup menyimpan posisi asalnya */
  const groups = {};
  function component(name, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData.home = { x, y, z };
    board.add(g);
    groups[name] = g;
    return g;
  }

  const cpu = component('cpu', -1.4, 0.24, -0.7);
  mesh(cpu, box(1.9, 0.12, 1.9), matDark, 0, 0, 0);
  mesh(cpu, box(1.45, 0.10, 1.45), matMetal, 0, 0.11, 0);
  mesh(cpu, box(0.82, 0.02, 0.82), matInk, 0, 0.17, 0);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    mesh(cpu, cyl(0.025, 0.05, 8), matMetal, Math.cos(a) * 0.88, 0.02, Math.sin(a) * 0.88);
  }

  const cooler = component('cooler', -1.4, 0.62, -0.7);
  const finGeo = box(1.7, 0.46, 0.045);
  for (let i = 0; i < 9; i += 1) mesh(cooler, finGeo, matMetal, 0, 0.25, (i - 4) * 0.095);
  mesh(cooler, cyl(0.72, 0.12, 24), matDark, 0, 0.56, 0);
  const bladeGeo = box(0.62, 0.02, 0.14);
  for (let i = 0; i < 6; i += 1) {
    mesh(cooler, bladeGeo, matInk, 0, 0.63, 0, 0, (i / 6) * Math.PI * 2, 0.18);
  }

  const ram = component('ram', 2.1, 0.24, -1.3);
  const stickGeo = box(0.22, 0.9, 2.6);
  const spreadGeo = box(0.24, 0.74, 2.5);
  for (let i = 0; i < 4; i += 1) {
    const x = (i - 1.5) * 0.42;
    mesh(ram, stickGeo, matDark, x, 0.45, 0);
    mesh(ram, spreadGeo, matMetal, x, 0.48, 0);
    mesh(ram, box(0.2, 0.06, 2.3), matInk, x, 0.03, 0);
  }

  const gpu = component('gpu', 0.2, 0.34, 1.6);
  mesh(gpu, box(5.2, 0.14, 1.5), matPCB, 0, 0, 0);
  mesh(gpu, box(5.0, 0.42, 1.35), matDark, 0, 0.28, 0);
  mesh(gpu, box(0.12, 0.9, 1.6), matMetal, -2.65, 0.3, 0);
  for (const fx of [-1.2, 1.2]) {
    mesh(gpu, cyl(0.52, 0.10, 24), matMetal, fx, 0.52, 0);
    for (let i = 0; i < 5; i += 1) {
      mesh(gpu, box(0.46, 0.02, 0.10), matInk, fx, 0.58, 0, 0, (i / 5) * Math.PI * 2, 0.2);
    }
  }

  const storage = component('storage', 2.6, 0.20, 2.0);
  mesh(storage, box(0.9, 0.08, 2.6), matDark, 0, 0, 0);
  mesh(storage, box(0.72, 0.012, 1.9), matInk, 0, 0.05, 0);

  const vrm = component('vrm', -3.5, 0.26, 0.8);
  const vrmGeo = box(0.6, 0.5, 1.1);
  for (let i = 0; i < 3; i += 1) mesh(vrm, vrmGeo, matMetal, (i - 1) * 0.72, 0.25, 0);

  const io = component('io', -4.4, 0.30, -2.4);
  for (let i = 0; i < 3; i += 1) {
    mesh(io, box(0.5, 0.55, 0.7), matDark, 0, 0.28, (i - 1) * 0.85);
    mesh(io, box(0.3, 0.28, 0.5), matInk, 0.28, 0.25, (i - 1) * 0.85);
  }

  const HOME = {};
  Object.keys(groups).forEach((k) => { HOME[k] = { ...groups[k].userData.home, rx: 0, ry: 0, rz: 0 }; });
  const LIFT = {
    cpu: { x: 0, y: 0.45, z: 0, rx: 0.05, ry: 0, rz: 0 },
    cooler: { x: 0, y: 0.90, z: 0, rx: 0.05, ry: 0, rz: 0 },
    ram: { x: 0, y: 0.70, z: 0, rx: 0, ry: 0, rz: 0.08 },
    gpu: { x: 0, y: 0.60, z: 0.30, rx: 0.08, ry: 0, rz: 0 },
    storage: { x: 0, y: 0.40, z: 0.20, rx: 0, ry: 0, rz: 0 },
    vrm: { x: 0, y: 0.40, z: 0.10, rx: 0, ry: 0, rz: 0 },
    io: { x: 0, y: 0.30, z: -0.10, rx: 0, ry: 0, rz: 0 },
  };
  const EXPLODE = {
    cpu: { x: -0.5, y: 1.5, z: -0.4, rx: 0.12, ry: 0.10, rz: -0.08 },
    cooler: { x: -0.9, y: 3.0, z: -0.8, rx: 0.18, ry: 0.14, rz: 0.12 },
    ram: { x: 1.2, y: 1.7, z: -1.1, rx: 0.08, ry: 0.12, rz: 0.22 },
    gpu: { x: 0.3, y: 2.1, z: 2.0, rx: 0.22, ry: 0.08, rz: 0 },
    storage: { x: 1.6, y: 1.1, z: 2.3, rx: 0.10, ry: 0.10, rz: -0.18 },
    vrm: { x: -1.5, y: 1.3, z: 0.7, rx: 0.10, ry: 0.08, rz: 0.10 },
    io: { x: -1.1, y: 0.9, z: -0.9, rx: 0, ry: 0.10, rz: 0.12 },
  };

  function place(tl, t, d, map) {
    Object.keys(map).forEach((name) => {
      const g = groups[name];
      const h = HOME[name];
      const o = map[name];
      tl.to(g.position, { x: h.x + o.x, y: h.y + o.y, z: h.z + o.z, duration: d, ease: 'none' }, t);
      tl.to(g.rotation, { x: o.rx || 0, y: o.ry || 0, z: o.rz || 0, duration: d, ease: 'none' }, t);
    });
  }
  function move(tl, t, d, cam, look) {
    tl.to(camera.position, { x: cam[0], y: cam[1], z: cam[2], duration: d, ease: 'none' }, t);
    tl.to(target, { x: look[0], y: look[1], z: look[2], duration: d, ease: 'none' }, t);
  }

  let lastIdx = -1;
  function syncUI(p) {
    const idx = Math.max(0, Math.min(6, Math.floor(p * 7)));
    steps.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    hudTahap.textContent = LABELS[idx];
    hudNo.textContent = String(idx).padStart(2, '0') + ' / 06';
    hudPersen.textContent = Math.round(p * 100) + '%';
    rail.style.transform = 'scaleY(' + Math.max(0.001, p).toFixed(4) + ')';
    if (idx !== lastIdx) {
      announce.textContent = 'Tahap ' + idx + ', ' + LABELS[idx];
      lastIdx = idx;
    }
  }

  let needsRender = true;
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) needsRender = true;
  }, { rootMargin: '200px' });
  observer.observe(canvas);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  window.addEventListener('resize', resize);
  resize();

  gsap.ticker.add(() => {
    if (!visible || document.hidden || !needsRender) return;
    camera.lookAt(target.x, target.y, target.z);
    renderer.render(scene, camera);
    needsRender = false;
  });

  if (reduced) {
    body.classList.add('is-static');
    steps.forEach((el) => el.classList.add('is-active'));
    camera.position.set(0, 7.5, 13.5);
    target.x = 0; target.y = 0.2; target.z = 0;
    hudTahap.textContent = LABELS[0];
    hudNo.textContent = '00 / 06';
    hudPersen.textContent = '0%';
    rail.style.transform = 'scaleY(1)';
    needsRender = true;
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
    onUpdate: () => { needsRender = true; syncUI(tl.progress()); },
  });

  tl.to(rig.rotation, { x: 0.05, y: 0.28, duration: 7, ease: 'none' }, 0);

  move(tl, 1, 1, [-1.4, 3.4, 4.2], [-1.4, 0.5, -0.7]);
  place(tl, 1, 1, { cpu: LIFT.cpu, cooler: LIFT.cooler });

  move(tl, 2, 1, [2.2, 3.0, 3.8], [2.1, 0.6, -1.0]);
  place(tl, 2, 1, { ram: LIFT.ram });

  move(tl, 3, 1, [0.4, 2.6, 5.0], [0.2, 0.5, 1.6]);
  place(tl, 3, 1, { gpu: LIFT.gpu });

  move(tl, 4, 1, [3.0, 2.8, 4.6], [2.4, 0.4, 1.9]);
  place(tl, 4, 1, { storage: LIFT.storage, vrm: LIFT.vrm, io: LIFT.io });

  move(tl, 5, 1, [0, 9.5, 15.5], [0, 1.2, 0]);
  place(tl, 5, 1, EXPLODE);

  move(tl, 6, 1, [0, 6.8, 12.5], [0, 0.2, 0]);
  place(tl, 6, 0.75, Object.fromEntries(Object.keys(HOME).map((k) => [k, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }])));

  syncUI(0);
})();
