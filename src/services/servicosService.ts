import { httpClient } from './httpClient'
import type { Servico } from '../types/dominio'

export interface ServicoRequest {
  nome: string
  idEspecialidade: number
}

export const servicosService = {
  listar: () => httpClient.get<Servico[]>('/servicos'),
  listarPorEspecialidade: (idEspecialidade: number) =>
    httpClient.get<Servico[]>(`/servicos/especialidade/${idEspecialidade}`),
  cadastrar: (dados: ServicoRequest) => httpClient.post<Servico>('/servicos', dados),
  remover: (id: number) => httpClient.delete<void>(`/servicos/${id}`),
}
