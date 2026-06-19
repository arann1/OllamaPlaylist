/* One builder per tower section */
import { ENERGY_COL, ENERGY_H, ARTIST_COL, DNA_COL, CURATED_C, GC, GCS } from './constants.js';
import { moodCol } from './utils.js';
import { state } from './state.js';
import { tower } from './scene.js';
import { stdMat, edgeLine, slab, makeLabel } from './geometry.js';

const THREE = window.THREE;

export function buildOverview(run, yBase) {
  const g = new THREE.Group();
  g.position.y = yBase;

  g.add(slab(8, 0.5, 8, 0x1c1c1c, 0x3a3a3a, 'OVERVIEW'));

  [[3, 3], [3, -3], [-3, 3], [-3, -3]].forEach(([x, z]) => {
    const ph  = 0.8 + Math.abs(Math.sin(x * z)) * 0.6;
    const geo = new THREE.BoxGeometry(0.35, ph, 0.35);
    const mat = stdMat(0x252525, { r: 0.9 });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(x, 0.5 + ph / 2, z);
    m.userData.section = 'OVERVIEW';
    state.hitMeshes.push(m);
    g.add(m);
    const el = edgeLine(geo, 0x444444);
    el.position.copy(m.position);
    g.add(el);
  });

  const lbl = makeLabel('📊 ' + run.date, 0x555555);
  lbl.position.set(5, 1.5, 0);
  g.add(lbl);

  tower.add(g);
}

export function buildEnergy(run, yBase) {
  const g  = new THREE.Group();
  g.position.y = yBase;
  const eC = ENERGY_COL[run.energy_level] || 0x1ed760;
  const eH = ENERGY_H[run.energy_level]   || 2;

  g.add(slab(6, 0.4, 6, 0x0d1520, eC, 'ENERGY'));

  for (let i = 0; i < 5; i++) {
    const bh  = eH * 0.9 * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.8 + 1)));
    const geo = new THREE.BoxGeometry(0.55, bh, 0.55);
    const mat = stdMat(eC, { emissive: eC, ei: 0.35, r: 0.4 });
    const bar = new THREE.Mesh(geo, mat);
    bar.position.set(i * 1.1 - 2.2, 0.4 + bh / 2, 0);
    bar.castShadow = true;
    bar.userData.section = 'ENERGY';
    state.hitMeshes.push(bar);
    g.add(bar);
    const el = edgeLine(geo, eC);
    el.position.copy(bar.position);
    g.add(el);
    state.anims.push({ type: 'pulse', mat, base: 0.2, amp: 0.3, freq: 1.2 + i * 0.2, phase: i * 0.8 });
  }

  const lbl = makeLabel('⚡ ' + (run.energy_level || ''), eC);
  lbl.position.set(4, 2.5, 0);
  g.add(lbl);
  tower.add(g);
}

export function buildMood(run, yBase) {
  const g  = new THREE.Group();
  g.position.y = yBase;
  const mC = moodCol(run.mood);

  g.add(slab(6, 0.4, 6, 0x0a0a0a, mC, 'MOOD'));

  const sGeo = new THREE.SphereGeometry(1.4, 32, 32);
  const sMat = stdMat(mC, { emissive: mC, ei: 0.25, r: 0.3, m: 0.05, tp: true, op: 0.88 });
  const sphere = new THREE.Mesh(sGeo, sMat);
  sphere.position.set(0, 0.4 + 1.5, 0);
  sphere.userData.section = 'MOOD';
  state.hitMeshes.push(sphere);
  g.add(sphere);

  const wGeo = new THREE.SphereGeometry(1.55, 14, 14);
  const wf   = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: mC, wireframe: true, transparent: true, opacity: 0.12 }));
  wf.position.copy(sphere.position);
  g.add(wf);
  state.anims.push({ type: 'rotY', obj: wf,    speed: 0.008 });
  state.anims.push({ type: 'pulse', mat: sMat, base: 0.2, amp: 0.2, freq: 0.6, phase: 0 });

  const oGeo = new THREE.SphereGeometry(0.22, 10, 10);
  const orb  = new THREE.Mesh(oGeo, stdMat(mC, { emissive: mC, ei: 0.6, r: 0.2 }));
  g.add(orb);
  state.anims.push({ type: 'orbit', obj: orb, cx: 0, cy: sphere.position.y, cz: 0, r: 2.2, speed: 0.6, phase: 0 });

  const lbl = makeLabel('💭 ' + (run.mood || '').split(/[\s,]+/).slice(0, 2).join(' '), mC);
  lbl.position.set(-4.2, 2.5, 0);
  g.add(lbl);
  tower.add(g);
}

