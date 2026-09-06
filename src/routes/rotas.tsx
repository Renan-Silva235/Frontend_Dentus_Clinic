import type { PerfilRota } from '../contexts/AutenticacaoContext'

import FuncionariosAdmin from '../paginas/admin/funcionarios'
import PacientesAdmin from '../paginas/admin/pacientes'
import ServicosAdmin from '../paginas/admin/servicos'

import DashboardDentista from '../paginas/dentista/dashboard'
import AgendaDentista from '../paginas/dentista/agenda'
import PacientesDentista from '../paginas/dentista/pacientes'
import TratamentosDentista from '../paginas/dentista/tratamentos'

import DashboardRecepcionista from '../paginas/recepcionista/dashboard'
import AgendaRecepcionista from '../paginas/recepcionista/agenda'
import FuncionariosRecepcionista from '../paginas/recepcionista/funcionarios'
import PacientesRecepcionista from '../paginas/recepcionista/pacientes'

/** Rota padrão pós-login por perfil (ver auth.js:redirecionarPorPerfil original). */
export const rotaPadraoPorPerfil: Record<PerfilRota, string> = {
  admin: '/admin/funcionarios',
  dentista: '/dentista/dashboard',
  recepcionista: '/recepcionista/dashboard',
}

export const rotasAdmin = [
  { path: 'funcionarios', Componente: FuncionariosAdmin },
  { path: 'pacientes', Componente: PacientesAdmin },
  { path: 'servicos', Componente: ServicosAdmin },
]

export const rotasDentista = [
  { path: 'dashboard', Componente: DashboardDentista },
  { path: 'agenda', Componente: AgendaDentista },
  { path: 'pacientes', Componente: PacientesDentista },
  { path: 'tratamentos', Componente: TratamentosDentista },
]

export const rotasRecepcionista = [
  { path: 'dashboard', Componente: DashboardRecepcionista },
  { path: 'agenda', Componente: AgendaRecepcionista },
  { path: 'funcionarios', Componente: FuncionariosRecepcionista },
  { path: 'pacientes', Componente: PacientesRecepcionista },
]
