import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ProtectedRoutes } from './ProtectedRoutes.tsx'
import { SessionProvider } from './context/SessionContext.tsx'
import { Login } from './Login.tsx'
import { Home } from './Home.tsx'
import { WebSocketProvider } from './context/WebsSocketsContext.tsx'
import './index.css'
import { GameStatusProvider } from './context/GameStatusContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <WebSocketProvider>
        <GameStatusProvider>

          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Home />} />
              </Route>

            </Routes>
          </BrowserRouter>

        </GameStatusProvider>
      </WebSocketProvider>
    </SessionProvider>
  </StrictMode>,
)
