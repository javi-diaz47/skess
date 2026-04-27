import { useContext, useEffect, useRef, useState, type PointerEvent } from "react"
import { WebSocketContext } from "../context/WebsSocketsContext"
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
import getStroke from "perfect-freehand";
import { STROKE_OPTIONS } from "../contants/strokeOptions";
import { SKETCH_COLORS } from "../contants/sketchColors";

interface Path {
  path: Path2D,
  color: string
}


export const useSketch = () => {

  const { subscribe, send } = useContext(WebSocketContext)

  const [paths, setPaths] = useState<Path[]>([])
  const [color, setColor] = useState(SKETCH_COLORS["black"]["base"])

  const canvas = useRef<HTMLCanvasElement>(null)
  const svgPath = useRef<SVGPathElement>(null)

  const points = useRef<number[][]>([])
  const lastPath = useRef('')
  const isPointerDown = useRef(false)

  const onChangeColor = (color: string) => {
    setColor(color)
  }

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

    send({
      type: "sketch",
      payload: {
        color,
        sketching: false,
        path: lastPath.current
      }
    })

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

    send({
      type: "sketch",
      payload: {
        color,
        sketching: true,
        path: lastPath.current
      }
    })

    svgPath.current.setAttribute("fill", color)
    svgPath.current?.setAttribute("d", pathData)

  }

  const sketch = () => {
    const ctx = canvas.current.getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    paths.forEach(cur => {
      ctx.beginPath()
      ctx.fillStyle = cur.color
      ctx.fill(cur.path)
      ctx.closePath()
    })

  }


  useEffect(() => {

    if (canvas.current === null) return;

    const rect = canvas.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1;

    canvas.current.width = rect.width * dpr;
    canvas.current.height = rect.height * dpr;

    canvas.current.getContext('2d').scale(dpr, dpr);

    const unsubGuess = subscribe("sketch", (data) => {

      if (data.payload.sketching) {
        // sketching
        svgPath.current.setAttribute("fill", data.payload.color)
        svgPath.current?.setAttribute("d", data.payload.path)

      } else {
        // end sketch
        setPaths(prev => [...prev, { path: new Path2D(data.payload.path), color: data.payload.color }])
      }

    })

    const unsubStatus = subscribe("status", (ev) => {
      if (ev.payload.status === "start") {
        setPaths([])
      }
    })

    return () => {
      unsubGuess()
      unsubStatus()
    }

  }, [])

  useEffect(() => {
    sketch()

    svgPath.current.setAttribute("fill", "")
    svgPath.current?.setAttribute("d", "")

  }, [paths])


  return {
    color,

    canvas,
    svgPath,

    onChangeColor,
    onPointerDown,
    onPointerUp,
    onPointerMove,
  }

}
