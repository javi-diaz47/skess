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

export function SketchBoard() {

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

    setPaths(prev => [...prev, { path: newPath, color: 'green' }])
    points.current = []

    svgPath.current?.setAttribute("d", "")
  }

  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current) return;

    const rect = canvas.current.getBoundingClientRect()
    points.current.push([ev.clientX - rect.left, ev.clientY - rect.top])

    const outlinePoints = getStroke(points.current, STROKE_OPTIONS)
    const pathData = getSvgPathFromStroke(outlinePoints)

    lastPath.current = pathData

    svgPath.current?.setAttribute("d", pathData)

  }

  const sketch = () => {
    const ctx = canvas.current.getContext('2d')

    paths.forEach(cur => {
      ctx.fillStyle = cur.color
      ctx.fill(cur.path)
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
    <div className="relative">
      <canvas
        ref={canvas}
        className="w-96 h-96 bg-background-800"
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
  )
}
