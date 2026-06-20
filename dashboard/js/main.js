import { fmtSec, relTime } from './utils.js';

const ENERGY_FILLS = { low: 3, medium: 6, high: 10 };
const GENRE_COLORS = ['#1ed760', '#59cfcf', '#b967ff', '#ffa42b', '#f037a5'];

const $ = id => document.getElementById(id);

function block(n, total = 10) {
  return '█'.repeat(n) + '░'.repeat(total - n);
}

function render(run) {
  $('h-model').textContent   = run.model || '—';
  $('h-time').textContent    = relTime(run.timestamp);
  $('ft-date').textContent   = run.date || '—';

  $('h-date').textContent    = (run.date || '—') + '  ' + (run.time || '');
  $('h-mood').textContent    = run.mood || '—';
  $('h-tracks').textContent  = (run.tracks_added ?? '—') + ' TRACKS ADDED';
  $('h-runtime').textContent = fmtSec(run.runtime_seconds);
  $('h-library').textContent = (run.library_artist_count ?? '—') + ' ARTISTS IN LIBRARY';
  $('h-summary').textContent = run.summary || '';
  $('h-playlists').textContent = (run.source_playlists || []).join('  ·  ') || '—';

  const eLvl  = (run.energy_level || 'medium').toLowerCase();
  const eFill = ENERGY_FILLS[eLvl] ?? 5;
  $('h-energy').innerHTML =
    `<span class="energy-bar energy-${eLvl}">[${block(eFill)}] ${eLvl.toUpperCase()}</span>`;

  $('taste-tags').innerHTML = (run.taste_profile || [])
    .map(t => `<span class="taste-tag">${t.toUpperCase()}</span>`)
    .join('');

  const genres = (run.genres || []).slice(0, 6);
  $('genre-bars').innerHTML = genres.map((g, i) => {
    const fill = Math.round(10 - (i / genres.length) * 7);
    return `<div class="genre-row">
      <div class="genre-name" style="color:${GENRE_COLORS[i % 5]}">${g}</div>
      <div class="genre-bar">[${block(fill)}]</div>
    </div>`;
  }).join('');

  $('artists-grid').innerHTML = (run.preferred_artists_detail || []).map(a => `
    <div class="artist-card">
      <div class="artist-img-wrap">
        ${a.image
          ? `<img class="artist-img" src="${a.image}" alt="${a.name}" loading="lazy" />`
          : `<div class="artist-placeholder">${a.name.charAt(0)}</div>`}
      </div>
      <div class="artist-name">${a.name.toUpperCase()}</div>
    </div>
  `).join('');

  $('tracks-grid').innerHTML = (run.curated_tracks_sample || []).map(t => `
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

  $('recent-list').innerHTML = (run.recent_tracks_sample || []).map((t, i) => `
    <div class="recent-row">
      <span class="recent-num">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <div class="recent-name">${t.name}</div>
        <div class="recent-art">${t.artist}</div>
      </div>
    </div>
  `).join('');
}

async function boot() {
  let run;
  try {
    const res = await fetch('./data/history.json');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const arr  = (Array.isArray(data) ? data : [data])
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    run = arr[0];
    if (!run) throw new Error('empty');
  } catch (e) {
    $('loading').innerHTML = `<p style="color:#ff4444;font-family:monospace;font-size:12px">LOAD ERROR: ${e.message}</p>`;
    return;
  }

  $('loading').style.display = 'none';
  $('app').removeAttribute('hidden');

  render(run);
}

boot();
