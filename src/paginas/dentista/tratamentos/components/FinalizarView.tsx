import { useState } from 'react'
import { Odontograma } from '../../../../componentes/Odontograma/Odontograma'
import { prontuariosService } from '../../../../services/prontuariosService'
import { planosService } from '../../../../services/planosService'
import { consultasService } from '../../../../services/consultasService'
import { dispararSucesso } from '../../../../utils/toastErros'
import type { Plano } from '../../../../types/dominio'

export interface PendingObservacoes {
  condicao: string | null
  descricao: string | null
  observacao: string | null
  dente: string | null
}

interface Props {
  nomePaciente: string
  nomeServico: string
  consultaId: number | null
  idPaciente: number | null
  idServico: number | undefined
  pendingObservacoes: PendingObservacoes
  dentesTratamento: Set<number>
  onVoltarConsulta: () => void
  onFinalizado: (idPaciente: number | null) => void
}

export default function FinalizarView({
  nomePaciente,
  nomeServico,
  consultaId,
  idPaciente,
  idServico,
  pendingObservacoes,
  dentesTratamento,
  onVoltarConsulta,
  onFinalizado,
}: Props) {
  const [carregando, setCarregando] = useState(false)
  const [mostrarEscolha, setMostrarEscolha] = useState(false)
  const [prontuarioId, setProntuarioId] = useState<number | null>(null)
  const [planoMaisRecente, setPlanoMaisRecente] = useState<Plano | null>(null)

  async function concluirFinalizacao() {
    if (consultaId) {
      try {
        await consultasService.atualizarStatus(consultaId, 'Encerrada')
      } catch {
        // não bloqueia a finalização — mesmo comportamento do original
      }
    }
    dispararSucesso('Consulta finalizada com sucesso.')
    onFinalizado(idPaciente)
  }

  async function confirmarFinalizacao() {
    if (!idPaciente) {
      await concluirFinalizacao()
      return
    }

    setCarregando(true)
    try {
      const prontuario = await prontuariosService.obterOuCriar(idPaciente)
      setProntuarioId(prontuario.id)

      const existentes = (await planosService.listarPorProntuario(prontuario.id)).sort((a, b) => b.id - a.id)

      if (existentes.length > 0) {
        setPlanoMaisRecente(existentes[0])
        setMostrarEscolha(true)
        setCarregando(false)
        return
      }

      await planosService.cadastrar({
        idProntuario: prontuario.id,
        idServico,
        condicao: pendingObservacoes.condicao ?? undefined,
        descricao: pendingObservacoes.descricao ?? undefined,
        observacao: pendingObservacoes.observacao ?? undefined,
        dente: pendingObservacoes.dente ?? undefined,
        status: 'Concluido',
      })
      await concluirFinalizacao()
    } catch {
      await concluirFinalizacao()
    } finally {
      setCarregando(false)
    }
  }

  async function atualizarUltimoRegistro() {
    if (planoMaisRecente) {
      try {
        await planosService.editar(planoMaisRecente.id, {
          idProntuario: planoMaisRecente.idProntuario,
          idServico: idServico ?? planoMaisRecente.idServico ?? undefined,
          condicao: pendingObservacoes.condicao || planoMaisRecente.condicao || undefined,
          descricao: pendingObservacoes.descricao || planoMaisRecente.descricao || undefined,
          observacao: pendingObservacoes.observacao || planoMaisRecente.observacao || undefined,
          dente: pendingObservacoes.dente || planoMaisRecente.dente || undefined,
          status: 'Concluido',
        })
      } catch {
        // segue mesmo em caso de erro — mesmo comportamento do original
      }
    }
    await concluirFinalizacao()
  }

  async function criarNovoRegistro() {
    if (prontuarioId) {
      try {
        await planosService.cadastrar({
          idProntuario: prontuarioId,
          idServico,
          condicao: pendingObservacoes.condicao ?? undefined,
          descricao: pendingObservacoes.descricao ?? undefined,
          observacao: pendingObservacoes.observacao ?? undefined,
          dente: pendingObservacoes.dente ?? undefined,
          status: 'Concluido',
        })
      } catch {
        // segue mesmo em caso de erro — mesmo comportamento do original
      }
    }
    await concluirFinalizacao()
  }

  return (
    <div className="finalizar-consulta-view">
      <div className="finalizar-header-row">
        <div className="finalizar-header-left">
          <div className="consulta-header-item">
            <span className="consulta-header-label">Paciente</span>
            <span className="consulta-header-nome">{nomePaciente}</span>
          </div>
          <div className="consulta-header-divider" />
          <div className="consulta-header-item">
            <span className="consulta-header-label">Serviço</span>
            <span className="consulta-header-servico">{nomeServico}</span>
          </div>
          <span className="finalizar-badge">
            <i className="fa-solid fa-circle-check fa-xs" /> Finalizando Consulta
          </span>
        </div>
      </div>

      <div className="finalizar-aviso-bar">
        <i className="fa-solid fa-circle-info" />
        Revise as informações abaixo antes de confirmar. As observações serão salvas no prontuário do paciente.
      </div>

      <div className="finalizar-layout row g-3">
        <div className="finalizar-main col-12 col-lg-8">
          <div className="finalizar-section bg-white border rounded p-3 shadow-sm">
            <h3 className="finalizar-section-titulo fw-bold mb-3 pb-2 border-bottom">Resumo da Consulta</h3>

            <div className="finalizar-odontograma mb-3">
              <h4 className="prontuario-sub-titulo fw-bold mb-2">Dentes Tratados</h4>
              <Odontograma
                prefixo="dente-finalizar"
                classeAtiva="tratado-consulta"
                numerosSelecionados={dentesTratamento}
                somenteLeitura
              />
              <div className="odontograma-legenda">
                <span className="legenda-item d-flex align-items-center gap-1 small">
                  <span className="legenda-cor tratado-consulta-bg" /> Tratado na Consulta
                </span>
              </div>
            </div>

            <div className="finalizar-detalhes-row row g-3">
              <div className="finalizar-detalhes-esq col-12 col-md-7">
                <div className="prontuario-campo mb-3">
                  <label className="prontuario-campo-label form-label small fw-semibold mb-1">Condição</label>
                  <div className="prontuario-campo-valor">{pendingObservacoes.condicao || '—'}</div>
                </div>
                <div className="prontuario-campo">
                  <label className="prontuario-campo-label form-label small fw-semibold mb-1">Planejamento do Tratamento</label>
                  <div className="prontuario-campo-textarea">{pendingObservacoes.descricao || '—'}</div>
                </div>
              </div>
              <div className="finalizar-detalhes-dir col-12 col-md-5">
                <div className="prontuario-obs-card rounded p-3 h-100 d-flex flex-column">
                  <h4 className="prontuario-obs-titulo fw-bold mb-2">Procedimento Realizado</h4>
                  <div className="prontuario-obs-texto small flex-grow-1">{pendingObservacoes.observacao || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="finalizar-sidebar col-12 col-lg-4">
          <div className="resumo-card bg-white border rounded p-3 shadow-sm mb-3">
            <h3 className="resumo-titulo fw-bold text-center mb-3 pb-3">Resumo do Paciente</h3>
            <div className="resumo-foto d-flex justify-content-center mb-3">
              <div className="foto-placeholder">
                <div className="foto-x" />
              </div>
            </div>
            <div className="resumo-paciente-info d-flex flex-column text-center mb-3">
              <span className="resumo-label-small">Nome</span>
              <span className="resumo-nome fw-bold">{nomePaciente}</span>
              <span className="resumo-label-small mt-2">Serviço</span>
              <span className="resumo-servico fw-semibold">{nomeServico}</span>
            </div>
            <div className="resumo-progresso-wrapper mb-3">
              <div className="resumo-progresso-header d-flex justify-content-between align-items-center mb-1">
                <span className="resumo-label-small">Progresso Atual</span>
                <span className="resumo-etapas">0 de 0 Etapas</span>
              </div>
              <div className="resumo-progresso-bar">
                <div className="resumo-progresso-fill" style={{ width: '0%' }} />
              </div>
            </div>
            <div className="resumo-etapas-info d-flex justify-content-between mb-3">
              <div className="resumo-etapa-item d-flex flex-column">
                <span className="resumo-label-small">Última etapa Feita</span>
                <span className="resumo-etapa-nome">—</span>
              </div>
              <div className="resumo-etapa-item text-end d-flex flex-column">
                <span className="resumo-label-small">Próxima Etapa</span>
                <span className="resumo-etapa-nome">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="finalizar-footer">
        <button className="btn-cancelar-finalizar btn btn-sm btn-outline-secondary" onClick={onVoltarConsulta}>
          <i className="fa-solid fa-arrow-left" /> Voltar à Consulta
        </button>
        <div className="finalizar-aviso-info">
          <i className="fa-solid fa-circle-info fa-xs" />
          Observações serão adicionadas ao prontuário
        </div>
        {!mostrarEscolha && (
          <button
            className="btn-confirmar-finalizar btn btn-sm btn-success"
            onClick={confirmarFinalizacao}
            disabled={carregando}
          >
            <i className="fa-solid fa-check" /> {carregando ? 'Aguarde…' : 'Confirmar Finalização'}
          </button>
        )}
      </div>

      {mostrarEscolha && (
        <div
          style={{
            display: 'flex',
            padding: '1rem 1.5rem',
            background: '#f0f4ff',
            borderTop: '1px solid #c7d2fe',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ flex: 1, minWidth: 200, fontSize: '0.88rem', color: '#374151' }}>
            <i className="fa-solid fa-file-circle-question me-1" style={{ color: '#6366f1' }} />
            Este paciente já possui registros no prontuário. O que deseja fazer?
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm px-3"
              style={{ background: '#eef2ff', color: '#3730a3', border: '1.5px solid #c7d2fe', borderRadius: 8, fontSize: '0.82rem' }}
              onClick={atualizarUltimoRegistro}
            >
              <i className="fa-solid fa-pen-to-square me-1" />
              Atualizar último registro
            </button>
            <button
              className="btn btn-sm px-3"
              style={{ background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', borderRadius: 8, fontSize: '0.82rem' }}
              onClick={criarNovoRegistro}
            >
              <i className="fa-solid fa-plus me-1" />
              Criar novo registro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
