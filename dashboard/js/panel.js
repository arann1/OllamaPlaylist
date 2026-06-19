/* Info panel — renders run data for a clicked section */
import { GCS } from './constants.js';
import { fmtSec } from './utils.js';

function si(label, val) {
  return `<div class="sc"><span>${label}</span><strong>${val}</strong></div>`;
}

const EC_CSS = { low: '#59cfcf', medium: '#ffa42b', high: '#1ed760' };

export function renderPanel(sec, run) {
  let h = '';

  if (sec === 'OVERVIEW') {
    h = `<span class="pi">📊</span><h2 class="pt">Run Overview</h2>`
      + `<div class="sg">${si('Date', run.date)}${si('Time', run.time)}${si('Tracks', run.tracks_added)}${si('Runtime', fmtSec(run.runtime_seconds))}${si('Model', run.model || '—')}${si('Library', (run.library_artist_count || '—') + ' artists')}</div>`
      + `<div class="ps">Source playlists</div><div class="tr">${(run.source_playlists || []).map(p => `<span class="tg">${p}</span>`).join('')}</div>`;
  }

  else if (sec === 'ENERGY') {
    h = `<span class="pi">⚡</span><h2 class="pt">Energy Level</h2>`
      + `<span class="ebg" style="color:${EC_CSS[run.energy_level] || '#1ed760'}">${run.energy_level || '—'}</span>`
      + `<div class="sg">${si('Tracks', run.tracks_added)}${si('Runtime', fmtSec(run.runtime_seconds))}</div>`;
  }

  else if (sec === 'MOOD') {
    h = `<span class="pi">💭</span><h2 class="pt">Mood</h2>`
      + `<div class="md">${run.mood || '—'}</div>`
      + `<p class="pb">${run.summary || ''}</p>`;
  }

  else if (sec === 'GENRES') {
    h = `<span class="pi">🎵</span><h2 class="pt">Genre DNA</h2>`
      + `<div class="gl">${(run.genres || []).map((g, i) =>
          `<div class="gr"><span>${g}</span><div class="gb"><div class="gf" style="width:${100 - i * 17}%;background:${GCS[i % 5]}"></div></div></div>`
        ).join('')}</div>`
      + `<div class="ps">Taste profile</div><div class="tr">${(run.taste_profile || []).map(t => `<span class="tg tgp">${t}</span>`).join('')}</div>`;
  }

  else if (sec === 'ARTISTS') {
    h = `<span class="pi">👤</span><h2 class="pt">Top Artists</h2>`
      + `<div class="al">${(run.preferred_artists_detail || []).map((a, i) => {
          const n  = a.name || '?';
          const av = a.image
            ? `<img class="av" src="${a.image}" alt="" onerror="this.style.display='none'">`
            : `<div class="avp">${n[0]}</div>`;
          const medal = ['🥇', '🥈', '🥉', '#4', '#5'][i] || `#${i + 1}`;
          return `<div class="ar">${av}<span class="an">${n}</span><span class="rnk${i < 3 ? ' tp' : ''}">${medal}</span></div>`;
        }).join('')}</div>`;
  }

  else if (sec === 'DNA') {
    h = `<span class="pi">🧬</span><h2 class="pt">Taste Profile</h2>`
      + `<div class="dl">${(run.taste_profile || []).map((t, i) =>
          `<div class="dw" style="font-size:${22 - i * 2}px;color:${GCS[i % 5]}">${t}</div>`
        ).join('')}</div>`;
  }

  else if (sec === 'CURATED') {
    h = `<span class="pi">🎧</span><h2 class="pt">Curated Playlist</h2>`
      + `<p class="pb" style="margin-bottom:14px">${(run.curated_tracks_sample || []).length} tracks · AI-selected from your library</p>`
      + `<div class="tl">${(run.curated_tracks_sample || []).map(t => {
          const art = t.album_art ? `<img class="ta" src="${t.album_art}" alt="">` : `<div class="tap">♪</div>`;
          return `<div class="tr2">${art}<div><div class="tn">${t.name}</div><div class="tar">${t.artist}</div></div></div>`;
        }).join('')}</div>`;
  }

  document.getElementById('pb').innerHTML = h;
  document.getElementById('panel').classList.add('open');
}

document.getElementById('px').addEventListener('click', () => {
  document.getElementById('panel').classList.remove('open');
});
