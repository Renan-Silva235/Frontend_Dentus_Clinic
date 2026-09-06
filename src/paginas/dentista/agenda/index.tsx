import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { CalendarioSemanal } from '../../../componentes/CalendarioSemanal/CalendarioSemanal'
import type { EventoAgenda } from '../../../componentes/CalendarioSemanal/tipos'
import { useAgendaSemana } from '../../../hooks/queries/useAgendaSemana'
import { useAutenticacao } from '../../../contexts/AutenticacaoContext'
import { DAY_FULL, getMonday } from '../../../utils/datasAgenda'

const STATUS_LABEL: Record<string, string> = {
  Agendada: 'Agendada',
  Aguardando: 'Em Fila',
  'Em Consulta': 'Em Consulta',
  Encerrada: 'Encerrada',
  Cancelada: 'Cancelada',
}

export default function AgendaDentista() {
  const { usuario } = useAutenticacao()
  const [weekOffset, setWeekOffset] = useState(0)
  const monday = getMonday(weekOffset)
  const { grade } = useAgendaSemana(usuario?.id, monday)
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoAgenda | null>(null)

  function navegarSemana(direcao: -1 | 0 | 1) {
    setWeekOffset((atual) => (direcao === 0 ? 0 : atual + direcao))
  }

  const [hh, mm] = eventoSelecionado ? eventoSelecionado.hora.split(':') : ['', '']
  const dataEvento = eventoSelecionado ? new Date(`${eventoSelecionado.data}T00:00:00`) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CalendarioSemanal
        monday={monday}
        grade={grade}
        somenteLeitura
        onNavegarSemana={navegarSemana}
        onEventoClick={setEventoSelecionado}
      />

      <Modal show={eventoSelecionado !== null} onHide={() => setEventoSelecionado(null)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <p className="modal-title text-muted mb-0">
            {dataEvento ? DAY_FULL[dataEvento.getDay()] : ''} &nbsp;|&nbsp; {hh}:{mm}
          </p>
        </Modal.Header>
        <Modal.Body className="pt-3 px-5 pb-4">
          <div className="row mb-4">
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Paciente</small>
              <span className="fs-4 fw-medium text-dark">{eventoSelecionado?.nomePaciente}</span>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Serviço</small>
              <span className="fs-4 fw-medium text-dark">{eventoSelecionado?.nomeServico}</span>
            </div>
          </div>
          <div className="mb-5">
            <h6 className="fw-medium text-dark mb-3">Status</h6>
            <p className="text-muted small mb-0">
              {eventoSelecionado ? STATUS_LABEL[eventoSelecionado.status] || eventoSelecionado.status : '—'}
            </p>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm"
              onClick={() => setEventoSelecionado(null)}
            >
              <i className="fa-solid fa-arrow-left me-2" /> Voltar
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
