import { useEffect, useMemo, useState } from 'react'
import { Odontograma } from '../../../../componentes/Odontograma/Odontograma'
import { useProntuarioEPlanos } from '../../../../hooks/queries/prontuariosPlanos'
import { mascararCpf, mascararTelefone, formatarDataBr } from '../../../../utils/formatadores'
import type { Consulta, Paciente, Plano, Prontuario } from '../../../../types/dominio'

interface Props {
  pacienteId: number | null
  pacienteNome: string
  paciente: Paciente | undefined
  consultasDoPaciente: Consulta[]
  dentistaNome: string
  onVoltar: () => void
}

function resolverDataPlano(plano: Plano | undefined, prontuario: Prontuario | null): string {
  if (plano?.dataAtualizacao && plano.dataAtualizacao !== '0001-01-01') return formatarDataBr(plano.dataAtualizacao)
  if (plano?.dataCriacao && plano.dataCriacao !== '0001-01-01') return formatarDataBr(plano.dataCriacao)
  if (prontuario?.dataAbertura) return formatarDataBr(prontuario.dataAbertura)
  return '—'
}

function dentesDoPlano(plano: Plano | undefined): Set<number> {
  if (!plano?.dente) return new Set()
  if (plano.dente === 'todos') {
    return new Set([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38])
  }
  return new Set(plano.dente.split(',').map((n) => Number(n.trim())).filter(Boolean))
}

