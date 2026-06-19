export function fmtSec(s) {
  if (!s) return '—';
  return Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
}

export function relTime(ts) {
  if (!ts) return '';
  const s = (Date.now() - new Date(ts)) / 1000;
  if (s < 3600)  return Math.round(s / 60) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
}

/* Deterministic scatter offset for a pixel — stable across seeks */
export function partOffset(char, col, row) {
  /* Two independent noise seeds, deterministic per pixel position */
  const s1 = ((col * 7)  + (row * 13) + (col * row * 3)) % 100; // 0-99
  const s2 = ((col * 11) + (row * 17)) % 100;                    // 0-99
  const n1 = s1 - 50;  // -50 .. 49
  const n2 = s2 - 50;

  switch (char) {
    case 'A':
      return { tx: n1 * 0.5, ty: -320 - s1, rot: n1 * 4 };

    case 'H':
      return { tx: (col - 10.5) * 14 + n1 * 1.5, ty: -180 - s1 * 2, rot: n1 * 3 };

    case 'L':
    case 'G':
      return { tx: -270 - s1 * 2.5, ty: (row - 4.5) * 28 + n1 * 2, rot: -Math.abs(n1) * 3 };

    case 'R':
    case 'S':
      return { tx: 270 + s1 * 2.5, ty: (row - 4.5) * 28 + n1 * 2, rot: Math.abs(n1) * 3 };

    case 'C':
    case 'T':
      return { tx: n1 * 3, ty: 270 + s1 * 2.5, rot: n1 * 4 };

    case 'K':
      return {
        tx: (col - 10.5) * 22 + n1 * 4,
        ty: 190 + s1 * 4,
        rot: n1 * 7,
      };

    case 'F': {
      /* Frame pixels explode OUTWARD from boombox centre */
      const bcx = 10.5, bcy = 4.5;
      const dx = col - bcx, dy = row - bcy;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5);
      return {
        tx: Math.round((dx / dist) * (290 + s1 * 3) + n2 * 0.4),
        ty: Math.round((dy / dist) * (290 + s1 * 3) + n1 * 0.4),
        rot: n1 * 5,
      };
    }

    default:
      return { tx: 0, ty: 0, rot: 0 };
  }
}
