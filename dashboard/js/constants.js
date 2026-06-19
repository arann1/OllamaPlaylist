export const SECS = [
  { key: 'OVERVIEW', label: 'Run Overview',  icon: '📊', col: 0x334444, y: 0  },
  { key: 'ENERGY',   label: 'Energy',        icon: '⚡', col: 0x1ed760, y: 8  },
  { key: 'MOOD',     label: 'Mood',          icon: '💭', col: 0x9b7fb6, y: 15 },
  { key: 'GENRES',   label: 'Genre DNA',     icon: '🎵', col: 0xb967ff, y: 22 },
  { key: 'ARTISTS',  label: 'Top Artists',   icon: '👤', col: 0xffa42b, y: 28 },
  { key: 'DNA',      label: 'Taste Profile', icon: '🧬', col: 0x59cfcf, y: 34 },
  { key: 'CURATED',  label: 'Curated',       icon: '🎧', col: 0xf037a5, y: 40 },
];

export const ENERGY_COL = { low: 0x59cfcf, medium: 0xffa42b, high: 0x1ed760 };
export const ENERGY_H   = { low: 1, medium: 2, high: 3 };
export const ARTIST_COL = [0xffa42b, 0xffcc44, 0xff8c00, 0xffaa22, 0xe89020];
export const DNA_COL    = [0xb967ff, 0x59cfcf, 0xf037a5, 0x477dff, 0xffa42b];
export const CURATED_C  = [0x1ed760, 0x59cfcf, 0xb967ff, 0xf037a5, 0xffa42b];
export const GC         = [0xb967ff, 0xf037a5, 0x477dff, 0xff8c00, 0x59cfcf];
export const GCS        = ['#b967ff', '#f037a5', '#477dff', '#ff8c00', '#59cfcf'];

export const SEC_NAMES = {
  OVERVIEW: 'Run Overview', ENERGY: 'Energy Level', MOOD: 'Mood',
  GENRES: 'Genre DNA', ARTISTS: 'Top Artists', DNA: 'Taste Profile', CURATED: 'Curated Playlist',
};
