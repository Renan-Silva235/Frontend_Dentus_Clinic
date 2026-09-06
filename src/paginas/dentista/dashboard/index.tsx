import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConsultasHoje } from '../../../hooks/queries/consultas'
import { usePacientes } from '../../../hooks/queries/pacientes'
import { useAutenticacao } from '../../../contexts/AutenticacaoContext'
import { mascararCpf, mascararTelefone } from '../../../utils/formatadores'
import { cores } from '../../../styles/colors'
import type { Consulta, StatusConsulta } from '../../../types/dominio'
import './Dashboard.css'

const STATUS_ATIVOS: StatusConsulta[] = ['Agendada', 'Aguardando', 'Em Consulta']

function calcularTempoAguardando(horaConsulta: string): string {
  if (!horaConsulta) return '—'
  const [h, m] = horaConsulta.split(':').map(Number)
  const agora = new Date()
  const agendado = new Date(agora)
  agendado.setHours(h, m, 0, 0)
  const diffMin = Math.floor((agora.getTime() - agendado.getTime()) / 60000)
  if (diffMin < 0) return horaConsulta.slice(0, 5)
  return `${diffMin} min`
}

function infoColuna(c: Consulta): string {
  if (c.status === 'Aguardando') return calcularTempoAguardando(c.horaConsulta)
  if (c.status === 'Em Consulta') return 'Em Consulta'
  return (c.horaConsulta || '').slice(0, 5)
}

