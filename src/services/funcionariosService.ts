import { httpClient } from './httpClient'
import type { Cargo, Funcionario } from '../types/dominio'

export interface FuncionarioRequest {
  nome: string
  cpf: string
  dataNascimento: string
  telefone?: string
  cargo: Cargo
  email: string
  senha: string
}

export interface FuncionarioEditarRequest {
  nome?: string
  dataNascimento?: string
  telefone?: string
  cargo?: Cargo
  email?: string
  senha?: string
}

export const funcionariosService = {
  listar: () => httpClient.get<Funcionario[]>('/funcionarios'),
  buscarPorId: (id: number) => httpClient.get<Funcionario>(`/funcionarios/${id}`),
  cadastrar: (dados: FuncionarioRequest) => httpClient.post<Funcionario>('/funcionarios', dados),
  editar: (id: number, dados: FuncionarioEditarRequest) =>
    httpClient.patch<Funcionario>(`/funcionarios/${id}`, dados),
  remover: (id: number) => httpClient.delete<void>(`/funcionarios/${id}`),
}
