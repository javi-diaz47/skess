import getStroke from "perfect-freehand"
import { useContext, useEffect, useRef, useState, type PointerEvent } from "react"
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke"
import { WebsocketContext } from "../context/Websockets"
import { SKETCH_COLORS } from "../contants/sketchColors"
import { STROKE_OPTIONS } from "../contants/strokeOptions"

interface Path {
  path: Path2D,
  color: string
}

export function SketchBoard() {

  const [color, setColor] = useState(SKETCH_COLORS["black"]["base"])

  const [paths, setPaths] = useState<Path[]>([])

  const canvas = useRef<HTMLCanvasElement>(null)
  const svgPath = useRef<SVGPathElement>(null)
  const lastPath = useRef('')

  const points = useRef([])

  const isPointerDown = useRef(false)

  const { sketch: pathsWebscoket, onSendMessage } = useContext(WebsocketContext)

  const onPointerDown = (ev: PointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = true
    ev.currentTarget.setPointerCapture(ev.pointerId)
  }

  const onPointerUp = (ev: PointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = false
    ev.currentTarget.releasePointerCapture(ev.pointerId)

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

    onSendMessage({
      type: "sketch",
      payload: {
        color,
        path: lastPath.current
      }
    })

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
    if (!pathsWebscoket.length) return
    const N = pathsWebscoket.length
    setPaths(prev => [...prev, {
      path: new Path2D(pathsWebscoket[N - 1].payload.path),
      color: pathsWebscoket[N - 1].payload.color
    }])
  }, [pathsWebscoket])


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
          onPointerCancel={onPointerUp}
        />
        <svg className="w-96 h-96 absolute top-0 pointer-events-none">
          <g>
            <path ref={svgPath} />
          </g>
        </svg>
      </div>
      <div className="flex gap-1 p-2 bg-background-100 dark:bg-background-800 rounded-lg w-fit">
        {Object.entries(SKETCH_COLORS).map(([name, value]) => {
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
