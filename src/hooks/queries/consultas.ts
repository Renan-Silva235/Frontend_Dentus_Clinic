import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  consultasService,
  type ConsultaRequest,
  type ConsultaUpdateRequest,
} from '../../services/consultasService'
import type { StatusConsulta } from '../../types/dominio'

export function useConsultas() {
  return useQuery({
    queryKey: ['consultas'],
    queryFn: consultasService.listar,
  })
}

export function useConsultasHoje() {
  return useQuery({
    queryKey: ['consultas', 'hoje'],
    queryFn: consultasService.listarHoje,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  })
}

export function useAgendaDentista(dentistaId: number | undefined, data: string) {
  return useQuery({
    queryKey: ['consultas', 'agenda', dentistaId, data],
    queryFn: () => consultasService.agenda(dentistaId as number, data),
    enabled: dentistaId !== undefined,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  })
}

export function useAgendarConsulta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ConsultaRequest) => consultasService.agendar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}

export function useEditarConsulta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: ConsultaUpdateRequest }) =>
      consultasService.editar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}

export function useAtualizarStatusConsulta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusConsulta }) =>
      consultasService.atualizarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}

export function useConfirmarPresenca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => consultasService.confirmarPresenca(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}

export function useRecusarPresenca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => consultasService.recusarPresenca(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}

export function useCancelarConsulta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => consultasService.cancelar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consultas'] }),
  })
}
