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
    <div className="h-full flex flex-col items-center relative">
      <div className="relative w-full h-full">
        <canvas
          ref={canvas}
          className="w-full h-full bg-background-100 dark:bg-background-800 rounded-2xl"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <svg className="w-full h-full absolute top-0 pointer-events-none">
          <g>
            <path ref={svgPath} />
          </g>
        </svg>
      </div>
      <div className="flex absolute bottom-5 gap-2 mt-2 px-4 py-2 bg-background-200 dark:bg-background-900 rounded-2xl w-fit shadow-2xl shadow-background-200 dark:shadow-background-900">
        {Object.entries(SKETCH_COLORS).map(([name, value]) => {
          const c = value.base;

          return (
            <button
              key={name}
              onClick={() => onChangeColor(c)}
              className={`w-6 h-6 rounded-full ${color === c ? 'ring-3 ring-accent-500 border-1 border-primary-200' : ''}`}
              style={{ backgroundColor: c }}
              title={name}
            />
          );
        })}
      </div>
    </div>
  )
}
