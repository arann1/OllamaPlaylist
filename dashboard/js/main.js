import { fmtSec, relTime } from './utils.js';

const ENERGY_FILLS = { low: 3, medium: 6, high: 10 };
const GENRE_COLORS = ['#1ed760', '#59cfcf', '#b967ff', '#ffa42b', '#f037a5'];

let allRuns = [];
let runIdx  = 0;

/* ── Helpers ─────────────────────────────────────── */
const $ = id => document.getElementById(id);

function block(n, total = 10) {
  return '█'.repeat(n) + '░'.repeat(total - n);
}

function imgWrap(src, alt, cls) {
  if (src) {
    return `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy" />`;
  }
  return `<div class="${cls.replace('img','placeholder')}">${alt.charAt(0).toUpperCase()}</div>`;
}

/* ── Render ──────────────────────────────────────── */
function render(run) {
  /* ── Header ── */
  $('h-model').textContent   = run.model || '—';
  $('h-time').textContent    = relTime(run.timestamp);

  /* ── Terminal hero ── */
  $('h-date').textContent    = (run.date || '—') + '  ' + (run.time || '');
  $('h-mood').textContent    = run.mood || '—';
  $('h-tracks').textContent  = (run.tracks_added ?? '—') + ' TRACKS ADDED';
  $('h-runtime').textContent = fmtSec(run.runtime_seconds);
  $('h-library').textContent = (run.library_artist_count ?? '—') + ' ARTISTS IN LIBRARY';
  $('h-summary').textContent = run.summary || '';

  const playlists = (run.source_playlists || []).join('  ·  ');
  $('h-playlists').textContent = playlists || '—';

  /* Energy */
  const eLvl  = (run.energy_level || 'medium').toLowerCase();
  const eFill = ENERGY_FILLS[eLvl] ?? 5;
  $('h-energy').innerHTML =
    `<span class="energy-bar energy-${eLvl}">[${block(eFill)}] ${eLvl.toUpperCase()}</span>`;

  /* ── Taste tags ── */
  $('taste-tags').innerHTML = (run.taste_profile || [])
    .map(t => `<span class="taste-tag">${t.toUpperCase()}</span>`)
    .join('');

  /* ── Genre bars ── */
  const genres = (run.genres || []).slice(0, 6);
  const maxG   = genres.length;
  $('genre-bars').innerHTML = genres.map((g, i) => {
    const fill = Math.round(10 - (i / maxG) * 7);
    return `<div class="genre-row">
      <div class="genre-name" style="color:${GENRE_COLORS[i % 5]}">${g}</div>
      <div class="genre-bar">[${block(fill)}]</div>
    </div>`;
  }).join('');

  /* ── Artists grid ── */
  const artists = run.preferred_artists_detail || [];
  $('artists-grid').innerHTML = artists.map(a => `
    <div class="artist-card">
      <div class="artist-img-wrap">
        ${a.image
          ? `<img class="artist-img" src="${a.image}" alt="${a.name}" loading="lazy" />`
          : `<div class="artist-placeholder">${a.name.charAt(0)}</div>`}
      </div>
      <div class="artist-name">${a.name.toUpperCase()}</div>
    </div>
  `).join('');

  /* ── Curated tracks grid ── */
  const curated = run.curated_tracks_sample || [];
  $('tracks-grid').innerHTML = curated.map(t => `
    <div class="track-card">
      <div class="track-art-wrap">
        ${t.album_art
          ? `<img class="track-art" src="${t.album_art}" alt="${t.name}" loading="lazy" />`
          : `<div class="track-placeholder">♪</div>`}
        <div class="track-overlay">
          <div class="track-title">${t.name}</div>
          <div class="track-artist">${t.artist}</div>
        </div>
      </div>
      <div class="track-meta">
        <div class="track-meta-title">${t.name}</div>
        <div class="track-meta-artist">${t.artist}</div>
      </div>
    </div>
  `).join('');

  /* ── Recent list ── */
  const recent = run.recent_tracks_sample || [];
  $('recent-list').innerHTML = recent.map((t, i) => `
    <div class="recent-row">
      <span class="recent-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="recent-info">
        <div class="recent-name">${t.name}</div>
        <div class="recent-art">${t.artist}</div>
      </div>
    </div>
  `).join('');

  /* ── Run nav ── */
  $('rn-label').textContent = (run.mood || '').toUpperCase();
  $('rn-sub').textContent   = `${run.date || ''}  ·  RUN ${runIdx + 1} / ${allRuns.length}`;
  $('btn-prev').disabled    = runIdx === 0;
  $('btn-next').disabled    = runIdx === allRuns.length - 1;
}

/* ── Boot ─────────────────────────────────────────── */
async function boot() {
  try {
    const res = await fetch('./data/history.json');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    allRuns = (Array.isArray(data) ? data : [data])
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  } catch (e) {
    $('loading').innerHTML = `<p style="color:#ff4444;font-family:monospace">LOAD ERROR: ${e.message}</p>`;
    return;
  }

  $('loading').style.display = 'none';
  $('app').removeAttribute('hidden');

  $('btn-prev').addEventListener('click', () => { if (runIdx > 0) { runIdx--; render(allRuns[runIdx]); window.scrollTo(0, 0); } });
  $('btn-next').addEventListener('click', () => { if (runIdx < allRuns.length - 1) { runIdx++; render(allRuns[runIdx]); window.scrollTo(0, 0); } });

  render(allRuns[0]);
}

boot();
