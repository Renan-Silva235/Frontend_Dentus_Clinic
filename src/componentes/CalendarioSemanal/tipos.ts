import { cores } from '../../styles/colors'
import type { StatusConfirmacao, StatusConsulta } from '../../types/dominio'

export interface EventoAgenda {
  id: number
  nomePaciente: string
  nomeServico: string
  status: StatusConsulta
  statusConfirmacao: StatusConfirmacao
  idPaciente: number
  idDentista: number
  nomeDentista: string
  idServico?: number
  retorno: boolean
  data: string
  hora: string
}

/** Grade [dia 0-6][slot 0-26] — null = livre. */
export type GradeSemana = (EventoAgenda | null)[][]

export const STATUS_CORES: Record<string, { bg: string; texto: string }> = {
  Agendada: { bg: cores.statusConsulta.agendada.solido, texto: '#fff' },
  Aguardando: { bg: cores.statusConsulta.aguardando.solido, texto: '#fff' },
  'Em Consulta': { bg: cores.statusConsulta.emConsulta.solido, texto: '#fff' },
  Encerrada: { bg: cores.statusConsulta.encerrada.solido, texto: '#fff' },
  Cancelada: { bg: cores.statusConsulta.cancelada.solido, texto: '#fff' },
}
