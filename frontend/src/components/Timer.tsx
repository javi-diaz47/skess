export function Timer({ time }: { time: number }) {
  return (
    <div className="flex items-center justify-center w-fit py-2 px-8 gap-2 bg-background-800 rounded-full text-accent-500">
      <svg
        width={36}
        height={36}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-stopwatch"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0" />
        <path d="M14.5 10.5l-2.5 2.5" />
        <path d="M17 8l1 -1" />
        <path d="M14 3h-4" />
      </svg>
      <div className="flex flex-col">
        <span className="text-xs text-background-300 uppercase font-bold">Time left</span>
        <p className={`${time <= 5 ? "text-accent-400" : "text-background-50"} text-2xl font-bold`}>
          {time}
          <span className="text-xs">S</span>
        </p>
      </div>
    </div>
  )
}
