import { createContext } from 'react'
import type { WebSocketContextValue } from './types'

const DEFAULT_WEBSOCKET_CONTEXT: WebSocketContextValue = {
  subscribe: () => () => {},
  send: () => {},
}

export const WebSocketContext = createContext<WebSocketContextValue>(
  DEFAULT_WEBSOCKET_CONTEXT,
)
