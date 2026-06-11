import { useContext } from 'react'
import { SessionContext } from '../context/session/SessionContext'
import { CHAT_COLORS } from '../contants/chatColors'
import { useChat } from '../hooks/useChat'

export function Chat() {
  const { session } = useContext(SessionContext)
  const { messages } = useChat()

  return (
    <div className="h-full min-h-0 flex">
      <div className="w-full bg-background-100 dark:bg-background-900 overflow-y-auto p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 aspect-square text-text-400"
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
          <h2 className="md:text-2xl font-bold text-text-400 dark:text-text-200">
            Chat
          </h2>
        </div>

        <ul className="text-sm md:text-base">
          {messages &&
            messages.map((item) =>
              item.correct ? (
                <li
                  key={item.id}
                  className="mb-1 flex gap-2 bg-green-100 dark:bg-accent-900/80 border border-accent-500 rounded-xl p-2 font-bold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-6 text-accent-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 5h2" />
                    <path d="M5 4v2" />
                    <path d="M11.5 4l-.5 2" />
                    <path d="M18 5h2" />
                    <path d="M19 4v2" />
                    <path d="M15 9l-1 1" />
                    <path d="M18 13l2 -.5" />
                    <path d="M18 19h2" />
                    <path d="M19 18v2" />
                    <path d="M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39" />
                  </svg>
                  <p className="wrap-break-word">
                    <span className={`mr-2 ${CHAT_COLORS[item.sender.color]}`}>
                      {item.sender.name}:
                    </span>
                    guessed correctly!
                  </p>
                </li>
              ) : (
                <li key={item.id} className="mb-1">
                  {item.id.startsWith('system') ? (
                    <span
                      className={`block text-center text-sm italic ${item.id.startsWith('system-login') ? 'text-accent-500 dark:text-accent-300' : 'text-text-500 dark:text-text-300'}`}>
                      {item.message}
                    </span>
                  ) : (
                    <p className="wrap-break-word">
                      <span
                        className={`mr-2 font-bold ${CHAT_COLORS[item.sender.color]}`}>
                        {item.sender.name}
                        {item.sender.id === session?.id ? (
                          <span className="text-[10px] md:text-xs"> (you)</span>
                        ) : (
                          ''
                        )}
                        :
                      </span>
                      {item.message}
                    </p>
                  )}
                </li>
              ),
            )}
        </ul>
      </div>
    </div>
  )
}
