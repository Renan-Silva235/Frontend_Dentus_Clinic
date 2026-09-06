import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface TemaContextValor {
  modoEscuro: boolean
  alternarModoEscuro: (valor?: boolean) => void
}

const TemaContext = createContext<TemaContextValor | undefined>(undefined)

export function TemaProvider({ children }: { children: ReactNode }) {
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('darkMode') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', modoEscuro)
    localStorage.setItem('darkMode', String(modoEscuro))
  }, [modoEscuro])

  function alternarModoEscuro(valor?: boolean) {
    setModoEscuro((atual) => valor ?? !atual)
  }

  return (
    <TemaContext.Provider value={{ modoEscuro, alternarModoEscuro }}>
      {children}
    </TemaContext.Provider>
  )
}

export function useTema() {
  const contexto = useContext(TemaContext)
  if (!contexto) throw new Error('useTema deve ser usado dentro de TemaProvider')
  return contexto
}
