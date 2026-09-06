import { Odontograma } from '../../../../componentes/Odontograma/Odontograma'

interface Props {
  nomePaciente: string
  nomeServico: string
  condicao: string
  descricao: string
  observacao: string
  dentesTratamento: Set<number>
  onCondicaoChange: (v: string) => void
  onDescricaoChange: (v: string) => void
  onObservacaoChange: (v: string) => void
  onToggleDente: (numero: number) => void
  onSelecionarTodos: (marcado: boolean) => void
  onAbrirProntuario: () => void
  onFinalizarConsulta: () => void
}

const TODOS_DENTES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35,
  36, 37, 38,
]

export function ConsultaView({
  nomePaciente,
  nomeServico,
  condicao,
  descricao,
  observacao,
  dentesTratamento,
  onCondicaoChange,
  onDescricaoChange,
  onObservacaoChange,
  onToggleDente,
  onSelecionarTodos,
  onAbrirProntuario,
  onFinalizarConsulta,
}: Props) {
  const todosSelecionados = TODOS_DENTES.every((n) => dentesTratamento.has(n))

  return (
    <div className="consulta-view">
      <div className="consulta-header-row">
        <div className="consulta-header-left">
          <div className="consulta-header-item">
            <span className="consulta-header-label">Paciente</span>
            <span className="consulta-header-nome">{nomePaciente}</span>
          </div>
          <div className="consulta-header-divider" />
          <div className="consulta-header-item">
            <span className="consulta-header-label">Serviço</span>
            <span className="consulta-header-servico">{nomeServico}</span>
          </div>
          <span className="consulta-badge-atendimento">
            <i className="fa-solid fa-circle fa-xs" /> Em Atendimento
          </span>
        </div>
      </div>

      <div className="consulta-layout row g-3">
        <div className="consulta-main col-12 col-lg-8">
          <div className="consulta-odontograma-section bg-white border rounded p-3 shadow-sm mb-3">
            <div className="consulta-odontograma-header d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="odontograma-titulo fw-bold mb-1" style={{ textAlign: 'left' }}>
                  Odontograma
                </h3>
                <p className="consulta-odontograma-sub small text-muted mb-0">Selecione o dente que fez planejamento</p>
              </div>
              <label className="consulta-selecionar-todos d-flex align-items-center gap-2 small fw-semibold">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={(e) => onSelecionarTodos(e.target.checked)}
                />
                Selecionar Todos
              </label>
            </div>

            <Odontograma
              prefixo="dente-consulta"
              classeAtiva="tratamento"
              numerosSelecionados={dentesTratamento}
              onToggle={onToggleDente}
            />

            <div className="odontograma-legenda">
              <span className="legenda-item d-flex align-items-center gap-1 small">
                <span className="legenda-cor tratamento-bg" /> Em Tratamento
              </span>
            </div>
          </div>

          <div className="consulta-campos-row row g-3">
            <div className="consulta-condicao-col consulta-campo-card col-12 bg-white border rounded p-3 shadow-sm">
              <h4 className="consulta-campo-card-titulo fw-bold mb-3 small text-uppercase">
                <i className="fa-solid fa-tooth fa-xs" /> Diagnóstico
              </h4>
              <div className="consulta-campo mb-3">
                <label className="consulta-campo-label form-label small fw-semibold">Condição</label>
                <input
                  type="text"
                  className="consulta-campo-input form-control"
                  placeholder="Ex: Cárie profunda..."
                  value={condicao}
                  onChange={(e) => onCondicaoChange(e.target.value)}
                />
              </div>
              <div className="consulta-campo">
                <label className="consulta-campo-label form-label small fw-semibold">Planejamento do Tratamento</label>
                <textarea
                  className="consulta-campo-textarea form-control"
                  placeholder="Descreva o tratamento realizado..."
                  value={descricao}
                  onChange={(e) => onDescricaoChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="consulta-sidebar col-12 col-lg-4">
          <div className="observacoes-card bg-white border rounded p-3 h-100 d-flex flex-column">
            <h4 className="observacoes-titulo fw-bold mb-2">Procedimento Realizado</h4>
            <textarea
              className="observacoes-textarea form-control flex-grow-1"
              placeholder="Descreva o procedimento realizado..."
              value={observacao}
              onChange={(e) => onObservacaoChange(e.target.value)}
            />
            <p className="observacoes-aviso small text-muted mt-2 mb-0">
              essas informações serão adicionadas ao prontuário ao encerrar a consulta
            </p>
          </div>
        </div>
      </div>

      <div className="consulta-footer">
        <button className="btn-prontuario-footer btn btn-sm btn-outline-secondary" onClick={onAbrirProntuario}>
          <i className="fa-regular fa-eye" /> Prontuário
        </button>
        <button className="btn-finalizar-consulta btn btn-sm btn-success" onClick={onFinalizarConsulta}>
          <i className="fa-solid fa-check" /> Finalizar Consulta
        </button>
      </div>
    </div>
  )
}
