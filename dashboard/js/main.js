/* Entry point — fetch data, boot Three.js, run animation loop */
import { SECS } from './constants.js';
import { relTime } from './utils.js';
import { state } from './state.js';
import { renderer, scene, camera, labelR, initSecLights } from './scene.js';
import { buildTower } from './tower.js';
import { goToRun, updateDots } from './ui.js';

const THREE = window.THREE;

/* ── Data fetch ─────────────────────────────── */
fetch('./data/history.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    if (!data || !data.length) { showErr('No run history yet.'); return; }
    boot(data);
  })
  .catch(e => showErr('Cannot load history: ' + e.message));

function showErr(msg) {
  document.getElementById('loading').innerHTML =
    `<p style="color:#444;max-width:300px;text-align:center;line-height:1.8">${msg}</p>`;
}

/* ── Boot ───────────────────────────────────── */
function boot(data) {
  state.allData = data;
  state.runIdx  = data.length - 1;

  const latest = data[data.length - 1];
  document.getElementById('mpill').textContent = latest.model || 'ollama';
  document.getElementById('last-upd').textContent = 'Last run ' + relTime(latest.timestamp);

  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  requestAnimationFrame(() => requestAnimationFrame(() => {
    initSecLights();
    goToRun(state.runIdx);
    updateDots(0);
    document.getElementById('hud').textContent = SECS[0].icon + ' ' + SECS[0].label;
    animate();
  }));
}

/* ── Animation loop ─────────────────────────── */
const clock = new THREE.Clock();
const CAM_R = 10, CAM_ELEV = 5;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  /* Per-object animations */
  state.anims.forEach(a => {
    if (a.type === 'pulse') {
      a.mat.emissiveIntensity = a.base + a.amp * (0.5 + 0.5 * Math.sin(t * a.freq + a.phase));
    } else if (a.type === 'rotY') {
      a.obj.rotation.y += a.speed;
    } else if (a.type === 'bob') {
      a.obj.position.y = a.by0 + a.amp * Math.sin(t * a.freq + a.phase);
    } else if (a.type === 'orbit') {
      a.obj.position.set(
        a.cx + a.r * Math.cos(t * a.speed + a.phase),
        a.cy,
        a.cz + a.r * Math.sin(t * a.speed + a.phase),
      );
    }
  });

  /* Smooth scroll camera */
  state.camAngle    += 0.004;
  state.smoothY     += (state.targetY - state.smoothY)     * 0.055;
  state.smoothLookY  = state.smoothLookY !== undefined
    ? state.smoothLookY + (state.targetY - state.smoothLookY) * 0.055
    : state.targetY;

  camera.position.set(
    CAM_R * Math.cos(state.camAngle),
    state.smoothY + CAM_ELEV,
    CAM_R * Math.sin(state.camAngle),
  );
  camera.lookAt(0, state.smoothLookY, 0);

  /* Section light fade */
  state.secLights.forEach((pl, i) => {
    const tgt = i === state.currentSnap ? 1.8 : 0.3;
    pl.intensity += (tgt - pl.intensity) * 0.05;
  });

  renderer.render(scene, camera);
  labelR.render(scene, camera);
}
