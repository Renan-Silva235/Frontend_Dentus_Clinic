export type TipoAcesso = 'DENTISTA' | 'SECRETARIA' | 'ADMINISTRADOR'

export type Cargo = 'SECRETARIA' | 'ADMINISTRADOR'

/**
 * Status de Consulta é string livre no backend (sem enum/CHECK) — ver
 * docs/migracao-react/01-analise-backend.md §3 e §8.2. União documentando os
 * valores observados, mas o backend não impede outros valores.
 */
export type StatusConsulta =
  | 'Agendada'
  | 'Aguardando'
  | 'Em Consulta'
  | 'Encerrada'
  | 'Cancelada'
  | 'Inativa'

export interface Paciente {
  id: number
  nome: string
  cpf: string
  telefone?: string
  email: string
  dataNascimento: string
  endereco?: string
  ativo: boolean
  /** Só vem preenchida na resposta do cadastro. */
  senhaTemporaria?: string
}

export interface Dentista {
  id: number
  nome: string
  cpf: string
  cro: string
  telefone?: string
  idEspecialidade: number
  nomeEspecialidade: string
  email: string
}

export interface Funcionario {
  id: number
  nome: string
  cpf: string
  dataNascimento: string
  telefone?: string
  cargo: Cargo
  email: string
}

export interface Especialidade {
  id: number
  nome: string
}

export interface Servico {
  id: number
  nome: string
  idEspecialidade?: number
}

/** Resposta do paciente ao aviso enviado 24h antes da consulta. */
export type StatusConfirmacao = 'Pendente' | 'Confirmada' | 'Recusada'

export interface Consulta {
  id: number
  dataConsulta: string
  horaConsulta: string
  retorno: boolean
  status: StatusConsulta
  statusConfirmacao: StatusConfirmacao
  idDentista: number
  idPaciente: number
  idServico?: number
  nomeDentista: string
  nomePaciente: string
  nomeServico: string
}

export interface Atendimento {
  id: number
  idConsulta: number
  descricao?: string
  procedimentoRealizado?: string
  dataAtendimento: string
  observacao?: string
}

export interface Prontuario {
  id: number
  idPaciente: number
  nomePaciente: string
  dataAbertura: string
  dataUltimaAtualizacao?: string
}

export interface Plano {
  id: number
  idProntuario: number
  idServico?: number
  nomeServico?: string
  descricao?: string
  condicao?: string
  status: string
  observacao?: string
  dente?: string
  dataCriacao: string
  dataAtualizacao?: string
}
