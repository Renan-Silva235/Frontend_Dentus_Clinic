import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  funcionariosService,
  type FuncionarioEditarRequest,
  type FuncionarioRequest,
} from '../../services/funcionariosService'

export function useFuncionarios() {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: funcionariosService.listar,
  })
}

export function useCadastrarFuncionario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: FuncionarioRequest) => funcionariosService.cadastrar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}

export function useEditarFuncionario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: FuncionarioEditarRequest }) =>
      funcionariosService.editar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}

export function useRemoverFuncionario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => funcionariosService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}
