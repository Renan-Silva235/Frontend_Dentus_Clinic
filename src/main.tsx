import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'react-toastify/dist/ReactToastify.css'
import './styles/global.css'
import './styles/formularios.css'
import './styles/paginaLista.css'
import './styles/darkMode.css'
import { aplicarTokens } from './styles/colors'

import App from './App.tsx'

// Gera as custom properties (--cor-primaria, --espaco-4, etc.) a partir de
// colors.ts e injeta no <head> — precisa rodar antes do primeiro paint.
aplicarTokens()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Aplica o dark mode salvo antes do primeiro paint, evitando flash de tema claro
// (mesma técnica do auth.js original).
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark-mode')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </QueryClientProvider>
  </StrictMode>,
)
