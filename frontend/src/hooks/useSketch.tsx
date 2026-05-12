import { useContext, useEffect, useRef, useState, type PointerEvent } from "react"
import { WebSocketContext, type Path } from "../context/WebsSocketsContext"
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
import getStroke from "perfect-freehand";
import { STROKE_OPTIONS } from "../contants/strokeOptions";
import { SKETCH_COLORS } from "../contants/sketchColors";


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

    //const newPath = new Path2D(lastPath.current)

    const newPath: Path = {
      points: normalizePoints(points.current),
      color
    }

    setPaths(prev => [...prev, newPath])

    send({
      type: "sketch",
      payload: {
        sketching: false,
        path: newPath
      }
    })

    points.current = []
    lastPath.current = ""

    svgPath.current.setAttribute("fill", "")
    svgPath.current?.setAttribute("d", "")
  }

  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current) return;

    const rect = canvas.current.getBoundingClientRect()
    points.current.push([(ev.clientX - rect.left), ev.clientY - rect.top])

    const outlinePoints = getStroke(points.current, STROKE_OPTIONS)
    const pathData = getSvgPathFromStroke(outlinePoints)

    lastPath.current = pathData

    svgPath.current.setAttribute("fill", color)
    svgPath.current?.setAttribute("d", pathData)

    const normalizePoints = points.current.map(coor => [coor[0] / rect.width, coor[1] / rect.height])

    const sketchingPath: Path = {
      points: normalizePoints,
      color
    }

    send({
      type: "sketch",
      payload: {
        sketching: true,
        path: sketchingPath
      }
    })


  }

  const sketch = () => {
    const ctx = canvas.current.getContext('2d')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


    paths.forEach(cur => {
      ctx.beginPath()
      ctx.fillStyle = cur.color

      const pathData = createSvgPath(cur.points)
      const path = new Path2D(pathData)

      ctx.fill(path)
      ctx.closePath()
    })

  }

  const scalePoints = (points: number[][]): number[][] => {
    const rect = canvas.current.getBoundingClientRect()
    return points.map(coor => [coor[0] * rect.width, coor[1] * rect.height])
  }

  const normalizePoints = (points: number[][]): number[][] => {
    const rect = canvas.current.getBoundingClientRect()
    return points.map(coor => [coor[0] / rect.width, coor[1] / rect.height])
  }

  const createSvgPath = (points: number[][]): string => {
    const scaledPoints = scalePoints(points)
    const outlinePoints = getStroke(scaledPoints, STROKE_OPTIONS)
    return getSvgPathFromStroke(outlinePoints)
  }


  useEffect(() => {

    if (canvas.current === null) return;

    const rect = canvas.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1;

    canvas.current.width = rect.width * dpr;
    canvas.current.height = rect.height * dpr;

    canvas.current.getContext('2d').scale(dpr, dpr);

    const unsubSketch = subscribe("sketch", (data) => {
      console.log("received", data.payload)

      if (data.payload.sketching) {
        // sketching
        const path = createSvgPath(data.payload.path.points)
        svgPath.current.setAttribute("fill", data.payload.path.color)
        svgPath.current?.setAttribute("d", path)

      } else {
        // end sketch
        setPaths(prev => [...prev, data.payload.path])
      }

    })

    const unsubStatus = subscribe("status", (ev) => {
      if (ev.payload.status === "start") {
        setPaths([])
      }
    })

    return () => {
      unsubSketch()
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
