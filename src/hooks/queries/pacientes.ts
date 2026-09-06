import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  pacientesService,
  type PacienteEditarRequest,
  type PacienteRequest,
} from '../../services/pacientesService'

export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: pacientesService.listar,
  })
}

export function useCadastrarPaciente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: PacienteRequest) => pacientesService.cadastrar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}

export function useEditarPaciente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: PacienteEditarRequest }) =>
      pacientesService.editar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}

export function useInativarPaciente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pacientesService.inativar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}
