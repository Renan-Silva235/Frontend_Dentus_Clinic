import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useConsultas } from '../../../hooks/queries/consultas'
import { usePacientes } from '../../../hooks/queries/pacientes'
import { useAtualizarStatusConsulta } from '../../../hooks/queries/consultas'
import { useAutenticacao } from '../../../contexts/AutenticacaoContext'
import { ConsultaView } from './components/ConsultaView'
import ProntuarioView from './components/ProntuarioView'
import FinalizarView, { type PendingObservacoes } from './components/FinalizarView'
import type { Consulta } from '../../../types/dominio'
import './Tratamentos.css'

type Visao = 'lista' | 'consulta' | 'prontuario' | 'finalizar'

export default function TratamentosDentista() {
  const { usuario } = useAutenticacao()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: consultas = [] } = useConsultas()
  const { data: pacientes = [] } = usePacientes()
  const atualizarStatus = useAtualizarStatusConsulta()

  const [visao, setVisao] = useState<Visao>('lista')
  const [prontuarioOrigin, setProntuarioOrigin] = useState<'lista' | 'consulta'>('lista')
  const [filtroPaciente, setFiltroPaciente] = useState('')

  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState<number | null>(null)
  const [pacienteSelecionadoNome, setPacienteSelecionadoNome] = useState<string>('—')
  const [consultaAtual, setConsultaAtual] = useState<Consulta | null>(null)

  const [condicao, setCondicao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [observacao, setObservacao] = useState('')
  const [dentesTratamento, setDentesTratamento] = useState<Set<number>>(new Set())
  const [pendingObservacoes, setPendingObservacoes] = useState<PendingObservacoes>({
    condicao: null,
    descricao: null,
    observacao: null,
    dente: null,
  })

  const pacientesMap = useMemo(() => Object.fromEntries(pacientes.map((p) => [p.id, p])), [pacientes])

  const todosRows = useMemo(
    () =>
      [...pacientes]
        .map((p) => ({ idPaciente: p.id, paciente: p.nome }))
        .sort((a, b) => a.paciente.localeCompare(b.paciente, 'pt-BR', { sensitivity: 'base' })),
    [pacientes],
  )

  const linhasFiltradas = useMemo(() => {
    const termo = filtroPaciente.toLowerCase().trim()
    if (!termo) return todosRows
    return todosRows.filter((r) => r.paciente.toLowerCase().includes(termo))
  }, [todosRows, filtroPaciente])

  // Seleciona o primeiro paciente por padrão, uma única vez após carregar.
  useEffect(() => {
    if (pacienteSelecionadoId === null && todosRows.length > 0) {
      setPacienteSelecionadoId(todosRows[0].idPaciente)
      setPacienteSelecionadoNome(todosRows[0].paciente)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosRows])

  // ── ?consultaId=X / ?prontuario=nome (equivalente a verificarUrlParams) ──
  useEffect(() => {
    const consultaIdParam = Number(searchParams.get('consultaId'))
    if (consultaIdParam) {
      if (consultas.length === 0) return // aguarda os dados carregarem antes de processar
      setSearchParams({}, { replace: true })
      const consulta = consultas.find((c) => c.id === consultaIdParam)
      if (consulta) {
        setPacienteSelecionadoId(consulta.idPaciente)
        setPacienteSelecionadoNome(consulta.nomePaciente)
        setConsultaAtual(consulta)
        setCondicao('')
        setDescricao('')
        setObservacao('')
        setDentesTratamento(new Set())
        if (consulta.status === 'Agendada' || consulta.status === 'Aguardando') {
          atualizarStatus.mutate({ id: consultaIdParam, status: 'Em Consulta' })
        }
        setVisao('consulta')
      }
      return
    }

    const prontuarioNome = searchParams.get('prontuario')
    if (prontuarioNome) {
      if (pacientes.length === 0) return // aguarda os dados carregarem antes de processar
      setSearchParams({}, { replace: true })
      const paciente = pacientes.find((p) => p.nome === prontuarioNome)
      if (paciente) {
        setPacienteSelecionadoId(paciente.id)
        setPacienteSelecionadoNome(paciente.nome)
      } else {
        setPacienteSelecionadoId(null)
        setPacienteSelecionadoNome(prontuarioNome)
      }
      setConsultaAtual(null)
      setProntuarioOrigin('lista')
      setVisao('prontuario')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, consultas, pacientes])

  function selecionarPaciente(idPaciente: number, nome: string) {
    setPacienteSelecionadoId(idPaciente)
    setPacienteSelecionadoNome(nome)
    setConsultaAtual(null)
  }

  function abrirProntuario(origem: 'lista' | 'consulta') {
    setProntuarioOrigin(origem)
    setVisao('prontuario')
  }

  function toggleDente(numero: number) {
    setDentesTratamento((atual) => {
      const novo = new Set(atual)
      if (novo.has(numero)) novo.delete(numero)
      else novo.add(numero)
      return novo
    })
  }

  function selecionarTodosDentes(marcado: boolean) {
    if (!marcado) {
      setDentesTratamento(new Set())
      return
    }
    setDentesTratamento(
      new Set([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]),
    )
  }

  function abrirFinalizarConsulta() {
    setPendingObservacoes({
      condicao: condicao.trim() || null,
      descricao: descricao.trim() || null,
      observacao: observacao.trim() || null,
      dente: dentesTratamento.size ? [...dentesTratamento].join(',') : null,
    })
    setVisao('finalizar')
  }

  function aoFinalizado(idPaciente: number | null) {
    if (idPaciente) {
      const row = todosRows.find((r) => r.idPaciente === idPaciente)
      if (row) {
        setPacienteSelecionadoId(row.idPaciente)
        setPacienteSelecionadoNome(row.paciente)
      }
      setConsultaAtual(null)
      setProntuarioOrigin('lista')
      setVisao('prontuario')
    } else {
      setVisao('lista')
    }
  }

  const consultasDoPacienteSelecionado = useMemo(
    () =>
      pacienteSelecionadoId
        ? consultas.filter((c) => c.idPaciente === pacienteSelecionadoId && c.status !== 'Cancelada' && c.status !== 'Inativa')
        : [],
    [consultas, pacienteSelecionadoId],
  )

  return (
    <div className="page-container">
      <header className="mobile-header d-flex align-items-center mb-4 d-lg-none">
        <h1 className="mobile-header-title mb-0">Tratamentos</h1>
      </header>

      {visao === 'lista' && (
        <>
          <div className="filtro-tratamentos bg-white border rounded-3 p-3 p-lg-4 mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm-8 col-lg-4">
                <label className="filter-label d-block small fw-semibold text-uppercase mb-1">Paciente</label>
                <div className="filter-input-wrapper position-relative">
                  <i className="fa-solid fa-user filter-input-icon" />
                  <input
                    type="text"
                    className="filter-input form-control form-control-sm"
                    placeholder="Nome do paciente"
                    value={filtroPaciente}
                    onChange={(e) => setFiltroPaciente(e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-actions col-12 col-sm-4 col-lg-2 d-flex align-items-end">
                <button className="btn-filter-clear btn btn-sm btn-outline-secondary w-100" onClick={() => setFiltroPaciente('')}>
                  <i className="fa-solid fa-xmark" /> Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="tratamentos-layout-grid">
            <div className="tratamentos-tabela-col">
              <div className="tratamentos-lista-wrapper">
                <div className="tratamentos-lista-titulo">Pacientes</div>
                <ul className="tratamentos-pacientes-list" role="listbox" aria-label="Pacientes">
                  {linhasFiltradas.length === 0 ? (
                    <li className="tratamentos-lista-vazia">Nenhum paciente encontrado</li>
                  ) : (
                    linhasFiltradas.map((r) => (
                      <li
                        key={r.idPaciente}
                        className={`tratamento-paciente-item ${r.idPaciente === pacienteSelecionadoId ? 'selected' : ''}`}
                        role="option"
                        aria-selected={r.idPaciente === pacienteSelecionadoId}
                        onClick={() => selecionarPaciente(r.idPaciente, r.paciente)}
                      >
                        {r.paciente}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="tratamentos-resumo-col">
              <div className="resumo-card bg-white border rounded p-3 shadow-sm">
                <h3 className="resumo-titulo fw-bold text-center mb-3 pb-3">Paciente</h3>
                <div className="resumo-foto d-flex justify-content-center mb-3">
                  <div className="foto-placeholder">
                    <div className="foto-x" />
                  </div>
                </div>
                <div className="resumo-paciente-info d-flex flex-column text-center mb-3">
                  <span className="resumo-label-small">Nome</span>
                  <span className="resumo-nome fw-bold">{pacienteSelecionadoNome}</span>
                </div>
                <div className="resumo-acoes d-flex flex-column gap-2 mt-2">
                  <button className="btn-resumo-prontuario btn btn-sm w-100" onClick={() => abrirProntuario('lista')}>
                    <i className="fa-regular fa-eye" /> Prontuário
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {visao === 'consulta' && (
        <ConsultaView
          nomePaciente={pacienteSelecionadoNome}
          nomeServico={consultaAtual?.nomeServico || '—'}
          condicao={condicao}
          descricao={descricao}
          observacao={observacao}
          dentesTratamento={dentesTratamento}
          onCondicaoChange={setCondicao}
          onDescricaoChange={setDescricao}
          onObservacaoChange={setObservacao}
          onToggleDente={toggleDente}
          onSelecionarTodos={selecionarTodosDentes}
          onAbrirProntuario={() => abrirProntuario('consulta')}
          onFinalizarConsulta={abrirFinalizarConsulta}
        />
      )}

      {visao === 'prontuario' && (
        <ProntuarioView
          pacienteId={pacienteSelecionadoId}
          pacienteNome={pacienteSelecionadoNome}
          paciente={pacienteSelecionadoId ? pacientesMap[pacienteSelecionadoId] : undefined}
          consultasDoPaciente={consultasDoPacienteSelecionado}
          dentistaNome={usuario?.nome || '—'}
          onVoltar={() => setVisao(prontuarioOrigin === 'consulta' ? 'consulta' : 'lista')}
        />
      )}

      {visao === 'finalizar' && (
        <FinalizarView
          nomePaciente={pacienteSelecionadoNome}
          nomeServico={consultaAtual?.nomeServico || '—'}
          consultaId={consultaAtual?.id ?? null}
          idPaciente={consultaAtual?.idPaciente ?? pacienteSelecionadoId}
          idServico={consultaAtual?.idServico}
          pendingObservacoes={pendingObservacoes}
          dentesTratamento={dentesTratamento}
          onVoltarConsulta={() => setVisao('consulta')}
          onFinalizado={aoFinalizado}
        />
      )}
    </div>
  )
}
