import { useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useConsultas } from '../../../hooks/queries/consultas'
import { usePacientes } from '../../../hooks/queries/pacientes'
import { useAutenticacao } from '../../../contexts/AutenticacaoContext'
import {
  aplicarMascaraCpfProgressiva,
  aplicarMascaraTelefoneProgressiva,
  mascararCpf,
  mascararTelefone,
} from '../../../utils/formatadores'
import './Pacientes.css'

interface LinhaAgendamento {
  idConsulta: number
  nome: string
  cpf: string
  telefone: string
  servico: string
  data: string
  hora: string
  status: string
}

function formatarDataFiltro(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function PacientesDentista() {
  const { usuario } = useAutenticacao()
  const { data: consultas = [] } = useConsultas()
  const { data: pacientes = [] } = usePacientes()

  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCpf, setFiltroCpf] = useState('')
  const [filtroServico, setFiltroServico] = useState('')
  const [filtroTelefone, setFiltroTelefone] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [detalhe, setDetalhe] = useState<LinhaAgendamento | null>(null)

  const pacientesMap = useMemo(() => Object.fromEntries(pacientes.map((p) => [p.id, p])), [pacientes])

  const linhas: LinhaAgendamento[] = useMemo(() => {
    return consultas
      .filter((c) => c.idDentista === usuario?.id)
      .map((c) => {
        const paciente = pacientesMap[c.idPaciente]
        return {
          idConsulta: c.id,
          nome: c.nomePaciente || '—',
          cpf: paciente ? mascararCpf(paciente.cpf) : '—',
          telefone: paciente?.telefone ? mascararTelefone(paciente.telefone) : '—',
          servico: c.nomeServico || '—',
          data: c.dataConsulta ? formatarDataFiltro(c.dataConsulta) : '—',
          hora: c.horaConsulta ? c.horaConsulta.slice(0, 5) : '—',
          status: c.status || '—',
        }
      })
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
  }, [consultas, pacientesMap, usuario])

  const servicosDisponiveis = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.servico).filter((s) => s !== '—'))).sort(),
    [linhas],
  )

  const linhasFiltradas = useMemo(() => {
    const nome = filtroNome.toLowerCase().trim()
    const cpf = filtroCpf.toLowerCase().trim()
    const servico = filtroServico.toLowerCase().trim()
    const telefone = filtroTelefone.toLowerCase().trim()
    const data = filtroData.trim()

    return linhas.filter(
      (l) =>
        l.nome.toLowerCase().includes(nome) &&
        l.cpf.toLowerCase().includes(cpf) &&
        l.servico.toLowerCase().includes(servico) &&
        l.telefone.toLowerCase().includes(telefone) &&
        l.data.includes(data),
    )
  }, [linhas, filtroNome, filtroCpf, filtroServico, filtroTelefone, filtroData])

  function limparFiltros() {
    setFiltroNome('')
    setFiltroCpf('')
    setFiltroServico('')
    setFiltroTelefone('')
    setFiltroData('')
  }

  function aplicarMascaraData(valor: string): string {
    let v = valor.replace(/\D/g, '').slice(0, 8)
    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    return v
  }

  return (
    <div className="container py-3">
      <header className="mobile-header d-flex align-items-center mb-4">
        <h1 className="mobile-header-title mb-0">Consultas Agendadas</h1>
      </header>

      <section className="filter-card-mobile">
        <div className="row g-3">
          <div className="col-12">
            <div className="filter-input-wrapper">
              <i className="fa-solid fa-magnifying-glass filter-input-icon" />
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar paciente por nome..."
                autoComplete="off"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="filter-input-wrapper">
              <i className="fa-regular fa-id-card filter-input-icon" />
              <input
                type="text"
                className="filter-input"
                placeholder="CPF"
                autoComplete="off"
                value={filtroCpf}
                onChange={(e) => setFiltroCpf(aplicarMascaraCpfProgressiva(e.target.value))}
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="filter-input-wrapper">
              <i className="fa-solid fa-stethoscope filter-input-icon" />
              <select className="filter-input" value={filtroServico} onChange={(e) => setFiltroServico(e.target.value)}>
                <option value="">Todos os Serviços</option>
                {servicosDisponiveis.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-6">
            <div className="filter-input-wrapper">
              <i className="fa-solid fa-phone filter-input-icon" />
              <input
                type="text"
                className="filter-input"
                placeholder="Telefone"
                autoComplete="off"
                value={filtroTelefone}
                onChange={(e) => setFiltroTelefone(aplicarMascaraTelefoneProgressiva(e.target.value))}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="filter-input-wrapper">
              <i className="fa-regular fa-calendar filter-input-icon" />
              <input
                type="text"
                className="filter-input"
                placeholder="Data"
                maxLength={10}
                autoComplete="off"
                value={filtroData}
                onChange={(e) => setFiltroData(aplicarMascaraData(e.target.value))}
              />
            </div>
          </div>
          <div className="col-12 d-flex justify-content-end mt-1">
            <button className="btn-filter-clear-mobile" onClick={limparFiltros}>
              Limpar
            </button>
          </div>
        </div>
      </section>

      <h2 className="section-title-mobile mb-3">Agendamentos</h2>

      <div className="patient-cards-list">
        {linhasFiltradas.map((l) => (
          <div className="patient-card" key={l.idConsulta}>
            <div className="pc-header">
              <h3 className="pc-name">{l.nome}</h3>
            </div>
            <div className="pc-body">
              <div className="pc-item">
                <i className="fa-regular fa-id-card" />
                <span>{l.cpf}</span>
              </div>
              <div className="pc-item">
                <i className="fa-solid fa-phone" />
                <span>{l.telefone}</span>
              </div>
              <div className="pc-item pc-service">
                <i className="fa-solid fa-stethoscope" />
                <span>{l.servico}</span>
              </div>
              <div className="pc-item">
                <i className="fa-regular fa-calendar" />
                <span>
                  {l.data} — {l.hora}
                </span>
              </div>
            </div>
            <div className="pc-footer">
              <button className="btn-detalhes" onClick={() => setDetalhe(l)}>
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {linhasFiltradas.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fa-regular fa-calendar-xmark fa-2x mb-3 d-block" />
          <p className="mb-0">Nenhuma consulta encontrada</p>
        </div>
      )}

      <Modal show={detalhe !== null} onHide={() => setDetalhe(null)} centered>
        <div style={{ borderRadius: 16, backgroundColor: '#FAF9F6' }}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title style={{ color: '#6e5430', fontWeight: 700, fontSize: '1.3rem' }}>
              Detalhes do Agendamento
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-4 pb-4">
            <div className="text-center mb-4">
              <h3 style={{ color: '#4a3520', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                {detalhe?.nome}
              </h3>
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(110, 84, 48, 0.1)',
                  color: '#6e5430',
                  fontSize: '0.95rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 6,
                }}
              >
                {detalhe?.servico}
              </span>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label style={{ fontSize: '0.75rem', color: '#a68a64', fontWeight: 600, textTransform: 'uppercase' }}>
                  CPF
                </label>
                <div style={{ color: '#6e5430', fontWeight: 500 }}>{detalhe?.cpf}</div>
              </div>
              <div className="col-6">
                <label style={{ fontSize: '0.75rem', color: '#a68a64', fontWeight: 600, textTransform: 'uppercase' }}>
                  Telefone
                </label>
                <div style={{ color: '#6e5430', fontWeight: 500 }}>{detalhe?.telefone}</div>
              </div>
              <div className="col-6">
                <label style={{ fontSize: '0.75rem', color: '#a68a64', fontWeight: 600, textTransform: 'uppercase' }}>
                  Data
                </label>
                <div style={{ color: '#6e5430', fontWeight: 500 }}>{detalhe?.data}</div>
              </div>
              <div className="col-6">
                <label style={{ fontSize: '0.75rem', color: '#a68a64', fontWeight: 600, textTransform: 'uppercase' }}>
                  Horário
                </label>
                <div style={{ color: '#6e5430', fontWeight: 500 }}>{detalhe?.hora}</div>
              </div>
              <div className="col-12">
                <label style={{ fontSize: '0.75rem', color: '#a68a64', fontWeight: 600, textTransform: 'uppercase' }}>
                  Status
                </label>
                <div style={{ color: '#6e5430', fontWeight: 500 }}>{detalhe?.status}</div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-3 justify-content-center">
            <button
              className="btn w-100"
              onClick={() => setDetalhe(null)}
              style={{ backgroundColor: '#6e5430', color: '#fff', fontWeight: 600, borderRadius: 8, padding: '0.75rem' }}
            >
              Fechar
            </button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  )
}
