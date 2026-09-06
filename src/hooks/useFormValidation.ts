import { useState } from 'react'

export type RegrasValidacao<T> = {
  [K in keyof T]?: (valor: T[K], valores: T) => string | undefined
}

/**
 * Hook de validação de formulário (Etapa 9): valida todos os campos de uma
 * vez, retorna todos os erros encontrados, limpa somente os campos
 * inválidos e mantém os válidos preenchidos.
 */
export function useFormValidation<T extends object>(
  valoresIniciais: T,
  regras: RegrasValidacao<T>,
) {
  const [valores, setValores] = useState<T>(valoresIniciais)
  const [erros, setErros] = useState<Partial<Record<keyof T, string>>>({})

  function definirValor<K extends keyof T>(campo: K, valor: T[K]) {
    setValores((atual) => ({ ...atual, [campo]: valor }))
  }

  function validar(): { valido: boolean; mensagens: string[] } {
    const novosErros: Partial<Record<keyof T, string>> = {}

    for (const campo in regras) {
      const validador = regras[campo]
      if (!validador) continue
      const mensagem = validador(valores[campo], valores)
      if (mensagem) novosErros[campo] = mensagem
    }

    setErros(novosErros)

    const camposInvalidos = Object.keys(novosErros) as Array<keyof T>
    if (camposInvalidos.length > 0) {
      setValores((atual) => {
        const atualizado = { ...atual }
        for (const campo of camposInvalidos) {
          atualizado[campo] = valoresIniciais[campo]
        }
        return atualizado
      })
      return { valido: false, mensagens: camposInvalidos.map((c) => novosErros[c] as string) }
    }

    return { valido: true, mensagens: [] }
  }

  function resetar() {
    setValores(valoresIniciais)
    setErros({})
  }

  return { valores, erros, definirValor, validar, resetar, setValores }
}
