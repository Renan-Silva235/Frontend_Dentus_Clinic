import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dentistasService, type DentistaRequest, type DentistaUpdateRequest } from '../../services/dentistasService'

export function useDentistas() {
  return useQuery({
    queryKey: ['dentistas'],
    queryFn: dentistasService.listar,
  })
}

export function useCadastrarDentista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: DentistaRequest) => dentistasService.cadastrar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dentistas'] }),
  })
}

export function useEditarDentista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: DentistaUpdateRequest }) =>
      dentistasService.editar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dentistas'] }),
  })
}

export function useRemoverDentista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => dentistasService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dentistas'] }),
  })
}
