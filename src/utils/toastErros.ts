import { toast } from 'react-toastify'
import { ErroHttp } from '../services/httpClient'

/** Dispara um toast.error por mensagem — usado tanto para erros de validação
 * client-side (Etapa 9) quanto para erros vindos da API. */
export function dispararErros(mensagens: string[] | string) {
  const lista = Array.isArray(mensagens) ? mensagens : mensagens.split('\n')
  lista.filter(Boolean).forEach((mensagem) => toast.error(mensagem))
}

export function dispararErroApi(erro: unknown) {
  if (erro instanceof ErroHttp) {
    dispararErros(erro.message)
    return
  }
  dispararErros('Ocorreu um erro. Tente novamente.')
}

/** Dispara um toast.success — usado para confirmar cadastros, edições e
 * exclusões bem-sucedidas em toda a aplicação. */
export function dispararSucesso(mensagem: string) {
  toast.success(mensagem)
}
