/* Three.js scene, camera, renderer, lights, tower group */
import { SECS } from './constants.js';
import { state } from './state.js';

const THREE = window.THREE;

const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setClearColor(0x050505);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.outputEncoding    = THREE.sRGBEncoding;

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050505, 22, 70);

export const camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 200);

export const labelR = new THREE.CSS2DRenderer();
labelR.setSize(wrap.clientWidth, wrap.clientHeight);
labelR.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
wrap.appendChild(labelR.domElement);

/* Lights */
const amb = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(amb);

const sun = new THREE.DirectionalLight(0xfff4e0, 0.6);
sun.position.set(10, 25, 8);
sun.castShadow = true;
sun.shadow.mapSize.width = sun.shadow.mapSize.height = 512;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x1a2a60, 0.35);
fill.position.set(-12, 10, -10);
scene.add(fill);

/* Ground */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(50, 50, 0x0e0e0e, 0x0a0a0a);
grid.position.y = -0.98;
scene.add(grid);

/* Tower group */
export const tower = new THREE.Group();
scene.add(tower);

/* Section point lights — call once after tower is added */
export function initSecLights() {
  state.secLights.forEach(pl => tower.remove(pl));
  state.secLights.length = 0;
  SECS.forEach(s => {
    const pl = new THREE.PointLight(s.col, 0.3, 12);
    pl.position.set(0, s.y + 2, 0);
    tower.add(pl);
    state.secLights.push(pl);
  });
}

/* Handle viewport resize */
export function onResize() {
  const W = wrap.clientWidth, H = wrap.clientHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
  labelR.setSize(W, H);
}
