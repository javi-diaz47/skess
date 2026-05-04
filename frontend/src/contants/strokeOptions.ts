import { type StrokeOptions } from "perfect-freehand"

export const STROKE_OPTIONS: StrokeOptions = {
  size: 8,
  smoothing: 0.5,
  thinning: 0.5,
  streamline: 0.5,
  easing: (t) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
}


