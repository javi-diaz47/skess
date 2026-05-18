import { twMerge } from "tailwind-merge";


export function Timer({ time, className = "" }: { time: number, className?: string }) {
  return (
    <div className={twMerge("min-w-19 grid grid-rows-1 md:grid-rows-2 grid-cols-[1.75rem_1fr] gap-x-1 md:gap-x-2 px-2 md:px-4 py-1 rounded-full  bg-background-100 dark:bg-background-900 text-text-900 dark:text-text-50", className)}>
      <div className="row-span-2 self-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="row-span-2 w-7 md:w-8 h-7 md:h-8 text-accent-400"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0" />
          <path d="M14.5 10.5l-2.5 2.5" />
          <path d="M17 8l1 -1" />
          <path d="M14 3h-4" />
        </svg>
      </div>

      <span className="hidden md:block self-end text-xs w-16 h-fit uppercase font-bold">Time left</span>

      <p className={`${time <= 5 ? "text-accent-400" : ""} h-fit self-center justify-self-center md:justify-self-start text-sm md:text-xl md:row-span-2 md:self-start font-bold`}>
        {time}
        <span className="text-[10px] md:text-sm font-normal"> S</span>
      </p>

    </div>
  )
}
