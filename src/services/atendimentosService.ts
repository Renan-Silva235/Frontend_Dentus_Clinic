import { httpClient } from './httpClient'
import type { Atendimento } from '../types/dominio'

export interface AtendimentoRequest {
  idConsulta: number
  descricao?: string
  procedimentoRealizado?: string
  dataAtendimento: string
  observacao?: string
}

export const atendimentosService = {
  listar: () => httpClient.get<Atendimento[]>('/atendimentos'),
  buscarPorId: (id: number) => httpClient.get<Atendimento>(`/atendimentos/${id}`),
  registrar: (dados: AtendimentoRequest) => httpClient.post<Atendimento>('/atendimentos', dados),
  // O PUT exige o DTO completo (não é PATCH parcial) — ver 01-analise-backend.md §5.8.
  editar: (id: number, dados: AtendimentoRequest) =>
    httpClient.put<Atendimento>(`/atendimentos/${id}`, dados),
  remover: (id: number) => httpClient.delete<void>(`/atendimentos/${id}`),
}
