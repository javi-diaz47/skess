import { Chat } from "./components/Chat";
import { SketchBoard } from "./components/SketchBoard"
import { Leaderboard } from "./components/Leaderboard";
import { WordSelector } from "./components/WordSelector";
import { PlayButton } from "./components/PlayButtton";
import { Header } from "./components/Header";

export function Home() {

  return (
    <main className="max-w-8xl bg-background-50 text-text-900 dark:bg-background-950 dark:text-text-50 p-8">
      <Header />
      <div className="grid grid-rows-3 md:grid-cols-2 md:grid-rows-2 lg:grid-flow-col lg:grid-cols-7 lg:grid-rows-2 gap-4 relative">
        <div className="md:col-span-2 lg:col-span-5 lg:row-span-2">
          <SketchBoard />
        </div>
        <div className="lg:col-span-2">
          <Chat />
        </div>
        <div className="lg:col-span-2">
          <Leaderboard />
        </div>
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-accent-300">
          <WordSelector />
        </div>
      </div>
      <PlayButton />
    </main>
  )
}
