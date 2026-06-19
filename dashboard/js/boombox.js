/* Renders the pixel-art boombox into #boombox-container */
import { GRID, PIXEL_COLORS, PIXEL_PARTS } from './constants.js';
import { partOffset } from './utils.js';

const PX = 28; /* natural pixel size (px) */
export const COLS = 22;
export const ROWS = GRID.length; // 9

export function renderBoombox(container) {
  container.innerHTML = '';
  container.style.width  = COLS * PX + 'px';
  container.style.height = ROWS * PX + 'px';
  container.style.position = 'relative';

  GRID.forEach((row, r) => {
    row.forEach((char, c) => {
      if (char === '.') return;
      const off  = partOffset(char, c, r);
      const part = PIXEL_PARTS[char];
      const div  = document.createElement('div');

      div.className   = 'px';
      div.dataset.part = part;
      div.dataset.tx   = off.tx;
      div.dataset.ty   = off.ty;
      div.dataset.rot  = off.rot;

      div.style.cssText = [
        `position:absolute`,
        `width:${PX}px`,
        `height:${PX}px`,
        `left:${c * PX}px`,
        `top:${r * PX}px`,
        `background:${PIXEL_COLORS[char]}`,
        `image-rendering:pixelated`,
      ].join(';');

      container.appendChild(div);
    });
  });
}

/* Scale boombox so it fits the viewport with generous margin */
export function scaleBoombox(wrap) {
  const naturalW = COLS * PX;
  const maxW     = Math.min(window.innerWidth  * 0.55, naturalW);
  const maxH     = Math.min(window.innerHeight * 0.45, ROWS * PX);
  const scale    = Math.min(maxW / naturalW, maxH / (ROWS * PX), 1);
  wrap.style.transform       = `scale(${scale})`;
  wrap.style.transformOrigin = 'center center';
  return scale;
}