export default function DashboardDentista() {
  const { usuario } = useAutenticacao()
  const navegar = useNavigate()
  const { data: consultasHoje = [] } = useConsultasHoje()
  const { data: pacientes = [] } = usePacientes()

  const [consultaSelecionadaId, setConsultaSelecionadaId] = useState<number | null>(null)

  const pacientesMap = useMemo(() => Object.fromEntries(pacientes.map((p) => [p.id, p])), [pacientes])

  const minhasHoje = useMemo(
    () => consultasHoje.filter((c) => c.idDentista === usuario?.id),
    [consultasHoje, usuario],
  )

  const fila = useMemo(
    () =>
      minhasHoje
        .filter((c) => STATUS_ATIVOS.includes(c.status))
        .sort((a, b) => (a.horaConsulta || '').localeCompare(b.horaConsulta || '')),
    [minhasHoje],
  )

  const emEspera = minhasHoje.filter((c) => c.status === 'Aguardando').length
  const consultaSelecionada = fila.find((c) => c.id === consultaSelecionadaId) ?? null
  const pacienteSelecionado = consultaSelecionada ? pacientesMap[consultaSelecionada.idPaciente] : undefined
  const podeIniciar = consultaSelecionada ? STATUS_ATIVOS.includes(consultaSelecionada.status) : false

  function irParaProntuario(nomePaciente: string) {
    navegar(`/dentista/tratamentos?prontuario=${encodeURIComponent(nomePaciente)}`)
  }

  return (
    <div>
      <div className="dash-topbar">
        <div className="dash-iniciar-wrapper">
          <button
            className="dash-btn-iniciar"
            disabled={!podeIniciar}
            onClick={() => consultaSelecionadaId && navegar(`/dentista/tratamentos?consultaId=${consultaSelecionadaId}`)}
          >
            <i className="fa-solid fa-tooth" />
            {consultaSelecionada?.status === 'Em Consulta' ? 'Continuar Consulta' : 'Iniciar Consulta'}
          </button>
          <span className="dash-iniciar-hint" style={{ visibility: podeIniciar ? 'hidden' : 'visible' }}>
            Selecione um paciente para iniciar
          </span>
        </div>

        <div className="dash-metrics">
          <div className="dash-metric-card">
            <i className="fa-regular fa-calendar-check dash-metric-icon" />
            <div className="dash-metric-info">
              <span className="dash-metric-label">Consultas do Dia</span>
              <span className="dash-metric-value">{minhasHoje.length}</span>
            </div>
          </div>
          <div className="dash-metric-card">
            <i className="fa-solid fa-users dash-metric-icon" />
            <div className="dash-metric-info">
              <span className="dash-metric-label">Pacientes em Fila</span>
              <span className="dash-metric-value">{emEspera}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-body">
        <section className="dash-fila">
          <h2 className="dash-section-title">Consultas de Hoje</h2>

          {emEspera > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: cores.statusConsulta.aguardando.solido,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.88rem',
                borderRadius: 8,
                padding: '0.65rem 1rem',
                marginBottom: '0.75rem',
              }}
            >
              <i className="fa-solid fa-person-walking-arrow-right" />
              <span>
                {emEspera === 1
                  ? '1 paciente chegou e está aguardando atendimento'
                  : `${emEspera} pacientes chegaram e estão aguardando atendimento`}
              </span>
            </div>
          )}

          <div className="table-container" style={{ maxHeight: '65vh' }}>
            <table className="table table-custom mb-0 w-100">
              <thead>
                <tr>
                  <th className="ps-4">
                    NOME <i className="fa-solid fa-sort ms-1 opacity-75" />
                  </th>
                  <th>SERVIÇO</th>
                  <th>HORÁRIO / ESPERA</th>
                </tr>
              </thead>
              <tbody>
                {fila.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--cor-borda)' }}>
                      Nenhuma consulta para hoje
                    </td>
                  </tr>
                ) : (
                  fila.map((c) => (
                    <tr
                      key={c.id}
                      className={`${c.status === 'Aguardando' ? 'fila-chegou' : ''} ${
                        c.id === consultaSelecionadaId ? 'selecionado' : ''
                      }`}
                      onClick={() => setConsultaSelecionadaId(c.id)}
                    >
                      <td className="ps-4 fw-medium">
                        {c.nomePaciente || '—'}
                        {c.status === 'Aguardando' && (
                          <span className="badge-chegou-dash">
                            <i className="fa-solid fa-person-walking-arrow-right" /> Chegou
                          </span>
                        )}
                      </td>
                      <td>{c.nomeServico || '—'}</td>
                      <td>{infoColuna(c)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="dash-detalhe" aria-label="Paciente selecionado">
          <h3 className="dash-detalhe-titulo">Paciente Selecionado</h3>

          {!consultaSelecionada ? (
            <div className="dash-detalhe-vazio">
              <i className="fa-solid fa-user-slash dash-detalhe-vazio-icon" />
              <p>
                Clique em um paciente
                <br />
                na tabela para ver os detalhes
              </p>
            </div>
          ) : (
            <div className="dash-detalhe-grid">
              <div className="dash-detalhe-col-foto">
                <div className="dash-detalhe-foto-wrapper">
                  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                    <rect width="120" height="120" fill="#d6cfc4" />
                    <line x1="10" y1="10" x2="110" y2="110" stroke="#8a7560" strokeWidth={3} strokeLinecap="round" />
                    <line x1="110" y1="10" x2="10" y2="110" stroke="#8a7560" strokeWidth={3} strokeLinecap="round" />
                    <rect x="1" y="1" width="118" height="118" fill="none" stroke="#8a7560" strokeWidth={2} />
                  </svg>
                </div>
                <p className="dash-detalhe-nome">{consultaSelecionada.nomePaciente || '—'}</p>
                <button className="dash-btn-prontuario" onClick={() => irParaProntuario(consultaSelecionada.nomePaciente)}>
                  Prontuário
                </button>
              </div>

              <div className="dash-detalhe-col-info">
                <div className="dash-detalhe-servico-texto">
                  <p>
                    <strong>Serviço: </strong>
                    {consultaSelecionada.nomeServico || '—'}
                  </p>
                  <p>
                    <strong>Aguardo: </strong>
                    {calcularTempoAguardando(consultaSelecionada.horaConsulta)}
                  </p>
                </div>

                <div className="dash-detalhe-card">
                  <h4 className="dash-detalhe-card-titulo">Contato</h4>
                  <div className="dash-info-row">
                    <span className="dash-info-label">Phone:</span>
                    <span>{pacienteSelecionado?.telefone ? mascararTelefone(pacienteSelecionado.telefone) : '—'}</span>
                  </div>
                </div>

                <div className="dash-detalhe-card">
                  <h4 className="dash-detalhe-card-titulo">Informações Pessoais</h4>
                  <div className="dash-info-row">
                    <span className="dash-info-label">CPF:</span>
                    <span>{pacienteSelecionado ? mascararCpf(pacienteSelecionado.cpf) : '—'}</span>
                  </div>
                  <div className="dash-info-row">
                    <span className="dash-info-label">Address:</span>
                    <span>{pacienteSelecionado?.endereco || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
