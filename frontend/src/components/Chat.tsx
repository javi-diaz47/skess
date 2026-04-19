import { useContext } from "react";
import type { GuessSocketEvent } from "../context/Websockets";
import { SessionContext } from "../context/SessionContext";
import { COLORS } from "../contants/colors";

export function Chat({ messages }: { messages: GuessSocketEvent[] }) {
  const { session } = useContext(SessionContext)
  return (
    <ul className="h-72 w-72 bg-background-100 dark:bg-background-900 overflow-y-scroll p-2">
      {
        messages && messages.map(item => (
          <li key={item.event_id}>
            <p className="break-all">
              <span className={`mr-2 font-bold ${COLORS[item.user.color]}`}>
                {item.user.id === session.id ? 'You' : item.user.name}:
              </span>
              {item.payload.message}
            </p>
          </li>
        ))
      }
    </ul>

  )
}