export function buildGenres(run, yBase) {
  const g      = new THREE.Group();
  g.position.y = yBase;
  const genres = (run.genres || []).slice(0, 5);

  g.add(slab(6.5, 0.4, 2.5, 0x0a0a0a, 0x333333, 'GENRES'));

  const sp = genres.length > 1 ? 4 / (genres.length - 1) : 0;
  genres.forEach((genre, i) => {
    const gc  = GC[i % 5];
    const ph  = 3.5 - i * 0.55;
    const px  = genres.length === 1 ? 0 : -2 + i * sp;
    const geo = new THREE.BoxGeometry(0.75, ph, 0.75);
    const mat = stdMat(gc, { emissive: gc, ei: 0.18, r: 0.55 });
    const pil = new THREE.Mesh(geo, mat);
    pil.position.set(px, 0.4 + ph / 2, 0);
    pil.castShadow = true;
    pil.userData.section = 'GENRES';
    state.hitMeshes.push(pil);
    g.add(pil);
    const el = edgeLine(geo, gc);
    el.position.copy(pil.position);
    g.add(el);
    const gl = makeLabel(genre, gc);
    gl.position.set(px, 0.4 + ph + 0.8, 0);
    g.add(gl);
  });

  const lbl = makeLabel('🎵 Genres', GC[0]);
  lbl.position.set(4.5, 2, 0);
  g.add(lbl);
  tower.add(g);
}

export function buildArtists(run, yBase) {
  const g = new THREE.Group();
  g.position.y = yBase;

  let artists = run.preferred_artists_detail || [];
  if (!artists.length && run.preferred_artists)
    artists = run.preferred_artists.slice(0, 5).map(n => ({ name: n }));
  artists = artists.slice(0, 5);

  g.add(slab(7, 0.4, 7, 0x0d0d0d, 0x333333, 'ARTISTS'));

  const n = artists.length || 1;
  const R = n === 1 ? 0 : 2.5;

  artists.forEach((a, i) => {
    const aC    = ARTIST_COL[i % 5];
    const angle = n === 1 ? 0 : (i / n) * Math.PI * 2;
    const ax    = R * Math.cos(angle), az = R * Math.sin(angle);

    const cGeo = new THREE.CylinderGeometry(0.38, 0.48, 2, 16);
    const cMat = stdMat(aC, { emissive: aC, ei: 0.12, r: 0.5 });
    const cyl  = new THREE.Mesh(cGeo, cMat);
    cyl.position.set(ax, 0.4 + 1, az);
    cyl.castShadow = true;
    cyl.userData.section = 'ARTISTS';
    state.hitMeshes.push(cyl);
    g.add(cyl);

    const capGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const capMat = stdMat(aC, { emissive: aC, ei: 0.45, r: 0.3 });
    const cap    = new THREE.Mesh(capGeo, capMat);
    cap.position.set(ax, 0.4 + 2.05, az);
    g.add(cap);
    state.anims.push({ type: 'pulse', mat: capMat, base: 0.3, amp: 0.35, freq: 0.9 + i * 0.15, phase: i * 1.1 });

    const al = makeLabel((a.name || '?').split(' ')[0], aC);
    al.position.set(ax, 0.4 + 2.8, az);
    g.add(al);
  });

  const lbl = makeLabel('👤 Artists', ARTIST_COL[0]);
  lbl.position.set(-4.5, 2, 0);
  g.add(lbl);
  tower.add(g);
}

