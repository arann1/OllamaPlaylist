/* Build and populate the 7 data panels */
import { fmtSec } from './utils.js';

const EC = { low: 'LOW', medium: 'MED', high: 'HIGH' };
const ENERGY_FILL = { low: 3, medium: 6, high: 10 };
const GENRE_COLORS = ['#1ed760', '#59cfcf', '#b967ff', '#ffa42b', '#f037a5'];

function bar(filled, total = 10, fillChar = '█', emptyChar = '░') {
  return fillChar.repeat(filled) + emptyChar.repeat(total - filled);
}

function row(label, value) {
  return `<div class="pr"><span class="pl">${label}</span><span class="pv">${value}</span></div>`;
}

export function buildPanels(container) {
  container.innerHTML = `
    <div class="panel" id="panel-overview">
      <div class="ptitle">RUN OVERVIEW</div>
      <div id="po-body"></div>
    </div>

    <div class="panel" id="panel-energy">
      <div class="ptitle">ENERGY LEVEL</div>
      <div id="pe-level" class="pe-big"></div>
      <div id="pe-bar"   class="pe-bar"></div>
      <div id="pe-extra"></div>
    </div>

    <div class="panel" id="panel-mood">
      <div class="ptitle">MOOD</div>
      <div id="pm-name" class="pm-big"></div>
      <div id="pm-summary" class="pm-sum"></div>
    </div>

    <div class="panel" id="panel-genres">
      <div class="ptitle">GENRE DNA</div>
      <div id="pg-list"></div>
      <div class="ptitle" style="margin-top:10px">TASTE PROFILE</div>
      <div id="pg-tags"></div>
    </div>

    <div class="panel" id="panel-artists">
      <div class="ptitle">TOP ARTISTS</div>
      <div id="pa-list"></div>
    </div>

    <div class="panel" id="panel-dna">
      <div class="ptitle">TASTE DNA</div>
      <div id="pd-words"></div>
    </div>

    <div class="panel" id="panel-curated">
      <div class="ptitle">CURATED MIX</div>
      <div id="pc-list"></div>
    </div>
  `;
}

export function populatePanels(run) {
  /* OVERVIEW */
  document.getElementById('po-body').innerHTML =
    row('DATE',    run.date)
    + row('TIME',  run.time)
    + row('TRACKS', run.tracks_added)
    + row('RUNTIME', fmtSec(run.runtime_seconds))
    + row('MODEL',  run.model || '—')
    + row('LIBRARY', (run.library_artist_count || '—') + ' artists')
    + `<div class="ps-label">PLAYLISTS</div>`
    + (run.source_playlists || []).map(p => `<div class="ps-item">&gt; ${p}</div>`).join('');

  /* ENERGY */
  const eLvl  = run.energy_level || 'medium';
  const eFill = ENERGY_FILL[eLvl] || 5;
  document.getElementById('pe-level').textContent = EC[eLvl] || eLvl.toUpperCase();
  document.getElementById('pe-bar').textContent   = '[' + bar(eFill) + ']';
  document.getElementById('pe-extra').innerHTML   = row('TRACKS', run.tracks_added) + row('RUNTIME', fmtSec(run.runtime_seconds));

  /* MOOD */
  document.getElementById('pm-name').textContent    = (run.mood || '—').toUpperCase();
  document.getElementById('pm-summary').textContent = run.summary || '';

  /* GENRES */
  const genres = (run.genres || []).slice(0, 5);
  document.getElementById('pg-list').innerHTML = genres.map((g, i) => {
    const fill = Math.round(10 - i * 1.5);
    return `<div class="pg-row"><span class="pg-name" style="color:${GENRE_COLORS[i % 5]}">${g.toUpperCase().slice(0, 12).padEnd(12)}</span><span class="pg-bar">[${bar(fill)}]</span></div>`;
  }).join('');
  document.getElementById('pg-tags').innerHTML = (run.taste_profile || []).map(t =>
    `<span class="ptag">${t.toUpperCase()}</span>`).join('');

  /* ARTISTS */
  const artists = (run.preferred_artists_detail || []);
  const names   = artists.length ? artists.map(a => a.name) : (run.preferred_artists || []);
  document.getElementById('pa-list').innerHTML = names.slice(0, 7).map((n, i) =>
    `<div class="pa-row"><span class="pa-num">${String(i + 1).padStart(2, '0')}</span><span class="pa-name">${n}</span></div>`
  ).join('');

  /* DNA */
  const words = (run.taste_profile || []).slice(0, 6);
  document.getElementById('pd-words').innerHTML = words.map((w, i) =>
    `<div class="pd-word" style="font-size:${18 - i * 2}px;opacity:${1 - i * 0.1}">${w.toUpperCase()}</div>`
  ).join('');

  /* CURATED */
  const tracks = (run.curated_tracks_sample || []).slice(0, 10);
  document.getElementById('pc-list').innerHTML = tracks.map((t, i) =>
    `<div class="pc-row"><span class="pc-num">${String(i + 1).padStart(2, '0')}</span><div class="pc-info"><div class="pc-title">${t.name}</div><div class="pc-artist">${t.artist}</div></div></div>`
  ).join('');
}
