// Shared animation constants for overlay panels and popovers.
export const MOTION = {
  spring: { damping: 25, stiffness: 200 },
  panelCurve: [0.22, 1, 0.36, 1] as [number, number, number, number],
  panelDuration: 0.55,
  fadeOffset: { y: 20, scale: 0.985 },
  tooltipDuration: 0.18,
} as const;
