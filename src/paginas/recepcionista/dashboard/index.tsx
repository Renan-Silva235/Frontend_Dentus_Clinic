import { useNavigate } from 'react-router-dom'
import { useConsultasHoje, useAtualizarStatusConsulta } from '../../../hooks/queries/consultas'
import type { StatusConsulta } from '../../../types/dominio'
import './Dashboard.css'

type StatusUi = 'agendada' | 'em-fila' | 'em-consulta' | 'consulta-encerrada' | 'cancelada'

const STATUS_DB_PARA_UI: Record<string, StatusUi> = {
  Agendada: 'agendada',
  Aguardando: 'em-fila',
  'Em Consulta': 'em-consulta',
  Encerrada: 'consulta-encerrada',
  Cancelada: 'cancelada',
}

const STATUS_UI_PARA_DB: Record<string, StatusConsulta> = {
  agendada: 'Agendada',
  'em-fila': 'Aguardando',
  'em-consulta': 'Em Consulta',
  'consulta-encerrada': 'Encerrada',
}

const STATUS_ORDEM: StatusUi[] = ['agendada', 'em-fila', 'em-consulta', 'consulta-encerrada']

const STATUS_LABEL: Record<StatusUi, string> = {
  agendada: 'Agendada',
  'em-fila': 'Em Fila',
  'em-consulta': 'Em Consulta',
  'consulta-encerrada': 'Consulta Encerrada',
  cancelada: 'Cancelada',
}

const STATUS_CLASSE: Record<StatusUi, string> = {
  agendada: 'status-agendada',
  'em-fila': 'status-em-fila',
  'em-consulta': 'status-em-consulta',
  'consulta-encerrada': 'status-consulta-encerrada',
  cancelada: 'status-cancelada',
}

export default function DashboardRecepcionista() {
  const navegar = useNavigate()
  const { data: consultasApi = [], isError } = useConsultasHoje()
  const atualizarStatus = useAtualizarStatusConsulta()

  const consultas = consultasApi.map((c) => ({
    id: c.id,
    paciente: c.nomePaciente,
    hora: (c.horaConsulta || '').slice(0, 5),
    doutor: c.nomeDentista,
    servico: c.nomeServico || '—',
    retorno: c.retorno || false,
    status: STATUS_DB_PARA_UI[c.status] || 'agendada',
  }))

  function mudarStatus(id: number, statusAtual: StatusUi, direcao: 1 | -1) {
    const idx = STATUS_ORDEM.indexOf(statusAtual)
    if (idx === -1) return
    const novoIdx = Math.min(Math.max(idx + direcao, 0), STATUS_ORDEM.length - 1)
    if (novoIdx === idx) return
    const novoStatusUi = STATUS_ORDEM[novoIdx]
    atualizarStatus.mutate({ id, status: STATUS_UI_PARA_DB[novoStatusUi] })
  }

  function Controles({ id, status }: { id: number; status: StatusUi }) {
    // Consulta encerrada é registro fechado: sem setas, o status não volta atrás.
    if (status === 'cancelada' || status === 'consulta-encerrada') {
      return (
        <div className="status-cell">
          <span className={`status-badge ${STATUS_CLASSE[status]}`}>{STATUS_LABEL[status]}</span>
        </div>
      )
    }
    return (
      <div className="status-cell">
        <button className="btn-status-arrow" title="Status anterior" onClick={() => mudarStatus(id, status, -1)}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        <span className={`status-badge ${STATUS_CLASSE[status]}`}>{STATUS_LABEL[status]}</span>
        <button className="btn-status-arrow" title="Próximo status" onClick={() => mudarStatus(id, status, 1)}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="dashboard-actions">
        <button className="btn-action" onClick={() => navegar('/recepcionista/agenda')}>
          <i className="fa-solid fa-calendar-plus" />
          Agendar Consulta
        </button>
        <div className="dashboard-actions-right">
          <button className="btn-action" onClick={() => navegar('/recepcionista/pacientes')}>
            <i className="fa-solid fa-address-book" />
            Visualizar Paciente
          </button>
          <button className="btn-action" onClick={() => navegar('/recepcionista/pacientes?acao=cadastrar')}>
            <i className="fa-solid fa-user-plus" />
            Cadastrar Paciente
          </button>
        </div>
      </div>

      <h2 className="section-title">Consultas do dia</h2>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="consultas-table">
            <thead>
              <tr>
                <th>Nome do paciente</th>
                <th>Hora</th>
                <th>Doutor responsável</th>
                <th>Serviço Odontológico</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-danger">
                    Erro ao carregar consultas. Tente recarregar a página.
                  </td>
                </tr>
              ) : consultas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Nenhuma consulta agendada para hoje
                  </td>
                </tr>
              ) : (
                consultas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.paciente}
                      {c.retorno && <span className="badge-retorno">Retorno</span>}
                    </td>
                    <td>{c.hora}</td>
                    <td>{c.doutor}</td>
                    <td>{c.servico}</td>
                    <td>
                      <Controles id={c.id} status={c.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="consultas-cards">
        {consultas.length === 0 ? (
          <div className="cons-card-vazio">
            <i className="fa-solid fa-calendar-xmark" />
            <p>Nenhuma consulta agendada para hoje</p>
          </div>
        ) : (
          consultas.map((c) => (
            <div className="cons-card" key={c.id}>
              <div className="cons-card-header">
                <span className="cons-hora">{c.hora}</span>
                {c.retorno && <span className="badge-retorno">Retorno</span>}
              </div>
              <div className="cons-card-nome">{c.paciente}</div>
              <div className="cons-card-meta">
                <span>
                  <i className="fa-solid fa-user-doctor" />
                  {c.doutor}
                </span>
                <span>
                  <i className="fa-solid fa-tooth" />
                  {c.servico}
                </span>
              </div>
              <div className="cons-card-controles">
                <Controles id={c.id} status={c.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
