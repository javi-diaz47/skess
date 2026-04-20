import getStroke, { type StrokeOptions } from "perfect-freehand"
import { useEffect, useRef, useState, type PointerEvent } from "react"
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke"

const STROKE_OPTIONS: StrokeOptions = {
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

interface Path {
  path: Path2D,
  color: string
}


export const COLORS = {
  red: { light: "#f87171", base: "#dc2626", dark: "#991b1b" },
  orange: { light: "#fb923c", base: "#ea580c", dark: "#9a3412" },
  yellow: { light: "#facc15", base: "#ca8a04", dark: "#854d0e" },
  green: { light: "#4ade80", base: "#16a34a", dark: "#166534" },
  blue: { light: "#60a5fa", base: "#2563eb", dark: "#1e40af" },
  purple: { light: "#c084fc", base: "#9333ea", dark: "#6b21a8" },
  pink: { light: "#f472b6", base: "#db2777", dark: "#9d174d" },

  black: { light: "#000", base: "#000", dark: "#000" },
  white: { light: "#fff", base: "#fff", dark: "#fff" },
};

export function SketchBoard() {

  const [color, setColor] = useState(COLORS["black"]["base"])

  const [paths, setPaths] = useState<Path[]>([])

  const canvas = useRef<HTMLCanvasElement>(null)
  const svgPath = useRef<SVGPathElement>(null)
  const lastPath = useRef('')

  const points = useRef([])

  const isPointerDown = useRef(false)

  const onPointerDown = () => {
    isPointerDown.current = true
  }

  const onPointerUp = () => {
    isPointerDown.current = false

    if (!canvas.current) return;

    const newPath = new Path2D(lastPath.current)

    setPaths(prev => [...prev, { path: newPath, color }])
    points.current = []

    svgPath.current.setAttribute("fill", "")
    svgPath.current?.setAttribute("d", "")
  }

  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current) return;

    const rect = canvas.current.getBoundingClientRect()
    points.current.push([ev.clientX - rect.left, ev.clientY - rect.top])

    const outlinePoints = getStroke(points.current, STROKE_OPTIONS)
    const pathData = getSvgPathFromStroke(outlinePoints)

    lastPath.current = pathData

    svgPath.current.setAttribute("fill", color)
    svgPath.current?.setAttribute("d", pathData)

  }

  const sketch = () => {
    const ctx = canvas.current.getContext('2d')

    paths.forEach(cur => {
      ctx.beginPath()
      ctx.fillStyle = cur.color
      ctx.fill(cur.path)
      ctx.closePath()
    })
  }

  useEffect(() => {
    sketch()
  }, [paths])


  useEffect(() => {
    if (canvas.current === null) return;

    const rect = canvas.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1;

    canvas.current.width = rect.width * dpr;
    canvas.current.height = rect.height * dpr;

    canvas.current.getContext('2d').scale(dpr, dpr);

  }, [])

  return (
    <>

      <div className="relative">
        <canvas
          ref={canvas}
          className="w-96 h-96 bg-background-100 dark:bg-background-800"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        ></canvas>
        <svg className="w-96 h-96 absolute top-0 pointer-events-none">
          <g>
            <path ref={svgPath} />
          </g>
        </svg>
      </div>
      <div className="flex gap-1 p-2 bg-background-100 dark:bg-background-800 rounded-lg w-fit">
        {Object.entries(COLORS).map(([name, value]) => {
          const c = value.base;

          return (
            <button
              key={name}
              onClick={() => setColor(c)}
              className={`w-4 h-4 rounded-full ${color === c ? 'ring-2 ring-accent-200' : ''}`}
              style={{ backgroundColor: c }}
              title={name}
            />
          );
        })}
      </div>
    </>
  )
}
