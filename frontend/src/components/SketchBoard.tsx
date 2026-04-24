import { SKETCH_COLORS } from "../contants/sketchColors"
import { useSketch } from "../hooks/useSketch"

export function SketchBoard() {

  const {
    color,
    canvas,
    svgPath,
    onChangeColor,
    onPointerDown,
    onPointerUp,
    onPointerMove,
  } = useSketch()

  return (
    <div>
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
              onClick={() => onChangeColor(c)}
              className={`w-4 h-4 rounded-full ${color === c ? 'ring-2 ring-accent-200' : ''}`}
              style={{ backgroundColor: c }}
              title={name}
            />
          );
        })}
      </div>
    </div>
  )
}
