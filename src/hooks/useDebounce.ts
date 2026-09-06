import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, atrasoMs: number): T {
  const [valorDebounced, setValorDebounced] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDebounced(valor), atrasoMs)
    return () => clearTimeout(temporizador)
  }, [valor, atrasoMs])

  return valorDebounced
}
