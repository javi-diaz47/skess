import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import { WebSocketContext } from '../context/WebSockets/WebsSocketsContext'
import { getSvgPathFromStroke } from '../utils/getSvgPathFromStroke'
import getStroke from 'perfect-freehand'
import { STROKE_OPTIONS } from '../contants/strokeOptions'
import { SKETCH_COLORS } from '../contants/sketchColors'
import type {
  CreateSketchEvent,
  Path,
  SketchEvent,
} from '../context/WebSockets/types'

export const useSketch = () => {
  const { subscribe, send } = useContext(WebSocketContext)

  const [paths, setPaths] = useState<Path[]>([])
  const [color, setColor] = useState(SKETCH_COLORS['black']['base'])

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

    if (!canvas.current) return

    //const newPath = new Path2D(lastPath.current)

    const newPath: Path = {
      points: normalizePoints(points.current),
      color,
    }

    setPaths((prev) => [...prev, newPath])

    const newEv: CreateSketchEvent = {
      type: 'sketch',

      path: newPath,

      sketching: false,
    }
    send(newEv)

    points.current = []
    lastPath.current = ''

    svgPath.current?.setAttribute('fill', '')
    svgPath.current?.setAttribute('d', '')
  }

  const onPointerMove = (ev: PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current || canvas.current === null) return

    const rect = canvas.current.getBoundingClientRect()
    points.current.push([ev.clientX - rect.left, ev.clientY - rect.top])

    const outlinePoints = getStroke(points.current, STROKE_OPTIONS)
    const pathData = getSvgPathFromStroke(outlinePoints)

    lastPath.current = pathData

    svgPath.current?.setAttribute('fill', color)
    svgPath.current?.setAttribute('d', pathData)

    const normalizePoints = points.current.map((coor) => [
      coor[0] / rect.width,
      coor[1] / rect.height,
    ])

    const sketchingPath: Path = {
      points: normalizePoints,
      color,
    }

    const newEv: CreateSketchEvent = {
      type: 'sketch',
      sketching: true,
      path: sketchingPath,
    }

    send(newEv)
  }

  const scalePoints = useCallback((points: number[][]): number[][] => {
    if (canvas.current === null) return []

    const rect = canvas.current.getBoundingClientRect()
    return points.map((coor) => [coor[0] * rect.width, coor[1] * rect.height])
  }, [])

  const normalizePoints = (points: number[][]): number[][] => {
    if (canvas.current === null) return []

    const rect = canvas.current.getBoundingClientRect()
    return points.map((coor) => [coor[0] / rect.width, coor[1] / rect.height])
  }

  const createSvgPath = useCallback(
    (points: number[][]): string => {
      const scaledPoints = scalePoints(points)
      const outlinePoints = getStroke(scaledPoints, STROKE_OPTIONS)
      return getSvgPathFromStroke(outlinePoints)
    },
    [scalePoints],
  )

  const sketch = useCallback(() => {
    if (canvas.current === null) return

    const ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    paths.forEach((cur) => {
      ctx.beginPath()
      ctx.fillStyle = cur.color

      const pathData = createSvgPath(cur.points)
      const path = new Path2D(pathData)

      ctx.fill(path)
      ctx.closePath()
    })
  }, [paths, createSvgPath])

  useEffect(() => {
    if (canvas.current === null) return

    const rect = canvas.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.current.width = rect.width * dpr
    canvas.current.height = rect.height * dpr

    canvas.current.getContext('2d')?.scale(dpr, dpr)

    const unsubSketch = subscribe('sketch', (data: SketchEvent) => {
      if (data.sketching) {
        // sketching
        const path = createSvgPath(data.path.points)
        svgPath.current?.setAttribute('fill', data.path.color)
        svgPath.current?.setAttribute('d', path)
      } else {
        // end sketch
        setPaths((prev) => [...prev, data.path])
      }
    })

    const unsubStarted = subscribe('game_started', () => {
      setPaths([])
    })

    return () => {
      unsubSketch()
      unsubStarted()
    }
  }, [subscribe, createSvgPath])

  useEffect(() => {
    sketch()

    svgPath.current?.setAttribute('fill', '')
    svgPath.current?.setAttribute('d', '')
  }, [paths, sketch])

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
