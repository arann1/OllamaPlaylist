/* Reusable Three.js geometry helpers */
import { state } from './state.js';
import { hex2css } from './utils.js';

const THREE = window.THREE;

export function stdMat(col, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: col,
    emissive: opts.emissive != null ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts.ei   || 0,
    roughness:         opts.r    != null ? opts.r : 0.82,
    metalness:         opts.m    != null ? opts.m : 0.08,
    transparent: !!opts.tp,
    opacity: opts.op || 1,
  });
}

export function edgeLine(geo, col) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: col }),
  );
}

export function slab(w, h, d, col, edgeCol, secKey) {
  const g    = new THREE.Group();
  const geo  = new THREE.BoxGeometry(w, h, d);
  const mat  = stdMat(col, { r: 0.85, m: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = h / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.section = secKey;
  g.add(mesh);
  state.hitMeshes.push(mesh);
  const el = edgeLine(geo, edgeCol);
  el.position.y = h / 2;
  g.add(el);
  return g;
}

export function makeLabel(text, colorHex) {
  const div = document.createElement('div');
  div.className = 'lbl';
  div.style.color = hex2css(colorHex);
  const sp = document.createElement('span');
  sp.textContent = text;
  div.appendChild(sp);
  const obj = new THREE.CSS2DObject(div);
  state.labelObjects.push(obj);
  return obj;
}