export default function ProntuarioView({ pacienteId, pacienteNome, paciente, consultasDoPaciente, dentistaNome, onVoltar }: Props) {
  const { data, isLoading } = useProntuarioEPlanos(pacienteId ?? undefined)

  const prontuario = data?.prontuario ?? null
  const planos = data?.planos ?? []

  const [indiceSelecionado, setIndiceSelecionado] = useState(0)

  useEffect(() => {
    setIndiceSelecionado(0)
  }, [pacienteId])

  const planoAtual = planos[indiceSelecionado]

  const consultasAgendadas = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]
    return consultasDoPaciente
      .filter((c) => c.dataConsulta >= hoje)
      .sort((a, b) => `${a.dataConsulta}T${a.horaConsulta}`.localeCompare(`${b.dataConsulta}T${b.horaConsulta}`))
  }, [consultasDoPaciente])


  return (
    <div className="prontuario-view">
      <div className="prontuario-header">
        <button className="btn-voltar btn btn-sm btn-outline-secondary mb-3 d-inline-flex align-items-center gap-2" onClick={onVoltar}>
          <i className="fa-solid fa-arrow-left" /> Voltar
        </button>
        <div className="prontuario-paciente-header">
          <div className="prontuario-foto-placeholder">
            <div className="foto-x" />
          </div>
          <div className="prontuario-paciente-dados d-flex flex-column">
            <span className="prontuario-label small text-muted">Paciente</span>
            <span className="prontuario-nome fw-bold">{pacienteNome}</span>
            <span className="prontuario-cpf small text-muted">CPF: {paciente ? mascararCpf(paciente.cpf) : '—'}</span>
          </div>
          <div className="prontuario-contatos d-flex gap-4 ms-auto flex-wrap">
            <span className="prontuario-contato d-flex align-items-center gap-2 small fw-medium">
              <i className="fa-solid fa-phone text-muted" /> {paciente?.telefone ? mascararTelefone(paciente.telefone) : '—'}
            </span>
            <span className="prontuario-contato d-flex align-items-center gap-2 small fw-medium">
              <i className="fa-solid fa-envelope text-muted" /> {paciente?.email || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="prontuario-layout row g-3">
        <div className="prontuario-main col-12 col-lg-8">
          <div className="prontuario-plano-section bg-white border rounded p-3 shadow-sm">
            <div className="prontuario-plano-header d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <h3 className="prontuario-plano-titulo fw-bold mb-0">Plano Selecionado</h3>
              <div className="prontuario-plano-info-right d-flex flex-column align-items-end">
                <span className="prontuario-plano-servico fw-bold">{planoAtual?.nomeServico || '—'}</span>
                <span className="prontuario-plano-data small text-muted">{resolverDataPlano(planoAtual, prontuario)}</span>
              </div>
            </div>

            {!isLoading && planos.length === 0 ? (
              <p className="text-muted small mb-0">Nenhum plano encontrado</p>
            ) : (
              <>
                <div className="prontuario-odontograma mb-3">
                  <h4 className="prontuario-sub-titulo fw-bold mb-2">
                    Odontograma
                  </h4>
                  <Odontograma
                    prefixo="dente-prontuario"
                    classeAtiva="tratado-consulta"
                    numerosSelecionados={dentesDoPlano(planoAtual)}
                    somenteLeitura
                  />
                  <div className="odontograma-legenda">
                    <span className="legenda-item d-flex align-items-center gap-1 small">
                      <span className="legenda-cor tratado-consulta-bg" /> Tratado em Consulta
                    </span>
                  </div>
                </div>

                <div className="prontuario-detalhes-row row g-3 mb-3">
                  <div className="prontuario-detalhes-esq col-12 col-md-7">
                    <div className="prontuario-campo mb-3">
                      <label className="prontuario-campo-label form-label small fw-semibold mb-1">Condição</label>
                      <div className="prontuario-campo-valor">{planoAtual?.condicao || '—'}</div>
                    </div>
                    <div className="prontuario-campo">
                      <label className="prontuario-campo-label form-label small fw-semibold mb-1">Planejamento do Tratamento</label>
                      <div className="prontuario-campo-textarea">{planoAtual?.descricao || '—'}</div>
                    </div>
                  </div>
                  <div className="prontuario-detalhes-dir col-12 col-md-5">
                    <div className="prontuario-obs-card rounded p-3 h-100 d-flex flex-column">
                      <h4 className="prontuario-obs-titulo fw-bold mb-2">Procedimento Realizado</h4>
                      <div className="prontuario-obs-texto small flex-grow-1">{planoAtual?.observacao || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="prontuario-dentista small fw-semibold">
                  <span className="prontuario-dentista-label">Dentista Responsável:</span>{' '}
                  <span className="prontuario-dentista-nome">{dentistaNome}</span>
                </div>

              </>
            )}
          </div>
        </div>

        <div className="prontuario-sidebar col-12 col-lg-4">
          <div className="prontuario-card bg-white border rounded p-3 shadow-sm mb-3">
            <h4 className="prontuario-card-titulo fw-semibold mb-2">Consultas Agendadas</h4>
            <div className="prontuario-table-wrapper overflow-auto">
              <table className="prontuario-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Procedimento</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasAgendadas.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--cor-borda)', padding: '1rem' }}>
                        Nenhuma consulta agendada
                      </td>
                    </tr>
                  ) : (
                    consultasAgendadas.map((c) => (
                      <tr key={c.id}>
                        <td>{formatarDataBr(c.dataConsulta)}</td>
                        <td>{(c.horaConsulta || '').slice(0, 5)}</td>
                        <td>{c.nomeServico || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="prontuario-card bg-white border rounded p-3 shadow-sm mb-3">
            <h4 className="prontuario-card-titulo fw-semibold mb-2">Plano Realizados</h4>
            <div className="prontuario-table-wrapper overflow-auto">
              <table className="prontuario-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Dentista</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--cor-borda)', padding: '1rem' }}>
                        Nenhum plano encontrado
                      </td>
                    </tr>
                  ) : (
                    planos.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`plano-row ${i === indiceSelecionado ? 'selected' : ''}`}
                        onClick={() => {
                          setIndiceSelecionado(i)
                                              }}
                      >
                        <td>{resolverDataPlano(p, prontuario)}</td>
                        <td>{p.nomeServico || '—'}</td>
                        <td>{dentistaNome}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="prontuario-card bg-white border rounded p-3 shadow-sm mb-3">
            <div className="prontuario-card-titulo-row d-flex justify-content-between align-items-center mb-2">
              <h4 className="prontuario-card-titulo fw-semibold mb-0">Informações do paciente</h4>
            </div>
            <div className="prontuario-info-grid d-flex flex-column gap-2">
              <div className="prontuario-info-item d-flex flex-column">
                <span className="prontuario-info-label small fw-semibold">Última atualização:</span>
                <span className="prontuario-info-valor small">
                  {prontuario ? formatarDataBr(prontuario.dataUltimaAtualizacao ?? prontuario.dataAbertura) : '—'}
                </span>
              </div>
              <div className="prontuario-info-item d-flex flex-column">
                <span className="prontuario-info-label small fw-semibold">E-mail:</span>
                <span className="prontuario-info-valor small">{paciente?.email || '—'}</span>
              </div>
              <div className="prontuario-info-item d-flex flex-column">
                <span className="prontuario-info-label small fw-semibold">Endereço:</span>
                <span className="prontuario-info-valor small">{paciente?.endereco || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
