import { httpClient } from './httpClient'
import type { Especialidade } from '../types/dominio'

export const especialidadesService = {
  listar: () => httpClient.get<Especialidade[]>('/especialidades'),
}
