/* Boombox pixel art grid — 22 cols × 9 rows
   A=antenna  H=handle  F=frame
   L=left speaker ring  G=left speaker glow
   R=right speaker ring S=right speaker glow
   C=cassette frame  T=cassette tape
   K=button  .=empty
*/
export const GRID = [
  ['.','.','.','.','.','.','.','.','.','.',  'A','.','.','.','.','.','.','.','.','.','.','.',],
  ['.','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','.','.',],
  ['.','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','.',],
  ['.','F','L','L','L','L','L','.','C','C','C','C','C','C','.','R','R','R','R','R','F','.',],
  ['.','F','L','G','G','G','L','.','C','T','T','T','T','C','.','R','S','S','S','R','F','.',],
  ['.','F','L','G','G','G','L','.','C','T','T','T','T','C','.','R','S','S','S','R','F','.',],
  ['.','F','L','L','L','L','L','.','C','C','C','C','C','C','.','R','R','R','R','R','F','.',],
  ['.','F','.','K','.','K','.','.','.',  'K','K','K','.','.','.','.','K','.','K','.','F','.',],
  ['.','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','.',],
];

export const PIXEL_COLORS = {
  A: '#ffee00',   // antenna  – yellow
  H: '#8a8a8a',   // handle   – mid gray
  F: '#c0c0c0',   // frame    – silver
  L: '#111111',   // left speaker ring
  G: '#1ed760',   // left speaker glow  – green
  R: '#111111',   // right speaker ring
  S: '#59cfcf',   // right speaker glow – cyan
  C: '#333333',   // cassette frame
  T: '#b967ff',   // cassette tape      – purple
  K: '#ff2244',   // button             – red
};

export const PIXEL_PARTS = {
  A: 'antenna', H: 'handle', F: 'frame',
  L: 'left-speaker',  G: 'left-speaker',
  R: 'right-speaker', S: 'right-speaker',
  C: 'cassette', T: 'cassette',
  K: 'buttons',
};

/* Section definitions – each maps to one boombox part exploding */
export const SECTIONS = [
  { key: 'OVERVIEW', label: 'RUN OVERVIEW',   panelId: 'panel-overview'  },
  { key: 'ENERGY',   label: 'ENERGY LEVEL',   panelId: 'panel-energy'    },
  { key: 'MOOD',     label: 'MOOD',            panelId: 'panel-mood'      },
  { key: 'GENRES',   label: 'GENRE DNA',       panelId: 'panel-genres'    },
  { key: 'ARTISTS',  label: 'TOP ARTISTS',     panelId: 'panel-artists'   },
  { key: 'DNA',      label: 'TASTE PROFILE',   panelId: 'panel-dna'       },
  { key: 'CURATED',  label: 'CURATED MIX',     panelId: 'panel-curated'   },
];

/* Timeline timestamps (ms) — total duration is 10 000 ms */
export const TL_DURATION = 10000;

export const TL = {
  ANTENNA_START:      700,
  HANDLE_START:       2000,
  L_SPEAKER_START:    3100,
  CASSETTE_START:     4200,
  R_SPEAKER_START:    5300,
  BUTTONS_START:      6400,
  FRAME_START:        7400,

  OVERVIEW_IN:        1700,
  ENERGY_IN:          2900,
  MOOD_IN:            4000,
  GENRES_IN:          5100,
  ARTISTS_IN:         6200,
  DNA_IN:             7200,
  CURATED_IN:         8800,
};
