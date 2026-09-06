import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicosService, type ServicoRequest } from '../../services/servicosService'

export function useServicos() {
  return useQuery({
    queryKey: ['servicos'],
    queryFn: servicosService.listar,
  })
}

export function useServicosPorEspecialidade(idEspecialidade: number | undefined) {
  return useQuery({
    queryKey: ['servicos', 'especialidade', idEspecialidade],
    queryFn: () => servicosService.listarPorEspecialidade(idEspecialidade as number),
    enabled: idEspecialidade !== undefined,
  })
}

export function useCadastrarServico() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ServicoRequest) => servicosService.cadastrar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servicos'] }),
  })
}

export function useRemoverServico() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => servicosService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servicos'] }),
  })
}