export function buildDNA(run, yBase) {
  const g      = new THREE.Group();
  g.position.y = yBase;
  const profile = (run.taste_profile || []).slice(0, 5);

  g.add(slab(4, 0.4, 4, 0x080810, 0xb967ff, 'DNA'));

  const pts1 = [], pts2 = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, a = t * Math.PI * 4, hy = t * 5;
    pts1.push(new THREE.Vector3(1.4 * Math.cos(a),         0.5 + hy, 1.4 * Math.sin(a)));
    pts2.push(new THREE.Vector3(1.4 * Math.cos(a + Math.PI), 0.5 + hy, 1.4 * Math.sin(a + Math.PI)));
  }

  const tMat1 = stdMat(0xb967ff, { emissive: 0xb967ff, ei: 0.45, r: 0.3 });
  const tMat2 = stdMat(0x59cfcf, { emissive: 0x59cfcf, ei: 0.45, r: 0.3 });
  const tube1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts1), 80, 0.055, 8, false), tMat1);
  const tube2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 80, 0.055, 8, false), tMat2);
  tube1.userData.section = tube2.userData.section = 'DNA';
  state.hitMeshes.push(tube1, tube2);

  /* Cross-link beads */
  const beadGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const beadMat = stdMat(0xffffff, { emissive: 0xffffff, ei: 0.7, r: 0.2 });
  for (let i = 0; i < 8; i++) {
    const t = i / 7, a = t * Math.PI * 4, hy = t * 5;
    const b1 = new THREE.Mesh(beadGeo, beadMat);
    const b2 = b1.clone();
    b1.position.set(1.4 * Math.cos(a),         0.5 + hy, 1.4 * Math.sin(a));
    b2.position.set(1.4 * Math.cos(a + Math.PI), 0.5 + hy, 1.4 * Math.sin(a + Math.PI));
    g.add(b1); g.add(b2);
  }

  const helixGroup = new THREE.Group();
  helixGroup.add(tube1, tube2);
  g.add(helixGroup);
  state.anims.push({ type: 'rotY', obj: helixGroup, speed: 0.005 });

  const lbl = makeLabel('🧬 Taste DNA', 0xb967ff);
  lbl.position.set(3.5, 3, 0);
  g.add(lbl);

  profile.forEach((word, i) => {
    const wl = makeLabel(word, DNA_COL[i % 5]);
    wl.position.set(-3.5, 0.8 + i * 1.0, 0);
    g.add(wl);
  });

  tower.add(g);
}

export function buildCurated(run, yBase) {
  const g      = new THREE.Group();
  g.position.y = yBase;
  const tracks = (run.curated_tracks_sample || []).slice(0, 16);

  g.add(slab(7, 0.4, 7, 0x0a0008, 0xf037a5, 'CURATED'));

  const n = tracks.length || 1;
  const R = Math.min(3, 1 + n * 0.18);

  tracks.forEach((t, i) => {
    const angle = (i / n) * Math.PI * 2;
    const tc    = CURATED_C[i % 5];
    const geo   = new THREE.BoxGeometry(0.75, 0.1, 0.55);
    const mat   = stdMat(tc, { emissive: tc, ei: 0.3, r: 0.4 });
    const card  = new THREE.Mesh(geo, mat);
    const by    = 0.5 + (i % 3) * 0.25;
    card.position.set(R * Math.cos(angle), by, R * Math.sin(angle));
    card.rotation.y = -angle;
    card.userData.section = 'CURATED';
    state.hitMeshes.push(card);
    g.add(card);
    state.anims.push({ type: 'bob', obj: card, by0: by, amp: 0.18, freq: 0.7 + i * 0.06, phase: angle * 1.5 });
  });

  const sGeo = new THREE.ConeGeometry(0.18, 2, 12);
  const sMat = stdMat(0xf037a5, { emissive: 0xf037a5, ei: 0.5, r: 0.2 });
  const spike = new THREE.Mesh(sGeo, sMat);
  spike.position.set(0, 1.4, 0);
  spike.userData.section = 'CURATED';
  state.hitMeshes.push(spike);
  g.add(spike);
  state.anims.push({ type: 'rotY', obj: spike, speed: 0.012 });
  state.anims.push({ type: 'pulse', mat: sMat, base: 0.4, amp: 0.4, freq: 1.4, phase: 0 });

  const lbl = makeLabel('🎧 Curated', 0xf037a5);
  lbl.position.set(4.5, 2.5, 0);
  g.add(lbl);
  tower.add(g);
}
