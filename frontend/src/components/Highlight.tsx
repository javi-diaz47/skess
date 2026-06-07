interface Highlight {
  icon: React.ReactNode
  title: string
  desc: string
}

export function Highlight({ icon, title, desc }: Highlight) {
  return (
    <div className="flex gap-4">
      <div className="bg-background-100 dark:bg-background-800 text-primary-500 dark:text-primary-50 p-3 h-fit w-fit rounded-2xl">
        {icon}
      </div>
      <div>
        <h2 className="text-md font-bold">{title}</h2>
        <p className="text-s">{desc}</p>
      </div>
    </div>
  )
}
