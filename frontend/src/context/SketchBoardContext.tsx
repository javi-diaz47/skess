import { createContext, useContext, useEffect, useRef, useState, type PointerEvent, type Ref } from "react";
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
import getStroke from "perfect-freehand";
import { STROKE_OPTIONS } from "../contants/strokeOptions";
import { WebsocketContext } from "./Websockets";
import { SKETCH_COLORS } from "../contants/sketchColors";

interface Path {
  path: Path2D,
  color: string
}


interface SketchBoardInterface {
  color: string,

  canvas: Ref<HTMLCanvasElement>,
  svgPath: Ref<SVGPathElement>,

  onChangeColor: (color: string) => void
  onPointerDown: (ev: PointerEvent<HTMLCanvasElement>) => void,
  onPointerUp: (ev: PointerEvent<HTMLCanvasElement>) => void,
  onPointerMove: (ev: PointerEvent<HTMLCanvasElement>) => void
}

export const SketchBoardContext = createContext<SketchBoardInterface>(null)

export const SketchBoardProvider = ({ children }) => {

  const [color, setColor] = useState(SKETCH_COLORS["black"]["base"])

  const [paths, setPaths] = useState<Path[]>([])

  const canvas = useRef<HTMLCanvasElement>(null)
  const svgPath = useRef<SVGPathElement>(null)
  const lastPath = useRef('')

  const points = useRef<number[][]>([])

  const isPointerDown = useRef(false)

  const { sketch: pathsWebscoket, onSendMessage } = useContext(WebsocketContext)

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
    <SketchBoardContext.Provider value={{
      color,

      canvas,
      svgPath,

      onChangeColor,
      onPointerDown,
      onPointerUp,
      onPointerMove,
    }}>
      {children}
    </SketchBoardContext.Provider>
  )
}
