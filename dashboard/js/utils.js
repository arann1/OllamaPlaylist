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
