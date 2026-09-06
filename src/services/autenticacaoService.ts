import { httpClient } from './httpClient'
import type { TipoAcesso } from '../types/dominio'

export interface LoginResposta {
  id: number
  token: string
  tipoAcesso: TipoAcesso
  nome: string
  expiracao: string
}

export const autenticacaoService = {
  login: (email: string, senha: string) =>
    httpClient.post<LoginResposta>('/auth/login', { email, senha }),
}
