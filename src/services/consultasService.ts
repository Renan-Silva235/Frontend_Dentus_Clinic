import { httpClient } from './httpClient'
import type { Consulta, StatusConsulta } from '../types/dominio'

export interface ConsultaRequest {
  dataConsulta: string
  horaConsulta: string
  retorno?: boolean
  idDentista: number
  idPaciente: number
  idServico?: number
}

export type ConsultaUpdateRequest = Partial<ConsultaRequest>

export const consultasService = {
  listar: () => httpClient.get<Consulta[]>('/consultas'),
  listarHoje: () => httpClient.get<Consulta[]>('/consultas/hoje'),
  buscarPorId: (id: number) => httpClient.get<Consulta>(`/consultas/${id}`),
  agenda: (dentistaId: number, data: string) =>
    httpClient.get<Consulta[]>(`/consultas/agenda?dentistaId=${dentistaId}&data=${data}`),
  agendar: (dados: ConsultaRequest) => httpClient.post<Consulta>('/consultas/agendar', dados),
  editar: (id: number, dados: ConsultaUpdateRequest) =>
    httpClient.patch<Consulta>(`/consultas/${id}`, dados),
  atualizarStatus: (id: number, status: StatusConsulta) =>
    httpClient.put<Consulta>(`/consultas/${id}/status`, { status }),
  registrarChegada: (id: number) => httpClient.put<Consulta>(`/consultas/${id}/chegada`),
  // Mesma ação que o paciente faz pelo aplicativo, disponível ao funcionário
  // para quando a resposta chega por telefone ou na recepção.
  confirmarPresenca: (id: number) => httpClient.post<void>(`/consultas/${id}/confirmar`),
  recusarPresenca: (id: number) => httpClient.post<void>(`/consultas/${id}/recusar`),
  cancelar: (id: number) => httpClient.put<Consulta>(`/consultas/${id}/cancelar`),
  inativar: (id: number) => httpClient.put<Consulta>(`/consultas/${id}/inativar`),
}
