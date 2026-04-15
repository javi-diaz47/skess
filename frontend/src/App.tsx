import { SessionNicknameForm } from "./components/SessionNicknameForm"

function App() {

  return (
    <main className="h-screen bg-background-50 text-text-900 dark:bg-background-950 dark:text-text-50 p-4">
      <div className="max-w-7xl">
        <h2 className="text-4xl font-bold">Skess</h2>
        <SessionNicknameForm />
      </div >
    </main >
  )
}

export default App
