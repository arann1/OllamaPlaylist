/* Shared mutable state — import this object everywhere, mutate its properties */
export const state = {
  hitMeshes:    [],
  anims:        [],
  labelObjects: [],
  secLights:    [],

  currentRun:  null,
  currentSnap: 0,
  runIdx:      0,
  allData:     null,

  scrollLock:   false,
  camAngle:     Math.PI / 4,
  targetY:      0,
  smoothY:      0,
  smoothLookY:  0,
  ty0:          0,
};
