export function moodCol(mood) {
  const m = (mood || '').toLowerCase();
  if (m.includes('nostalgic'))                        return 0x9b7fb6;
  if (m.includes('happy') || m.includes('joyful'))   return 0xd4a820;
  if (m.includes('energetic') || m.includes('upbeat')) return 0xff6b35;
  if (m.includes('melancholic') || m.includes('sad')) return 0x4a7c9e;
  if (m.includes('calm') || m.includes('peaceful'))  return 0x5fa8a8;
  if (m.includes('reflective') || m.includes('introspective')) return 0x6b84a0;
  if (m.includes('dark') || m.includes('moody'))     return 0x6a4090;
  if (m.includes('relaxed') || m.includes('chill'))  return 0x3a8a7a;
  if (m.includes('romantic'))                        return 0xc0508a;
  return 0x8b4a6b;
}

export function hex2css(h) {
  return '#' + h.toString(16).padStart(6, '0');
}

export function relTime(ts) {
  if (!ts) return '';
  const s = (Date.now() - new Date(ts)) / 1000;
  if (s < 3600)  return Math.round(s / 60) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
}

export function fmtSec(s) {
  if (!s) return '—';
  return Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
}
