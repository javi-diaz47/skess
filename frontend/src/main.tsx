import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ProtectedRoutes } from './ProtectedRoutes.tsx'
import { SessionProvider } from './context/SessionContext.tsx'
import { Login } from './Login.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<h1>Home</h1>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
)
