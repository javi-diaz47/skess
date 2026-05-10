import { Chat } from "./components/Chat";
import { SketchBoard } from "./components/SketchBoard"
import { Leaderboard } from "./components/Leaderboard";
import { WordSelector } from "./components/WordSelector";
import { PlayButton } from "./components/PlayButtton";
import { Header } from "./components/Header";
import { StatusBar } from "./components/StatusBar";

export function Home() {

  return (
    <div className="flex justify-center">
      <main className="flex flex-col w-full max-w-7xl bg-background-50 text-text-900 dark:bg-background-950 dark:text-text-50 p-4">
        <div className="shrink-0">
          <Header />
        </div>
        <section className="flex-1 flex flex-col gap-6">
          <div className="shrink-0">
            <StatusBar />
          </div>

          <div className="flex-1 grid grid-rows-3 md:grid-rows-[1fr_auto_auto] md:grid-cols-2 lg:grid-cols-7 lg:grid-rows-2 gap-4">
            <div className="md:col-span-2 lg:col-span-5 lg:row-span-2 relative">
              <SketchBoard />
              <div className="absolute left-1/2 top-1/2 -translate-1/2">
                <WordSelector />
              </div>
            </div>

            <div className="lg:col-span-2">
              <Chat />
            </div>

            <div className="lg:col-span-2">
              <Leaderboard />
            </div>

            <PlayButton />
          </div>

        </section>
      </main>
    </div>
  )
}
