import { httpClient } from './httpClient'
import type { Plano } from '../types/dominio'

export interface PlanoRequest {
  idProntuario: number
  idServico?: number
  descricao?: string
  condicao?: string
  status: string
  observacao?: string
  dente?: string
}

export const planosService = {
  listar: () => httpClient.get<Plano[]>('/planos'),
  listarPorProntuario: (idProntuario: number) =>
    httpClient.get<Plano[]>(`/planos/prontuario/${idProntuario}`),
  buscarPorId: (id: number) => httpClient.get<Plano>(`/planos/${id}`),
  cadastrar: (dados: PlanoRequest) => httpClient.post<Plano>('/planos', dados),
  // O PUT exige o DTO completo (não é PATCH parcial) — ver 01-analise-backend.md §5.10.
  editar: (id: number, dados: PlanoRequest) => httpClient.put<Plano>(`/planos/${id}`, dados),
}
