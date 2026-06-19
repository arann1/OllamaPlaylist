/* Dots, run nav, tooltip, scroll, keyboard, touch, resize */
import { SECS, SEC_NAMES } from './constants.js';
import { state } from './state.js';
import { camera, onResize } from './scene.js';
import { buildTower } from './tower.js';
import { renderPanel } from './panel.js';

const THREE = window.THREE;

/* ── Section dot nav ──────────────────────────── */
const dotsEl  = document.getElementById('dots');
const hudEl   = document.getElementById('hud');
export const dotEls = [];

SECS.forEach((s, i) => {
  const d = document.createElement('button');
  d.className = 'dot' + (i === 0 ? ' on' : '');
  d.title = s.label;
  d.addEventListener('click', () => goToSection(i));
  dotsEl.appendChild(d);
  dotEls.push(d);
});

export function updateDots(idx) {
  dotEls.forEach((d, i) => { d.className = 'dot' + (i === idx ? ' on' : ''); });
  hudEl.textContent = SECS[idx].icon + ' ' + SECS[idx].label;
  state.secLights.forEach((pl, i) => { pl.intensity = i === idx ? 1.8 : 0.3; });
}

let panelTimer;
export function goToSection(idx) {
  idx = Math.max(0, Math.min(SECS.length - 1, idx));
  if (idx === state.currentSnap) return;
  state.currentSnap = idx;
  state.targetY = SECS[idx].y;
  updateDots(idx);
  clearTimeout(panelTimer);
  panelTimer = setTimeout(() => {
    if (state.currentRun) renderPanel(SECS[idx].key, state.currentRun);
  }, 500);
}

/* ── Run nav ──────────────────────────────────── */
export function updateRunNav() {
  const r = state.allData[state.runIdx];
  document.getElementById('nm').textContent = r.mood || '—';
  document.getElementById('nd').textContent = r.date + ' · ' + (state.runIdx + 1) + '/' + state.allData.length;
  document.getElementById('bp').disabled = state.runIdx === 0;
  document.getElementById('bn').disabled = state.runIdx === state.allData.length - 1;
}

export function goToRun(idx) {
  state.runIdx = idx;
  updateRunNav();
  buildTower(state.allData[idx]);
  document.getElementById('panel').classList.remove('open');
}

document.getElementById('bp').addEventListener('click', () => {
  if (state.runIdx > 0) goToRun(state.runIdx - 1);
});
document.getElementById('bn').addEventListener('click', () => {
  if (state.runIdx < state.allData.length - 1) goToRun(state.runIdx + 1);
});

/* ── Tooltip + click-to-open-panel ───────────── */
const wrap = document.getElementById('wrap');
const tip  = document.getElementById('tip');
const ray  = new THREE.Raycaster();
const mouse = new THREE.Vector2();

wrap.addEventListener('mousemove', e => {
  const r = wrap.getBoundingClientRect();
  mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
  mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(state.hitMeshes, false);
  if (hits.length && hits[0].object.userData.section) {
    const sec = hits[0].object.userData.section;
    document.getElementById('tt').textContent = SEC_NAMES[sec] || sec;
    document.getElementById('ts').textContent = (state.currentRun && state.currentRun.mood) || '';
    tip.style.opacity = '1';
    tip.style.left = Math.min(e.clientX - r.left + 16, r.width - 215) + 'px';
    tip.style.top  = Math.max(e.clientY - r.top - 14, 4) + 'px';
    document.body.style.cursor = 'pointer';
  } else {
    tip.style.opacity = '0';
    document.body.style.cursor = '';
  }
});

wrap.addEventListener('mouseleave', () => {
  tip.style.opacity = '0';
  document.body.style.cursor = '';
});

wrap.addEventListener('click', e => {
  const r = wrap.getBoundingClientRect();
  mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
  mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(state.hitMeshes, false);
  if (hits.length && hits[0].object.userData.section && state.currentRun) {
    const sec = hits[0].object.userData.section;
    const si  = SECS.findIndex(s => s.key === sec);
    if (si >= 0 && si !== state.currentSnap) {
      state.currentSnap = si;
      state.targetY = SECS[si].y;
      updateDots(si);
    }
    renderPanel(sec, state.currentRun);
  }
});

/* ── Scroll / keyboard / touch ────────────────── */
function nudge(dir) {
  if (state.scrollLock) return;
  goToSection(state.currentSnap + dir);
  state.scrollLock = true;
  setTimeout(() => { state.scrollLock = false; }, 700);
}

wrap.addEventListener('wheel', e => {
  e.preventDefault();
  if (Math.abs(e.deltaY) > 5) nudge(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') nudge(1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   nudge(-1);
});

wrap.addEventListener('touchstart', e => { state.ty0 = e.touches[0].clientY; }, { passive: true });
wrap.addEventListener('touchend',   e => {
  const dy = state.ty0 - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 30) nudge(dy > 0 ? 1 : -1);
}, { passive: true });

/* ── Resize ───────────────────────────────────── */
window.addEventListener('resize', onResize);
