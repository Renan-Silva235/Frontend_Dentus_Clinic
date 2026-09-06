import { httpClient } from './httpClient'
import type { Paciente } from '../types/dominio'

export interface PacienteRequest {
  nome: string
  cpf: string
  telefone?: string
  email: string
  dataNascimento: string
  endereco?: string
}

export interface PacienteEditarRequest {
  nome?: string
  telefone?: string
  email?: string
  dataNascimento?: string
  endereco?: string
}

export const pacientesService = {
  listar: () => httpClient.get<Paciente[]>('/pacientes'),
  buscarPorId: (id: number) => httpClient.get<Paciente>(`/pacientes/${id}`),
  cadastrar: (dados: PacienteRequest) => httpClient.post<Paciente>('/pacientes/cadastrar', dados),
  editar: (id: number, dados: PacienteEditarRequest) =>
    httpClient.patch<Paciente>(`/pacientes/${id}`, dados),
  inativar: (id: number) => httpClient.delete<void>(`/pacientes/${id}`),
}
