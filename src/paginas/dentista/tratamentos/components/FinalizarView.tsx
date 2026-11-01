import { useState } from 'react'
import { Odontograma } from '../../../../componentes/Odontograma/Odontograma'
import { prontuariosService } from '../../../../services/prontuariosService'
import { planosService } from '../../../../services/planosService'
import { consultasService } from '../../../../services/consultasService'
import { dispararSucesso } from '../../../../utils/toastErros'

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

      // Cada finalização gera o seu próprio registro no prontuário. Não existe
      // opção de alterar um registro anterior: prontuário é documento clínico,
      // e o que já foi registrado não se mexe.
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
        <button
          className="btn-confirmar-finalizar btn btn-sm btn-success"
          onClick={confirmarFinalizacao}
          disabled={carregando}
        >
          <i className="fa-solid fa-check" /> {carregando ? 'Aguarde…' : 'Confirmar Finalização'}
        </button>
      </div>

    </div>
  )
}
