/* Tower lifecycle: build, clear, shaft */
import { SECS } from './constants.js';
import { state } from './state.js';
import { tower, initSecLights } from './scene.js';
import {
  buildOverview, buildEnergy, buildMood,
  buildGenres, buildArtists, buildDNA, buildCurated,
} from './sections.js';

const THREE = window.THREE;

function buildShaft() {
  const totalH = 45, mid = 20;
  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, totalH, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9, metalness: 0.2 }),
  );
  shaft.position.set(0, mid, 0);
  tower.add(shaft);

  [[2.8, 2.8], [2.8, -2.8], [-2.8, 2.8], [-2.8, -2.8]].forEach(([x, z]) => {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, totalH, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.95 }),
    );
    col.position.set(x, mid, z);
    tower.add(col);
  });
}

export function clearTower() {
  state.labelObjects.forEach(o => {
    if (o.element && o.element.parentNode) o.element.parentNode.removeChild(o.element);
  });
  state.labelObjects.length = 0;
  state.anims.length = 0;
  state.hitMeshes.length = 0;

  tower.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
      else o.material.dispose();
    }
  });
  while (tower.children.length) tower.remove(tower.children[0]);

  initSecLights();
}

export function buildTower(run) {
  state.currentRun = run;
  clearTower();
  buildShaft();
  buildOverview(run, SECS[0].y);
  buildEnergy(run,   SECS[1].y);
  buildMood(run,     SECS[2].y);
  buildGenres(run,   SECS[3].y);
  buildArtists(run,  SECS[4].y);
  buildDNA(run,      SECS[5].y);
  buildCurated(run,  SECS[6].y);
}
