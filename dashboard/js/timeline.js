/* Anime.js scroll-driven disassembly timeline */
import { TL } from './constants.js';

const anime = window.anime;

const PART_DUR  = 550;
const PANEL_DUR = 400;
const STAGGER   = 18;
const OUT_EASE  = 'easeInCubic';
const IN_EASE   = 'easeOutQuad';

/* Read pre-computed scatter offset stored on each pixel element */
const tx  = el => +el.dataset.tx;
const ty  = el => +el.dataset.ty;
const rot = el => +el.dataset.rot;

export function buildTimeline() {
  const tl = anime.timeline({ autoplay: false, easing: OUT_EASE });

  /* ── 0: idle pulse (boombox breathes while user reads the page) */
  tl.add({
    targets: '#boombox-container',
    scale: [1, 1.015, 1],
    duration: 700,
    easing: 'easeInOutSine',
  }, 0);

  /* ── 1: ANTENNA flies off → OVERVIEW panel slides in */
  tl.add({
    targets: '[data-part="antenna"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR,
    delay: anime.stagger(STAGGER),
  }, TL.ANTENNA_START);

  tl.add({
    targets: '#panel-overview',
    opacity: [0, 1], translateY: [16, 0],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.OVERVIEW_IN);

  /* ── 2: HANDLE arcs off → ENERGY panel */
  tl.add({
    targets: '[data-part="handle"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR,
    delay: anime.stagger(STAGGER, { from: 'center' }),
  }, TL.HANDLE_START);

  tl.add({
    targets: '#panel-energy',
    opacity: [0, 1], translateX: [-16, 0],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.ENERGY_IN);

  /* ── 3: LEFT SPEAKER scatters → MOOD panel */
  tl.add({
    targets: '[data-part="left-speaker"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR,
    delay: anime.stagger(STAGGER, { from: 'last' }),
  }, TL.L_SPEAKER_START);

  tl.add({
    targets: '#panel-mood',
    opacity: [0, 1], translateX: [-16, 0],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.MOOD_IN);

  /* ── 4: CASSETTE drops → GENRES panel */
  tl.add({
    targets: '[data-part="cassette"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR + 100,
    delay: anime.stagger(STAGGER, { from: 'center' }),
  }, TL.CASSETTE_START);

  tl.add({
    targets: '#panel-genres',
    opacity: [0, 1], translateX: [16, 0],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.GENRES_IN);

  /* ── 5: RIGHT SPEAKER scatters → ARTISTS panel */
  tl.add({
    targets: '[data-part="right-speaker"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR,
    delay: anime.stagger(STAGGER, { from: 'first' }),
  }, TL.R_SPEAKER_START);

  tl.add({
    targets: '#panel-artists',
    opacity: [0, 1], translateX: [16, 0],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.ARTISTS_IN);

  /* ── 6: BUTTONS scatter → DNA panel */
  tl.add({
    targets: '[data-part="buttons"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR,
    delay: anime.stagger(STAGGER * 2, { from: 'random' }),
  }, TL.BUTTONS_START);

  tl.add({
    targets: '#panel-dna',
    opacity: [0, 1], scale: [0.9, 1],
    duration: PANEL_DUR, easing: IN_EASE,
  }, TL.DNA_IN);

  /* ── 7: FRAME explodes outward → CURATED panel (grand finale) */
  tl.add({
    targets: '[data-part="frame"]',
    translateX: tx, translateY: ty, rotate: rot, opacity: 0,
    duration: PART_DUR + 200,
    delay: anime.stagger(12, { from: 'random' }),
    easing: 'easeInExpo',
  }, TL.FRAME_START);

  tl.add({
    targets: '#panel-curated',
    opacity: [0, 1], translateY: [16, 0],
    duration: PANEL_DUR + 100, easing: IN_EASE,
  }, TL.CURATED_IN);

  return tl;
}

/* Return which section index (0-6) we're currently in */
export function sectionAt(ms) {
  if (ms < TL.OVERVIEW_IN)  return -1;
  if (ms < TL.ENERGY_IN)    return 0;
  if (ms < TL.MOOD_IN)      return 1;
  if (ms < TL.GENRES_IN)    return 2;
  if (ms < TL.ARTISTS_IN)   return 3;
  if (ms < TL.DNA_IN)       return 4;
  if (ms < TL.CURATED_IN)   return 5;
  return 6;
}
