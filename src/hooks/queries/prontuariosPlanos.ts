import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prontuariosService } from '../../services/prontuariosService'
import { planosService, type PlanoRequest } from '../../services/planosService'
import type { Plano, Prontuario } from '../../types/dominio'

/** Espelha buscarProntuarioEPlanos do tratamentos.js original: nunca lança —
 * ausência de prontuário é um estado válido (paciente ainda sem registros). */
export function useProntuarioEPlanos(idPaciente: number | undefined) {
  return useQuery({
    queryKey: ['prontuario-planos', idPaciente],
    queryFn: async (): Promise<{ prontuario: Prontuario | null; planos: Plano[] }> => {
      let prontuario: Prontuario | null = null
      try {
        prontuario = await prontuariosService.buscarPorPaciente(idPaciente as number)
      } catch {
        return { prontuario: null, planos: [] }
      }

      let planos: Plano[] = []
      if (prontuario?.id) {
        try {
          planos = await planosService.listarPorProntuario(prontuario.id)
        } catch {
          planos = []
        }
      }
      return { prontuario, planos }
    },
    enabled: idPaciente !== undefined,
  })
}

export function useObterOuCriarProntuario() {
  return useMutation({
    mutationFn: (idPaciente: number) => prontuariosService.obterOuCriar(idPaciente),
  })
}

export function useCadastrarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: PlanoRequest) => planosService.cadastrar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prontuario-planos'] }),
  })
}

export function useEditarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: PlanoRequest }) => planosService.editar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prontuario-planos'] }),
  })
}
