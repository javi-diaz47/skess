import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ProtectedRoutes } from './ProtectedRoutes.tsx'
import { SessionContext, SessionProvider } from './context/SessionContext.tsx'
import { Login } from './Login.tsx'
import { Home } from './Home.tsx'
import { WebsocketProvider } from './context/Websockets.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <WebsocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Home />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </WebsocketProvider>
    </SessionProvider>
  </StrictMode>,
)
