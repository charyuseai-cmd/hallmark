/* Hardware Explorer · Vantage. Satu kanvas Three.js, satu timeline GSAP ScrollTrigger.
 * Gulir menggerakkan kamera, transformasi objek, sapuan titik dan teks secara bersamaan. */
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
  const profileCanvas = document.getElementById('profile');
  const body = document.body;
  const root = document.documentElement;

  const steps = Array.from(document.querySelectorAll('.step'));
  const stageButtons = Array.from(document.querySelectorAll('.stage'));
  const hudTahap = document.querySelector('[data-hud-tahap]');
  const hudNo = document.querySelector('[data-hud-no]');
  const hudPersen = document.querySelector('[data-hud-persen]');
  const rail = document.querySelector('[data-rail]');
  const announce = document.querySelector('[data-announce]');
  const calloutLabel = document.querySelector('[data-callout-label]');
  const calloutFig = document.querySelector('[data-callout-fig]');

  const LABELS = [
    'Rakit utuh', 'Unit pemroses', 'Memori', 'Grafis',
    'Daya dan simpan', 'Tampilan lepas', 'Utuh kembali',
  ];
  const CALLOUT_LABELS = [
    'Soket prosesor', 'Soket prosesor', 'Keping memori', 'Kartu grafis',
    'Drive dan regulator', 'Peta letak lepas', 'Papan utuh',
  ];

  /* Warna dibaca dari token CSS, lalu diubah ke sRGB untuk Three.js. */
  const rootStyle = getComputedStyle(root);
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
    return { hex: oklchToHex(L, C, H), alpha };
  }
  const C = {
    paper: token('--color-paper'), paper2: token('--color-paper-2'), paper3: token('--color-paper-3'),
    ink: token('--color-ink'), ink2: token('--color-ink-2'), muted: token('--color-muted'),
    rule: token('--color-rule'), rule2: token('--color-rule-2'),
    accent: token('--color-accent'), pointLo: token('--point-lo'),
    pointMid: token('--point-mid'), pointHi: token('--point-hi'),
  };
  const col = (t) => new THREE.Color(t.hex);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance',
    });
  } catch (err) {
    body.classList.add('is-static');
    drawProfile();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setClearColor(col(C.paper), 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(col(C.paper), 0.011);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 7.5, 13.5);

  const hemi = new THREE.HemisphereLight(col(C.ink), col(C.paper3), 1.35);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(col(C.ink), 2.1);
  keyLight.position.set(-5, 10, 7);
  keyLight.castShadow = !mobile;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -9; keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 9; keyLight.shadow.camera.bottom = -9;
  keyLight.shadow.camera.near = 1; keyLight.shadow.camera.far = 30;
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(col(C.muted), 1.1);
  rim.position.set(7, 5, -9);
  scene.add(rim);
  const fill = new THREE.PointLight(col(C.pointMid), 14, 28);
  fill.position.set(2, 4, 6);
  scene.add(fill);

  const rig = new THREE.Group();
  rig.rotation.set(0.02, -0.18, 0);
  scene.add(rig);

  /* Shader titik: sapuan scroll-driven, tanpa bloom, tanpa garis penghubung. */
  const uniforms = {
    uSweepY: { value: -1.2 },
    uSweepWidth: { value: 0.55 },
    uFoundGroup: { value: -1 },
    uLime: { value: col(C.accent) },
    uWhite: { value: col(C.pointHi) },
    uLayer0: { value: 1 }, uLayer1: { value: 1 }, uLayer2: { value: 1 }, uLayer3: { value: 1 },
    uSize: { value: mobile ? 1.7 : 2.2 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };
  const scanMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aLayer;
      attribute float aGroup;
      uniform float uSweepY, uSweepWidth, uFoundGroup;
      uniform float uLayer0, uLayer1, uLayer2, uLayer3, uSize, uPixelRatio;
      uniform vec3 uLime, uWhite;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float on = aLayer < 0.5 ? uLayer0 : (aLayer < 1.5 ? uLayer1 : (aLayer < 2.5 ? uLayer2 : uLayer3));
        vec4 world = modelMatrix * vec4(position, 1.0);
        float d = abs(world.y - uSweepY);
        float lift = 1.0 - smoothstep(0.0, uSweepWidth, d);
        float found = 1.0 - step(0.5, abs(aGroup - uFoundGroup));
        float foundLayer = 1.0 - step(0.5, abs(aLayer - 3.0));
        vec3 c = mix(aColor, uWhite, lift * 0.72 * (1.0 - found));
        c = mix(c, uLime, found * (0.35 + lift * 0.65));
        c = mix(c, uLime, foundLayer * 0.8);
        vColor = c;
        vec4 mv = viewMatrix * world;
        float depth = -mv.z;
        vAlpha = on * mix(0.3, 1.0, 1.0 - smoothstep(6.0, 22.0, depth)) * (0.55 + lift * 0.45);
        gl_PointSize = on * clamp(uSize * uPixelRatio * (10.0 / max(depth, 0.5)), 1.0, 6.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = dot(c, c);
        if (r > 0.25) discard;
        float edge = 1.0 - smoothstep(0.14, 0.25, r);
        gl_FragColor = vec4(vColor, vAlpha * edge);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const profilePoints = [];
  const lo = col(C.pointLo), mid = col(C.pointMid), hi = col(C.pointHi);

  function samplePoint(def) {
    if (def.k === 'cyl') {
      const a = rnd() * Math.PI * 2;
      const y = (rnd() - 0.5) * def.h;
      const r = def.r * (0.96 + rnd() * 0.04);
      return [def.x + Math.cos(a) * r, def.y + y, def.z + Math.sin(a) * r];
    }
    const face = (rnd() * 6) | 0;
    const u = rnd() - 0.5, v = rnd() - 0.5;
    const hw = def.w / 2, hh = def.h / 2, hd = def.d / 2;
    if (face === 0) return [def.x + u * def.w, def.y + hh, def.z + v * def.d];
    if (face === 1) return [def.x + u * def.w, def.y - hh, def.z + v * def.d];
    if (face === 2) return [def.x + hw, def.y + u * def.h, def.z + v * def.d];
    if (face === 3) return [def.x - hw, def.y + u * def.h, def.z + v * def.d];
    if (face === 4) return [def.x + u * def.w, def.y + v * def.h, def.z + hd];
    return [def.x + u * def.w, def.y + v * def.h, def.z - hd];
  }

  function scanPoints(parent, defs, count, layer, groupId, home) {
    const pos = new Float32Array(count * 3);
    const rgb = new Float32Array(count * 3);
    const lay = new Float32Array(count);
    const grp = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const p = samplePoint(defs[(rnd() * defs.length) | 0]);
      pos.set(p, i * 3);
      const t = Math.max(0, Math.min(1, (p[1] + home[1] + 0.2) / 1.7));
      const c = t < 0.5 ? lo.clone().lerp(mid, t * 2) : mid.clone().lerp(hi, (t - 0.5) * 2);
      rgb.set([c.r, c.g, c.b], i * 3);
      lay[i] = layer;
      grp[i] = groupId;
      if (i % 41 === 0) profilePoints.push({ x: p[0] + home[0], y: p[1] + home[1] });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(rgb, 3));
    geo.setAttribute('aLayer', new THREE.BufferAttribute(lay, 1));
    geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1));
    const pts = new THREE.Points(geo, scanMaterial);
    pts.renderOrder = 2;
    parent.add(pts);
    return pts;
  }

  function solidMaterial() {
    return new THREE.MeshStandardMaterial({
      color: col(C.paper2), roughness: 0.68, metalness: 0.38,
      transparent: true, opacity: 0.12, depthWrite: false,
    });
  }

  /* Tujuh grup: papan, cpu, ram, gpu, storage, vrm, io. */
  const DEFS = [
    { name: 'board', home: [0, 0, 0], layer: 0, count: mobile ? 2600 : 6200, parts: [
      { k: 'box', w: 10, h: 0.18, d: 7, x: 0, y: 0, z: 0 },
      { k: 'box', w: 10, h: 0.02, d: 7, x: 0, y: 0.1, z: 0 },
    ] },
    { name: 'cpu', home: [-1.5, 0.2, -0.6], layer: 2, count: mobile ? 1300 : 3200, parts: [
      { k: 'box', w: 2.2, h: 0.1, d: 2.2, x: 0, y: 0, z: 0 },
      { k: 'box', w: 1.5, h: 0.08, d: 1.5, x: 0, y: 0.09, z: 0 },
      { k: 'box', w: 1.8, h: 0.1, d: 1.8, x: 0, y: 0.2, z: 0 },
      { k: 'box', w: 1.8, h: 0.5, d: 0.06, x: 0, y: 0.45, z: -0.5 },
      { k: 'box', w: 1.8, h: 0.5, d: 0.06, x: 0, y: 0.45, z: -0.25 },
      { k: 'box', w: 1.8, h: 0.5, d: 0.06, x: 0, y: 0.45, z: 0 },
      { k: 'box', w: 1.8, h: 0.5, d: 0.06, x: 0, y: 0.45, z: 0.25 },
      { k: 'box', w: 1.8, h: 0.5, d: 0.06, x: 0, y: 0.45, z: 0.5 },
      { k: 'cyl', r: 0.7, h: 0.12, x: 0, y: 0.78, z: 0 },
    ] },
    { name: 'ram', home: [2.2, 0.15, -0.5], layer: 2, count: mobile ? 900 : 2200, parts: [
      { k: 'box', w: 0.24, h: 1.1, d: 0.14, x: -0.55, y: 0.55, z: 0 },
      { k: 'box', w: 0.24, h: 1.1, d: 0.14, x: -0.18, y: 0.55, z: 0 },
      { k: 'box', w: 0.24, h: 1.1, d: 0.14, x: 0.18, y: 0.55, z: 0 },
      { k: 'box', w: 0.24, h: 1.1, d: 0.14, x: 0.55, y: 0.55, z: 0 },
    ] },
    { name: 'gpu', home: [0.2, 0.25, 1.2], layer: 2, count: mobile ? 1400 : 3400, parts: [
      { k: 'box', w: 5.4, h: 0.18, d: 1.3, x: 0, y: 0, z: 0 },
      { k: 'box', w: 0.1, h: 0.5, d: 1.3, x: -2.7, y: 0.2, z: 0 },
      { k: 'cyl', r: 0.45, h: 0.08, x: -1.4, y: 0.13, z: 0 },
      { k: 'cyl', r: 0.45, h: 0.08, x: 1.4, y: 0.13, z: 0 },
    ] },
    { name: 'storage', home: [2.9, 0.16, 1.7], layer: 2, count: mobile ? 500 : 1200, parts: [
      { k: 'box', w: 1.6, h: 0.08, d: 0.5, x: 0, y: 0, z: 0 },
      { k: 'box', w: 1.6, h: 0.04, d: 0.5, x: 0, y: 0.06, z: 0 },
    ] },
    { name: 'vrm', home: [-3.6, 0.16, 1.2], layer: 2, count: mobile ? 500 : 1200, parts: [
      { k: 'box', w: 0.8, h: 0.5, d: 0.8, x: -0.5, y: 0.25, z: 0 },
      { k: 'box', w: 0.8, h: 0.5, d: 0.8, x: 0.5, y: 0.25, z: 0 },
    ] },
    { name: 'io', home: [-4.1, 0.2, -2.2], layer: 2, count: mobile ? 500 : 1200, parts: [
      { k: 'box', w: 1.2, h: 0.6, d: 0.8, x: 0, y: 0.3, z: 0 },
      { k: 'box', w: 0.3, h: 0.25, d: 0.1, x: -0.35, y: 0.3, z: -0.45 },
      { k: 'box', w: 0.3, h: 0.25, d: 0.1, x: 0.35, y: 0.3, z: -0.45 },
    ] },
  ];

  const groups = DEFS.map((def, index) => {
    const g = new THREE.Group();
    g.position.set(def.home[0], def.home[1], def.home[2]);
    g.userData.home = def.home.slice();
    g.userData.index = index;
    g.userData.material = solidMaterial();
    const mat = g.userData.material;
    def.parts.forEach((p) => {
      let mesh;
      if (p.k === 'cyl') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(p.r, p.r, p.h, 20), mat);
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.d), mat);
      }
      mesh.position.set(p.x, p.y, p.z);
      mesh.castShadow = !mobile;
      mesh.receiveShadow = true;
      mesh.renderOrder = 1;
      g.add(mesh);
    });
    rig.add(g);
    scanPoints(g, def.parts, def.count, def.layer, index, def.home);
    return g;
  });

  /* Jalur tembaga sebagai lapisan tersendiri, bukan jaring penghubung titik. */
  const tracePoints = [];
  const push = (x1, z1, x2, z2) => tracePoints.push(
    new THREE.Vector3(x1, 0.105, z1), new THREE.Vector3(x2, 0.105, z2),
  );
  for (let i = 0; i < 48; i += 1) {
    const x = -4.4 + rnd() * 8.8;
    const z = -3.1 + rnd() * 6.2;
    const len = 0.4 + rnd() * 1.6;
    if (rnd() > 0.5) push(x, z, Math.min(4.6, x + len), z);
    else push(x, z, x, Math.min(3.2, z + len));
  }
  const traces = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(tracePoints),
    new THREE.LineBasicMaterial({ color: col(C.rule), transparent: true, opacity: 0.55 }),
  );
  rig.add(traces);

  /* Titik yang ditemukan: satu lapisan lagi, selalu lime. */
  const foundDefs = groups.map((g) => ({ k: 'box', w: 0.5, h: 0.5, d: 0.5, x: 0, y: 0.3, z: 0 }));
  const foundGroup = new THREE.Group();
  rig.add(foundGroup);
  const foundPos = new Float32Array(groups.length * 3);
  const foundRgb = new Float32Array(groups.length * 3);
  const foundLay = new Float32Array(groups.length);
  const foundGrp = new Float32Array(groups.length);
  groups.forEach((g, i) => {
    const h = g.userData.home;
    foundPos.set([h[0], h[1] + 0.3, h[2]], i * 3);
    foundRgb.set([mid.r, mid.g, mid.b], i * 3);
    foundLay[i] = 3;
    foundGrp[i] = -1;
  });
  const foundGeo = new THREE.BufferGeometry();
  foundGeo.setAttribute('position', new THREE.BufferAttribute(foundPos, 3));
  foundGeo.setAttribute('aColor', new THREE.BufferAttribute(foundRgb, 3));
  foundGeo.setAttribute('aLayer', new THREE.BufferAttribute(foundLay, 1));
  foundGeo.setAttribute('aGroup', new THREE.BufferAttribute(foundGrp, 1));
  const foundPts = new THREE.Points(foundGeo, scanMaterial);
  foundPts.renderOrder = 3;
  foundGroup.add(foundPts);

  /* Jalur kamera, sapuan dan transformasi untuk tujuh tahap. */
  const CAM = [
    [0, 7.5, 13.5], [-3.0, 2.8, 4.8], [2.8, 2.6, 4.4], [0.6, 2.2, 5.4],
    [4.4, 3.0, 5.2], [0, 9.5, 15.5], [0, 6.8, 12.5],
  ];
  const LOOK = [
    [0, 0.2, 0], [-1.5, 0.7, -0.6], [2.2, 0.8, -0.5], [0.2, 0.5, 1.2],
    [2.8, 0.4, 1.2], [0, 0.9, 0], [0, 0.2, 0],
  ];
  const RIG = [
    [0.02, -0.18, 0], [0.02, -0.32, 0], [0.02, 0.12, 0], [0.06, -0.05, 0],
    [0.02, 0.28, 0], [0, 0, 0], [0.02, -0.18, 0],
  ];
  const FOV = [38, 34, 34, 36, 34, 42, 38];
  const SWEEP = [-1.2, 0.2, 0.5, 0.4, 0.8, 2.2, 3.2];
  const FOUND = [-1, 1, 2, 3, 4, -1, -1];
  const zero = () => groups.map(() => [0, 0, 0, 0, 0]);
  const OFF = [
    zero(),
    (() => { const a = zero(); a[1] = [0, 0.9, 0, 0.04, -0.05]; return a; })(),
    (() => { const a = zero(); a[2] = [0.3, 1.0, 0, -0.05, 0.06]; return a; })(),
    (() => { const a = zero(); a[3] = [0, 0.8, 0.4, 0.06, 0]; return a; })(),
    (() => { const a = zero(); a[4] = [0.5, 0.7, 0.3, 0, 0.05]; a[5] = [-0.4, 0.6, 0, 0, -0.05]; a[6] = [-0.2, 0.5, -0.3, 0.04, 0]; return a; })(),
    [
      [0, 0, 0, 0, 0], [-1.0, 2.2, -1.0, 0.08, -0.08], [1.4, 2.6, -1.2, -0.06, 0.08],
      [0, 1.6, 2.4, 0.05, 0], [2.0, 2.0, 1.6, 0, 0.1], [-2.2, 1.8, 1.4, 0, -0.1],
      [-1.8, 1.4, -2.2, 0.08, 0],
    ],
    zero(),
  ];
  const ALPHA = [
    [0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12],
    [0.35, 0.95, 0.12, 0.12, 0.12, 0.12, 0.12],
    [0.35, 0.8, 0.95, 0.12, 0.12, 0.12, 0.12],
    [0.4, 0.8, 0.8, 0.95, 0.12, 0.12, 0.12],
    [0.5, 0.8, 0.8, 0.8, 0.95, 0.9, 0.85],
    [0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92],
    [0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95],
  ];

  function key(i) {
    const k = {
      duration: 1, ease: 'none',
      camX: CAM[i][0], camY: CAM[i][1], camZ: CAM[i][2],
      lookX: LOOK[i][0], lookY: LOOK[i][1], lookZ: LOOK[i][2],
      rigX: RIG[i][0], rigY: RIG[i][1], rigZ: RIG[i][2],
      fov: FOV[i], sweep: SWEEP[i], found: FOUND[i],
    };
    OFF[i].forEach((o, j) => {
      k['o' + j + 'x'] = o[0]; k['o' + j + 'y'] = o[1]; k['o' + j + 'z'] = o[2];
      k['o' + j + 'rx'] = o[3]; k['o' + j + 'rz'] = o[4];
    });
    ALPHA[i].forEach((a, j) => { k['a' + j] = a; });
    return k;
  }
  const S = {};
  const k0 = key(0);
  Object.keys(k0).forEach((p) => { if (p !== 'duration' && p !== 'ease') S[p] = k0[p]; });

  function apply(s) {
    camera.position.set(s.camX, s.camY, s.camZ);
    camera.fov = s.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(s.lookX, s.lookY, s.lookZ);
    rig.rotation.set(s.rigX, s.rigY, s.rigZ);
    uniforms.uSweepY.value = s.sweep;
    uniforms.uFoundGroup.value = s.found;
    groups.forEach((g, j) => {
      const h = g.userData.home;
      g.position.set(h[0] + s['o' + j + 'x'], h[1] + s['o' + j + 'y'], h[2] + s['o' + j + 'z']);
      g.rotation.set(s['o' + j + 'rx'], 0, s['o' + j + 'rz']);
      g.userData.material.opacity = s['a' + j];
    });
  }

  const focusGroup = [groups[0], groups[1], groups[2], groups[3], groups[4], groups[0], groups[0]];
  const projected = new THREE.Vector3();
  let needsRender = true;
  let tl;

  function paintUI(idx, progress) {
    hudTahap.textContent = LABELS[idx];
    hudNo.textContent = String(idx).padStart(2, '0') + ' / 06';
    hudPersen.textContent = Math.round(progress * 100) + '%';
    rail.style.transform = 'scaleY(' + progress + ')';
    steps.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    stageButtons.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    announce.textContent = 'Tahap ' + (idx + 1) + ' dari 7, ' + LABELS[idx];

    focusGroup[idx].getWorldPosition(projected);
    projected.project(camera);
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + (projected.x * 0.5 + 0.5) * rect.width;
    const y = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;
    root.style.setProperty('--cx', Math.max(0, Math.min(window.innerWidth - 200, x)) + 'px');
    root.style.setProperty('--cy', Math.max(80, Math.min(window.innerHeight - 80, y)) + 'px');
    calloutLabel.textContent = CALLOUT_LABELS[idx];
    calloutFig.textContent = String(idx + 1).padStart(2, '0') + ' / 07';
  }

  function sync() {
    const p = tl ? tl.progress() : 0;
    const idx = Math.min(6, Math.round(p * 6));
    apply(S);
    paintUI(idx, p);
    needsRender = true;
  }

  function bindLayers() {
    document.querySelectorAll('[data-layer]').forEach((input) => {
      const u = uniforms['uLayer' + input.dataset.layer];
      if (!u) return;
      u.value = input.checked ? 1 : 0;
      input.addEventListener('change', () => {
        u.value = input.checked ? 1 : 0;
        needsRender = true;
      });
    });
  }

  function bindStages() {
    stageButtons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (reduced || !tl || !tl.scrollTrigger) {
          const el = document.getElementById('tahap-' + i);
          if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
          return;
        }
        const st = tl.scrollTrigger;
        window.scrollTo({
          top: st.start + (st.end - st.start) * (i / 6),
          behavior: 'smooth',
        });
      });
    });
  }

  /* Potongan: titik yang sama diproyeksikan ke satu bidang 2D. */
  function drawProfile() {
    if (!profileCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = profileCanvas.clientWidth || 800;
    const h = 160;
    profileCanvas.width = Math.round(w * dpr);
    profileCanvas.height = Math.round(h * dpr);
    const ctx = profileCanvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const baseY = h - 24;
    ctx.strokeStyle = C.rule.hex;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();

    const pts = profilePoints.length ? profilePoints : (() => {
      let s = 19;
      const out = [];
      for (let i = 0; i < 900; i += 1) {
        s = (s * 16807) % 2147483647;
        const r1 = s / 2147483647;
        s = (s * 16807) % 2147483647;
        const r2 = s / 2147483647;
        out.push({ x: (r1 - 0.5) * 10, y: r2 * 1.3 });
      }
      return out;
    })();
    ctx.fillStyle = C.pointMid.hex;
    pts.forEach((p) => {
      const x = ((p.x + 5) / 10) * w;
      const y = baseY - Math.max(0, Math.min(1, p.y / 1.5)) * (h - 40);
      ctx.globalAlpha = 0.18 + Math.max(0, Math.min(1, p.y / 1.5)) * 0.6;
      ctx.fillRect(x, y, 1.5, 1.5);
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = C.rule2.hex;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, baseY); ctx.lineTo(w * 0.18, baseY - 26); ctx.lineTo(w * 0.3, baseY - 26);
    ctx.moveTo(w * 0.64, baseY - 92); ctx.lineTo(w * 0.64, baseY - 26); ctx.lineTo(w * 0.76, baseY - 26);
    ctx.stroke();
    ctx.fillStyle = C.accent.hex;
    ctx.fillRect(w * 0.18 - 1.5, baseY - 27.5, 3, 3);
    ctx.fillRect(w * 0.64 - 1.5, baseY - 93.5, 3, 3);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
    drawProfile();
    needsRender = true;
  }

  bindLayers();
  bindStages();
  window.addEventListener('resize', resize);
  resize();
  apply(S);

  gsap.ticker.add(() => {
    if (document.hidden || !needsRender) return;
    renderer.render(scene, camera);
    needsRender = false;
  });

  if (reduced) {
    body.classList.add('is-reduced');
    const k = key(6);
    Object.keys(k).forEach((p) => { if (p !== 'duration' && p !== 'ease') S[p] = k[p]; });
    apply(S);
    paintUI(6, 1);
    needsRender = true;
    return;
  }

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onRefresh: () => { needsRender = true; },
    },
    onUpdate: sync,
  });
  for (let i = 1; i <= 6; i += 1) tl.to(S, key(i), i - 1);
  ScrollTrigger.addEventListener('refresh', () => { needsRender = true; });
  sync();
})();
