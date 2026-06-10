import { Header } from './components/Header'
import { Highlight } from './components/Highlight'
import { SessionNicknameForm } from './components/SessionNicknameForm'

export function Login() {
  return (
    <div className="min-h-screen flex justify-center bg-background-50 text-text-900 dark:bg-background-950 dark:text-text-50 p-0 md:p-4">
      <main className="w-full max-w-7xl flex flex-col gap-2 p-4">
        <Header />
        <div className="h-full flex flex-col gap-8 md:gap-16">
          <SessionNicknameForm />
          <div className="flex flex-col md:flex-row gap-8">
            <Highlight
              title="Fast"
              desc="Instant setup"
              icon={
                <svg
                  className="w-6 h-6 text-primary-500 dark:text-primary-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
                </svg>
              }
            />

            <Highlight
              title="Private"
              desc="Your data stays safe"
              icon={
                <svg
                  className="w-6 h-6 text-primary-500 dark:text-primary-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
                  <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                  <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
                </svg>
              }
            />

            <Highlight
              title="Connected"
              desc="Join rooms easily"
              icon={
                <svg
                  className="w-6 h-6 text-primary-500 dark:text-primary-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                  <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                </svg>
              }
            />
          </div>
        </div>
      </main>
    </div>
  )
}
