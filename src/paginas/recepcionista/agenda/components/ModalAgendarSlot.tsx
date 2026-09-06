import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { AutocompletePaciente } from '../../../../componentes/AutocompletePaciente/AutocompletePaciente'
import { useAgendarConsulta } from '../../../../hooks/queries/consultas'
import { useServicosPorEspecialidade } from '../../../../hooks/queries/servicos'
import { formatarDataAgenda } from '../../../../utils/datasAgenda'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import type { Paciente, Servico } from '../../../../types/dominio'
import type { Dentista } from '../../../../types/dominio'

export interface SlotSelecionado {
  dentistaId: number
  data: string
  hora: string
}

interface Props {
  slot: SlotSelecionado | null
  dentistas: Dentista[]
  pacientes: Paciente[]
  servicosGerais: Servico[]
  onFechar: () => void
}

export function ModalAgendarSlot({ slot, dentistas, pacientes, servicosGerais, onFechar }: Props) {
  const [pacienteId, setPacienteId] = useState<number | null>(null)
  const [servicoId, setServicoId] = useState('')
  const [retorno, setRetorno] = useState(false)
  const agendar = useAgendarConsulta()

  const dentista = dentistas.find((d) => d.id === slot?.dentistaId)
  const { data: servicosPorEspecialidade } = useServicosPorEspecialidade(dentista?.idEspecialidade)
  const servicos = dentista?.idEspecialidade && servicosPorEspecialidade ? servicosPorEspecialidade : servicosGerais

  useEffect(() => {
    if (slot) {
      setPacienteId(null)
      setServicoId('')
      setRetorno(false)
    }
  }, [slot])

  function fechar() {
    onFechar()
  }

  async function confirmar() {
    if (!slot) return

    if (!pacienteId) {
      dispararErros('Selecione um paciente na lista.')
      return
    }

    const agora = new Date()
    const hoje = agora.toISOString().slice(0, 10)
    const horaAtual = agora.toTimeString().slice(0, 5)

    if (slot.data < hoje) {
      dispararErros('Não é possível agendar em uma data passada.')
      return
    }
    if (slot.data === hoje && slot.hora < horaAtual) {
      dispararErros('Não é possível agendar em um horário que já passou.')
      return
    }

    try {
      await agendar.mutateAsync({
        idPaciente: pacienteId,
        idDentista: slot.dentistaId,
        dataConsulta: slot.data,
        horaConsulta: `${slot.hora}:00`,
        idServico: servicoId ? Number(servicoId) : undefined,
        retorno,
      })
      dispararSucesso('Consulta agendada com sucesso.')
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  return (
    <Modal show={slot !== null} onHide={fechar} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          <i className="fa-solid fa-calendar-plus me-2" />
          Agendar Consulta
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-2">
        <div className="slot-info-modal mb-3">
          <div className="slot-info-item">
            <i className="fa-solid fa-user-doctor" />
            <span>{dentista?.nome || '—'}</span>
          </div>
          <div className="slot-info-item">
            <i className="fa-solid fa-calendar" />
            <span>{slot ? formatarDataAgenda(slot.data) : '—'}</span>
          </div>
          <div className="slot-info-item">
            <i className="fa-solid fa-clock" />
            <span>{slot?.hora}</span>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Paciente <span className="text-danger">*</span>
          </label>
          <AutocompletePaciente
            pacientes={pacientes}
            placeholder="Digite o nome do paciente..."
            onSelecionar={(p) => setPacienteId(p.id)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Serviço</label>
          <select className="form-select" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
            <option value="">Nenhum</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="slotRetorno"
              checked={retorno}
              onChange={(e) => setRetorno(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="slotRetorno">
              É uma consulta de retorno?
            </label>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 gap-2">
        <button type="button" className="btn px-4 text-dark bg-white border" onClick={fechar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn px-4 text-white"
          style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
          onClick={confirmar}
          disabled={agendar.isPending}
        >
          {agendar.isPending ? 'Agendando…' : 'Agendar'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
