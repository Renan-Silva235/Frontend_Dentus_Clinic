import { httpClient } from './httpClient'
import type { Prontuario } from '../types/dominio'

export const prontuariosService = {
  listar: () => httpClient.get<Prontuario[]>('/prontuarios'),
  buscarPorId: (id: number) => httpClient.get<Prontuario>(`/prontuarios/${id}`),
  buscarPorPaciente: (idPaciente: number) =>
    httpClient.get<Prontuario>(`/prontuarios/paciente/${idPaciente}`),
  // "obter ou criar" — sempre 200, mesmo criando (ver 01-analise-backend.md §5.9).
  obterOuCriar: (idPaciente: number) => httpClient.post<Prontuario>('/prontuarios', { idPaciente }),
}
