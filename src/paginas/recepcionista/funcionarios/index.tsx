import { useMemo, useState } from 'react'
import { useFuncionarios } from '../../../hooks/queries/funcionarios'
import { useDentistas } from '../../../hooks/queries/dentistas'
import { useDebounce } from '../../../hooks/useDebounce'
import '../../../styles/equipe.css'

type FiltroCargo = 'todos' | 'secretaria' | 'dentista' | 'administrador'

interface PessoaEquipe {
  id: number
  nome: string
  cargo: string
  tipo: FiltroCargo
}

const mapaTipo: Record<string, FiltroCargo> = {
  administrador: 'administrador',
  recepcionista: 'secretaria',
  secretaria: 'secretaria',
  ti: 'administrador',
}

export default function FuncionariosRecepcionista() {
  const { data: funcionarios = [], isError: erroFuncionarios } = useFuncionarios()
  const { data: dentistas = [], isError: erroDentistas } = useDentistas()

  const [filtroAtivo, setFiltroAtivo] = useState<FiltroCargo>('todos')
  const [termoBusca, setTermoBusca] = useState('')
  const termoBuscaDebounced = useDebounce(termoBusca, 250)

  const equipe: PessoaEquipe[] = useMemo(() => {
    const listaFuncionarios: PessoaEquipe[] = funcionarios.map((f) => {
      const cargoKey = (f.cargo || '').toLowerCase()
      return {
        id: f.id,
        nome: f.nome,
        cargo: f.cargo || '—',
        tipo: mapaTipo[cargoKey] ?? 'secretaria',
      }
    })

    const listaDentistas: PessoaEquipe[] = dentistas.map((d) => ({
      id: d.id,
      nome: d.nome,
      cargo: 'Dentista',
      tipo: 'dentista',
    }))

    return [...listaFuncionarios, ...listaDentistas]
  }, [funcionarios, dentistas])

  const lista = useMemo(() => {
    const termo = termoBuscaDebounced.toLowerCase().trim()
    return equipe.filter((p) => {
      const matchFiltro = filtroAtivo === 'todos' || p.tipo === filtroAtivo
      const matchBusca = !termo || p.nome.toLowerCase().includes(termo) || p.cargo.toLowerCase().includes(termo)
      return matchFiltro && matchBusca
    })
  }, [equipe, filtroAtivo, termoBuscaDebounced])

  const chips: { filtro: FiltroCargo; label: string }[] = [
    { filtro: 'todos', label: 'Todos' },
    { filtro: 'secretaria', label: 'Recepcionista' },
    { filtro: 'dentista', label: 'Dentista' },
    { filtro: 'administrador', label: 'ADM' },
  ]

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Funcionários</h1>
        <p className="page-subtitle">Visualize a equipe da Dentu's Clinic</p>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar funcionário..."
            autoComplete="off"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
        <div className="filter-group">
          {chips.map((chip) => (
            <button
              key={chip.filtro}
              className={`filter-chip ${filtroAtivo === chip.filtro ? 'active' : ''}`}
              onClick={() => setFiltroAtivo(chip.filtro)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <section className="grid-funcionarios">
        {erroFuncionarios || erroDentistas ? (
          <div className="empty-state">
            <i className="fa-solid fa-triangle-exclamation" />
            <p>Erro ao carregar funcionários.</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-xmark" />
            <p>Nenhum funcionário encontrado</p>
          </div>
        ) : (
          lista.map((p) => (
            <article className="card-funcionario" key={`${p.tipo}-${p.id}`}>
              <div className="card-avatar">
                <i className="fa-solid fa-user card-avatar-icon" />
              </div>
              <h3 className="card-nome">{p.nome}</h3>
              <span className={`cargo-badge ${p.tipo}`}>{p.cargo}</span>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
