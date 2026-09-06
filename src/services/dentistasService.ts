import { httpClient } from './httpClient'
import type { Dentista } from '../types/dominio'

export interface DentistaRequest {
  nome: string
  cpf: string
  cro: string
  telefone?: string
  idEspecialidade: number
  email: string
  senha: string
}

export interface DentistaUpdateRequest {
  nome?: string
  telefone?: string
  idEspecialidade?: number
  email?: string
  senha?: string
}

export const dentistasService = {
  listar: () => httpClient.get<Dentista[]>('/dentistas'),
  buscarPorId: (id: number) => httpClient.get<Dentista>(`/dentistas/${id}`),
  cadastrar: (dados: DentistaRequest) => httpClient.post<Dentista>('/dentistas', dados),
  editar: (id: number, dados: DentistaUpdateRequest) =>
    httpClient.patch<Dentista>(`/dentistas/${id}`, dados),
  remover: (id: number) => httpClient.delete<void>(`/dentistas/${id}`),
}
