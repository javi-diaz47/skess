import { Chat } from './components/Chat'
import { SketchBoard } from './components/SketchBoard'
import { Leaderboard } from './components/Leaderboard'
import { WordSelector } from './components/WordSelector'
import { Header } from './components/Header'
import { StatusBar } from './components/StatusBar'
import { ChatInput } from './components/ChatInput'
import { TurnScores } from './components/TurnScores'
import { GameEnded } from './components/GameEnded'
import { ChoosingWord } from './components/ChoosingWord'
import { Round } from './components/Round'

export function Home() {
  return (
    <main
      className="w-full max-w-7xl grid p-2
      grid-cols-2 grid-rows-[auto_auto_1fr_minmax(0,1fr)_auto] gap-2
      md:grid-rows-[3rem_4rem_3fr_2fr_auto] md:grid-cols-[1fr_1fr] md:gap-4 md:p-4
      lg:max-h-3/4 lg:grid-rows-[3rem_4rem_1fr_1fr_auto] lg:grid-cols-[3fr_1fr] lg:gap-6
    ">
      <section className="col-span-2">
        <Header />
      </section>

      <section className="col-span-2">
        <StatusBar />
      </section>

      <section className="relative col-span-2 md:row-span-1 md:col-span-2 lg:row-span-3 lg:col-span-1">
        <SketchBoard />
        <div className="absolute left-1/2 top-1/2 -translate-1/2 bg-accent-300">
          <div className="relative">
            <Round />
            <ChoosingWord />
            <WordSelector />
            <TurnScores />
            <GameEnded />
          </div>
        </div>
      </section>

      <section className="lg:col-start-2">
        <Leaderboard />
      </section>

      <section className="min-h-0">
        <Chat />
      </section>

      <section className="col-span-2 lg:col-span-1">
        <ChatInput />
      </section>
    </main>
  )
}
