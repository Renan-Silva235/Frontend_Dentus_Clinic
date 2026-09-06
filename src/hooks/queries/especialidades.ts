import { useQuery } from '@tanstack/react-query'
import { especialidadesService } from '../../services/especialidadesService'

export function useEspecialidades() {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: especialidadesService.listar,
  })
}
