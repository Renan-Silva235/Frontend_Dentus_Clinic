import { useMemo, useState } from 'react'
import { useServicos } from '../../../hooks/queries/servicos'
import { useEspecialidades } from '../../../hooks/queries/especialidades'
import { useDebounce } from '../../../hooks/useDebounce'
import { ModalCadastrarServico } from './components/ModalCadastrarServico'
import { ModalRemoverServico } from './components/ModalRemoverServico'
import './Servicos.css'

export interface ServicoComEspecialidade {
  id: number
  nome: string
  idEspecialidade?: number
  nomeEspecialidade: string
}

export default function ServicosAdmin() {
  const { data: servicos = [], isLoading } = useServicos()
  const { data: especialidades = [] } = useEspecialidades()

  const [filtroNome, setFiltroNome] = useState('')
  const filtroNomeDebounced = useDebounce(filtroNome, 200)
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [ordemAsc, setOrdemAsc] = useState<boolean | null>(null)

  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [servicoParaRemover, setServicoParaRemover] = useState<ServicoComEspecialidade | null>(null)

  const mapaEspecialidades = useMemo(
    () => Object.fromEntries(especialidades.map((e) => [e.id, e.nome])),
    [especialidades],
  )

  const listaCompleta: ServicoComEspecialidade[] = useMemo(
    () =>
      servicos.map((s) => ({
        id: s.id,
        nome: s.nome,
        idEspecialidade: s.idEspecialidade,
        nomeEspecialidade: s.idEspecialidade ? mapaEspecialidades[s.idEspecialidade] || '—' : '—',
      })),
    [servicos, mapaEspecialidades],
  )

  const lista = useMemo(() => {
    const nomeBusca = filtroNomeDebounced.toLowerCase().trim()
    let resultado = listaCompleta.filter((s) => {
      const matchNome = !nomeBusca || s.nome.toLowerCase().includes(nomeBusca)
      const matchEspecialidade = !filtroEspecialidade || String(s.idEspecialidade) === filtroEspecialidade
      return matchNome && matchEspecialidade
    })

    if (ordemAsc !== null) {
      resultado = [...resultado].sort((a, b) => {
        const comparacao = a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
        return ordemAsc ? comparacao : -comparacao
      })
    }

    return resultado
  }, [listaCompleta, filtroNomeDebounced, filtroEspecialidade, ordemAsc])

  function alternarOrdenacao() {
    setOrdemAsc((atual) => (atual === null ? true : !atual))
  }

  function limparFiltros() {
    setFiltroNome('')
    setFiltroEspecialidade('')
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <i className="fa-solid fa-tooth page-title-icon" />
            Serviços
          </h1>
          <p className="page-subtitle">Cadastre e gerencie os serviços disponíveis na clínica</p>
        </div>
        <div className="page-header-right d-flex align-items-center gap-3">
          <span className="badge-total">
            {lista.length} serviço{lista.length !== 1 ? 's' : ''}
          </span>
          <button className="btn-novo" onClick={() => setModalCadastroAberto(true)}>
            <i className="fa-solid fa-plus me-1" />
            Cadastrar Serviço
          </button>
        </div>
      </header>

      <section className="filter-bar">
        <div className="filter-field">
          <label className="filter-label" htmlFor="filtroNome">
            Serviço
          </label>
          <div className="filter-input-wrapper">
            <i className="bi bi-search filter-input-icon" />
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
          <label className="filter-label" htmlFor="filtroEspecialidade">
            Especialidade
          </label>
          <div className="filter-input-wrapper">
            <i className="bi bi-tag filter-input-icon" />
            <select
              id="filtroEspecialidade"
              className="filter-input filter-select"
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
            >
              <option value="">Todas</option>
              {especialidades.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-filter-clear" onClick={limparFiltros} title="Limpar filtros">
            <i className="bi bi-x-lg" />
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
                  <button className="th-sort" onClick={alternarOrdenacao}>
                    Nome do serviço{' '}
                    <i
                      className={`bi ${
                        ordemAsc === null ? 'bi-chevron-expand' : ordemAsc ? 'bi-chevron-up' : 'bi-chevron-down'
                      }`}
                    />
                  </button>
                </th>
                <th className="th-especialidade">Especialidade</th>
                <th className="th-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id}>
                  <td className="td-nome">{s.nome}</td>
                  <td className="td-especialidade">
                    <span className="badge-generico">{s.nomeEspecialidade}</span>
                  </td>
                  <td className="td-acoes">
                    <button className="btn-delete" title={`Remover ${s.nome}`} onClick={() => setServicoParaRemover(s)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && lista.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-tooth" />
            <p>Nenhum serviço encontrado</p>
          </div>
        )}
      </section>

      <section className="cards-mobile">
        {lista.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-tooth" />
            <p>Nenhum serviço encontrado</p>
          </div>
        ) : (
          lista.map((s) => (
            <div className="card-mobile" key={s.id}>
              <div className="card-mobile-icon">
                <i className="fa-solid fa-tooth" />
              </div>
              <div className="card-mobile-info">
                <div className="card-mobile-nome">{s.nome}</div>
                <div className="card-mobile-detail">{s.nomeEspecialidade}</div>
              </div>
              <div className="card-mobile-actions">
                <button className="btn-delete" title={`Remover ${s.nome}`} onClick={() => setServicoParaRemover(s)}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <ModalCadastrarServico
        aberto={modalCadastroAberto}
        especialidades={especialidades}
        onFechar={() => setModalCadastroAberto(false)}
      />
      <ModalRemoverServico servico={servicoParaRemover} onFechar={() => setServicoParaRemover(null)} />
    </div>
  )
}
