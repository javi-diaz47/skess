import { useContext, useEffect, useRef, useState, type SubmitEvent } from "react";
import { SessionContext } from "../context/SessionContext";
import { CHAT_COLORS } from "../contants/chatColors";
import { useChat } from "../hooks/useChat";




export function Chat() {

  const { session } = useContext(SessionContext)
  const { messages } = useChat()

  return (

    <div className="h-full min-h-0 flex">
      <div className="w-full bg-background-100 dark:bg-background-900 overflow-y-scroll p-2 rounded-2xl">

        <div className="flex items-center gap-2">
          <svg className="w-5 aspect-square text-text-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
          </svg>
          <h2 className="md:text-2xl font-bold text-text-400 dark:text-text-200">Chat</h2>
        </div>

        <ul className="text-sm md:text-base">
          {
            messages && messages.map(item => (
              item.payload.correct ? (
                <li key={item.event_id} className="bg-green-100 dark:bg-green-900 rounded-xl p-1">
                  <p className="break-all">
                    <span className={`mr-2 font-bold ${CHAT_COLORS[item.user.color]}`}>
                      {item.user.name}:
                    </span>
                    guessed correctly
                  </p>
                </li>
              ) : (
                <li key={item.event_id} className="">
                  <p className="break-all">
                    <span className={`mr-2 font-bold ${CHAT_COLORS[item.user.color]}`}>
                      {item.user.name}{item.user.id === session.id ? <span className="text-[10px] md:text-xs"> (you)</span> : ""}:
                    </span>
                    {item.payload.message}
                  </p>
                </li>
              )
            ))
          }
        </ul>
      </div>

    </div>
  )
}
