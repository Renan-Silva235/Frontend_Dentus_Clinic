import { useMemo, useState } from 'react'
import { usePacientes } from '../../../hooks/queries/pacientes'
import { useDebounce } from '../../../hooks/useDebounce'
import { aplicarMascaraCpfProgressiva, formatarDataBr, mascararCpfParcial } from '../../../utils/formatadores'
import { ModalInativarPaciente } from './components/ModalInativarPaciente'
import type { Paciente } from '../../../types/dominio'
import './Pacientes.css'

type ColunaOrdenacao = 'nome' | 'data' | null

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
  return partes[0][0].toUpperCase()
}

export default function PacientesAdmin() {
  const { data: pacientes = [], isLoading } = usePacientes()

  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCpf, setFiltroCpf] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const filtroNomeDebounced = useDebounce(filtroNome, 200)
  const filtroCpfDebounced = useDebounce(filtroCpf, 200)

  const [sortCol, setSortCol] = useState<ColunaOrdenacao>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const [pacienteParaInativar, setPacienteParaInativar] = useState<Paciente | null>(null)

  const lista = useMemo(() => {
    const nome = filtroNomeDebounced.toLowerCase().trim()
    const cpf = filtroCpfDebounced.replace(/\D/g, '')

    let resultado = pacientes.filter((p) => {
      const matchNome = !nome || p.nome.toLowerCase().includes(nome)
      const matchCpf = !cpf || p.cpf.replace(/\D/g, '').includes(cpf)
      const matchData = !filtroData || p.dataNascimento === filtroData
      return matchNome && matchCpf && matchData
    })

    if (sortCol) {
      resultado = [...resultado].sort((a, b) => {
        const va = sortCol === 'nome' ? a.nome.toLowerCase() : a.dataNascimento
        const vb = sortCol === 'nome' ? b.nome.toLowerCase() : b.dataNascimento
        if (va < vb) return sortAsc ? -1 : 1
        if (va > vb) return sortAsc ? 1 : -1
        return 0
      })
    }

    return resultado
  }, [pacientes, filtroNomeDebounced, filtroCpfDebounced, filtroData, sortCol, sortAsc])

  function ordenarPor(coluna: ColunaOrdenacao) {
    if (sortCol === coluna) setSortAsc((atual) => !atual)
    else {
      setSortCol(coluna)
      setSortAsc(true)
    }
  }

  function iconeOrdenacao(coluna: ColunaOrdenacao) {
    if (sortCol !== coluna) return 'fa-solid fa-sort'
    return sortAsc ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'
  }

  function limparFiltros() {
    setFiltroNome('')
    setFiltroCpf('')
    setFiltroData('')
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <i className="fa-solid fa-users page-title-icon" />
            Pacientes
          </h1>
          <p className="page-subtitle">Consulte e gerencie os pacientes cadastrados</p>
        </div>
        <div className="page-header-right">
          <span className="badge-total">
            {lista.length} paciente{lista.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <section className="filter-bar">
        <div className="filter-field">
          <label className="filter-label" htmlFor="filtroNome">
            Paciente
          </label>
          <div className="filter-input-wrapper">
            <i className="fa-solid fa-magnifying-glass filter-input-icon" />
            <input
              type="text"
              id="filtroNome"
              className="filter-input"
              placeholder="Buscar por nome..."
              autoComplete="off"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-field">
          <label className="filter-label" htmlFor="filtroCpf">
            CPF
          </label>
          <div className="filter-input-wrapper">
            <i className="fa-solid fa-credit-card filter-input-icon" />
            <input
              type="text"
              id="filtroCpf"
              className="filter-input"
              placeholder="000.000.000-00"
              maxLength={14}
              autoComplete="off"
              value={filtroCpf}
              onChange={(e) => setFiltroCpf(aplicarMascaraCpfProgressiva(e.target.value))}
            />
          </div>
        </div>

        <div className="filter-field">
          <label className="filter-label" htmlFor="filtroData">
            Data de Nascimento
          </label>
          <div className="filter-input-wrapper">
            <input
              type="date"
              id="filtroData"
              className="filter-input filter-input-date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-filter-clear" onClick={limparFiltros} title="Limpar filtros">
            <i className="fa-solid fa-xmark" />
            Limpar
          </button>
        </div>
      </section>

      <section className="table-container">
        <div className="table-scroll">
          <table className="tabela-padrao">
            <thead>
              <tr>
                <th className="th-nome">
                  <button className="th-sort" onClick={() => ordenarPor('nome')}>
                    Nome do paciente <i className={iconeOrdenacao('nome')} />
                  </button>
                </th>
                <th className="th-cpf">CPF</th>
                <th className="th-celular">Celular</th>
                <th className="th-data">
                  <button className="th-sort" onClick={() => ordenarPor('data')}>
                    Data de Nascimento <i className={iconeOrdenacao('data')} />
                  </button>
                </th>
                <th className="th-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td className="td-nome">{p.nome}</td>
                  <td className="td-cpf">{mascararCpfParcial(p.cpf)}</td>
                  <td className="td-celular">{p.telefone || '—'}</td>
                  <td className="td-data">{formatarDataBr(p.dataNascimento)}</td>
                  <td className="td-acoes">
                    <button className="btn-delete" title={`Inativar ${p.nome}`} onClick={() => setPacienteParaInativar(p)}>
                      <i className="fa-solid fa-user-slash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && lista.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-user-xmark" />
            <p>Nenhum paciente encontrado</p>
          </div>
        )}
      </section>

      <section className="cards-mobile">
        {lista.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-xmark" />
            <p>Nenhum paciente encontrado</p>
          </div>
        ) : (
          lista.map((p) => (
            <div className="card-mobile" key={p.id}>
              <div className="avatar-iniciais">{iniciais(p.nome)}</div>
              <div className="card-mobile-info">
                <div className="card-mobile-nome">{p.nome}</div>
                <div className="card-mobile-detail-pacientes">
                  <span>
                    <i className="fa-regular fa-id-card" /> {mascararCpfParcial(p.cpf)}
                  </span>
                  <span>
                    <i className="fa-regular fa-calendar" /> {formatarDataBr(p.dataNascimento)}
                  </span>
                </div>
              </div>
              <div className="card-mobile-actions">
                <button className="btn-delete" title={`Inativar ${p.nome}`} onClick={() => setPacienteParaInativar(p)}>
                  <i className="fa-solid fa-user-slash" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <ModalInativarPaciente paciente={pacienteParaInativar} onFechar={() => setPacienteParaInativar(null)} />
    </div>
  )
}
