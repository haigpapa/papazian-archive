export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_DURATION = {
  fast: 0.16,
  base: 0.28,
  slow: 0.46,
} as const;

export const MOTION_SPRING = {
  drawer: { type: 'spring' as const, damping: 26, stiffness: 170 },
  settle: { type: 'spring' as const, damping: 20, stiffness: 100 },
} as const;

export const SPATIAL_DURATION = {
  response: 0.25,
  filter: 0.45,
  visibility: 0.65,
  layout: 1.25,
  mapLayout: 1.35,
  camera: 1.2,
  cameraReset: 1.5,
} as const;

export const SPATIAL_EASE = {
  response: 'power2.out',
  settle: 'power2.inOut',
  layout: 'expo.inOut',
  map: 'power4.out',
} as const;
