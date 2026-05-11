import { Header } from "./components/Header"
import { SessionNicknameForm } from "./components/SessionNicknameForm"

export function Login() {

  return (
    <main className="h-screen bg-background-50 text-text-900 dark:bg-background-950 dark:text-text-50 p-4">
      <div className="max-w-7xl">
        <Header />
        <SessionNicknameForm />
      </div >
    </main >
  )
}
