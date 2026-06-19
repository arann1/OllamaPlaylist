/* Entry point — fetch → boot → scroll-driven timeline */
import { SECTIONS, TL_DURATION } from './constants.js';
import { relTime } from './utils.js';
import { renderBoombox, scaleBoombox } from './boombox.js';
import { buildPanels, populatePanels } from './panels.js';
import { buildTimeline, sectionAt } from './timeline.js';

const anime = window.anime;

/* ── State ─────────────────────────────────────── */
let allData    = [];
let runIdx     = 0;
let masterTL   = null;
let rafId      = null;
let hasScrolled = false;

const el = id => document.getElementById(id);

/* ── Data fetch ─────────────────────────────────── */
fetch('./data/history.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    if (!data || !data.length) { showErr('No run history yet.'); return; }
    allData = data;
    runIdx  = data.length - 1;
    boot();
  })
  .catch(e => showErr('Cannot load history: ' + e.message));

function showErr(msg) {
  el('loading').innerHTML = `<p style="color:#555;max-width:280px;text-align:center;font-family:monospace;line-height:1.9">${msg}</p>`;
}

/* ── Boot ───────────────────────────────────────── */
function boot() {
  const latest = allData[allData.length - 1];
  el('mpill').textContent    = latest.model || 'ollama';
  el('last-upd').textContent = relTime(latest.timestamp);

  el('loading').style.display = 'none';
  el('app').style.display     = 'block';

  /* Build DOM structure */
  buildPanels(el('panels-wrap'));

  /* Scale boombox */
  scaleBoombox(el('boombox-scale'));

  /* Build dots nav */
  const dotsEl = el('section-dots');
  SECTIONS.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'sdot';
    d.title = s.label;
    d.addEventListener('click', () => scrollToSection(i));
    dotsEl.appendChild(d);
  });

  /* Run nav */
  el('bp').addEventListener('click', () => { if (runIdx > 0) loadRun(runIdx - 1); });
  el('bn').addEventListener('click', () => { if (runIdx < allData.length - 1) loadRun(runIdx + 1); });

  window.addEventListener('resize', () => scaleBoombox(el('boombox-scale')));

  loadRun(runIdx);
}

/* ── Load a run ─────────────────────────────────── */
function loadRun(idx) {
  runIdx = idx;
  const run = allData[idx];

  /* Update header */
  el('mpill').textContent    = run.model || 'ollama';
  el('last-upd').textContent = relTime(run.timestamp);

  /* Update run nav */
  el('run-mood').textContent = (run.mood || '—').toUpperCase();
  el('run-info').textContent = run.date + '  ' + (idx + 1) + ' / ' + allData.length;
  el('bp').disabled = idx === 0;
  el('bn').disabled = idx === allData.length - 1;

  /* Reset all panels to invisible */
  document.querySelectorAll('.panel').forEach(p => {
    p.style.opacity = '0';
    p.style.pointerEvents = 'none';
    anime.set(p, { translateX: 0, translateY: 0, scale: 1 });
  });

  /* Render boombox (resets pixel positions too) */
  renderBoombox(el('boombox-container'));

  /* Populate panel content */
  populatePanels(run);

  /* Rebuild timeline (new pixel elements) */
  masterTL = buildTimeline();

  /* Re-seek to current scroll position */
  seekToScroll();
}

/* ── Scroll → timeline ──────────────────────────── */
function seekToScroll() {
  if (!masterTL) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress  = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const ms        = progress * TL_DURATION;

  masterTL.seek(ms);

  /* Update section label & dots */
  const secIdx = sectionAt(ms);
  const sec    = SECTIONS[secIdx];
  el('section-label').textContent = sec ? sec.label : '';
  document.querySelectorAll('.sdot').forEach((d, i) => {
    d.classList.toggle('on', i === secIdx);
  });

  /* Hint fades after first real scroll */
  if (!hasScrolled && window.scrollY > 10) {
    hasScrolled = true;
    anime({ targets: '#scroll-hint', opacity: 0, duration: 600, easing: 'linear' });
  }
}

/* Throttle scroll handler to one RAF per frame */
window.addEventListener('scroll', () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(seekToScroll);
}, { passive: true });

/* ── Jump to a section by dot click ─────────────── */
function scrollToSection(idx) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const target    = (idx / SECTIONS.length) * maxScroll;
  window.scrollTo({ top: target, behavior: 'smooth' });
}
