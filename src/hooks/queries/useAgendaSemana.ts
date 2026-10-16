import { useQueries } from '@tanstack/react-query'
import { consultasService } from '../../services/consultasService'
import { toISODate } from '../../utils/datasAgenda'
import { HOUR_COUNT, HOUR_START, SLOT_MIN, slotToTime } from '../../utils/datasAgenda'
import type { EventoAgenda, GradeSemana } from '../../componentes/CalendarioSemanal/tipos'

/** Busca a agenda semanal de um dentista (7 chamadas em paralelo, uma por dia,
 * espelhando o comportamento original) e monta a grade [dia][slot]. */
export function useAgendaSemana(dentistaId: number | undefined, monday: Date) {
  const datas = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toISODate(d)
  })

  const resultados = useQueries({
    queries: datas.map((data) => ({
      queryKey: ['consultas', 'agenda', dentistaId, data],
      queryFn: () => consultasService.agenda(dentistaId as number, data),
      enabled: dentistaId !== undefined,
      // A confirmação do paciente chega pelo aplicativo, sem passar por esta
      // tela: sem recarregar sozinha, a recepção só veria ao atualizar a página.
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    })),
  })

  const carregando = resultados.some((r) => r.isLoading)

  const grade: GradeSemana = Array.from({ length: 7 }, () => Array.from({ length: HOUR_COUNT }, () => null))

  resultados.forEach((res, dayIdx) => {
    const consultas = res.data ?? []
    consultas.forEach((c) => {
      const [hh, mm] = (c.horaConsulta || '00:00:00').split(':').map(Number)
      const h = Math.round(((hh - HOUR_START) * 60 + mm) / SLOT_MIN)
      if (h >= 0 && h < HOUR_COUNT && !grade[dayIdx][h]) {
        const evento: EventoAgenda = {
          id: c.id,
          nomePaciente: c.nomePaciente,
          nomeServico: c.nomeServico || '—',
          status: c.status,
          statusConfirmacao: c.statusConfirmacao ?? 'Pendente',
          idPaciente: c.idPaciente,
          idDentista: c.idDentista,
          nomeDentista: c.nomeDentista,
          idServico: c.idServico,
          retorno: c.retorno || false,
          data: datas[dayIdx],
          hora: slotToTime(h),
        }
        grade[dayIdx][h] = evento
      }
    })
  })

  return { grade, carregando }
}
