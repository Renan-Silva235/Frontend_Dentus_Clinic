import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { AutocompletePaciente } from '../../../../componentes/AutocompletePaciente/AutocompletePaciente'
import type { EventoAgenda } from '../../../../componentes/CalendarioSemanal/tipos'
import {
  useAtualizarStatusConsulta,
  useCancelarConsulta,
  useConfirmarPresenca,
  useEditarConsulta,
  useRecusarPresenca,
} from '../../../../hooks/queries/consultas'
import { useServicosPorEspecialidade } from '../../../../hooks/queries/servicos'
import { formatarDataAgenda } from '../../../../utils/datasAgenda'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import { cores } from '../../../../styles/colors'
import type { Dentista, Paciente, Servico } from '../../../../types/dominio'

const CONFIRMACAO_LABEL: Record<string, { icone: string; cor: string; texto: string }> = {
  Pendente: { icone: 'fa-clock', cor: 'var(--cor-aviso, #b45309)', texto: 'Aguardando resposta' },
  Confirmada: { icone: 'fa-circle-check', cor: 'var(--cor-sucesso, #15803d)', texto: 'Confirmada pelo paciente' },
  Recusada: { icone: 'fa-circle-xmark', cor: 'var(--cor-perigo, #b91c1c)', texto: 'Recusada pelo paciente' },
}

const STATUS_LABEL: Record<string, { classe: string; texto: string }> = {
  Agendada: { classe: 'status-agendada', texto: 'Agendada' },
  Aguardando: { classe: 'status-em-fila', texto: 'Em Fila' },
  'Em Consulta': { classe: 'status-em-consulta', texto: 'Em Consulta' },
  Encerrada: { classe: 'status-encerrada', texto: 'Encerrada' },
  Cancelada: { classe: 'status-cancelada', texto: 'Cancelada' },
}

type View = 'info' | 'cancelar' | 'editar'

interface Props {
  evento: EventoAgenda | null
  dentistas: Dentista[]
  pacientes: Paciente[]
  servicosGerais: Servico[]
  onFechar: () => void
}

export function ModalDetalheConsulta({ evento, dentistas, pacientes, servicosGerais, onFechar }: Props) {
  const [view, setView] = useState<View>('info')

  const [editPacienteId, setEditPacienteId] = useState<number | null>(null)
  const [editDentistaId, setEditDentistaId] = useState<number | null>(null)
  const [editData, setEditData] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editServicoId, setEditServicoId] = useState('')
  const [editRetorno, setEditRetorno] = useState(false)

  const atualizarStatus = useAtualizarStatusConsulta()
  const cancelar = useCancelarConsulta()
  const editar = useEditarConsulta()
  const confirmarPresenca = useConfirmarPresenca()
  const recusarPresenca = useRecusarPresenca()

  async function responderPorPaciente(resposta: 'confirmar' | 'recusar') {
    if (!evento) return

    try {
      if (resposta === 'confirmar') {
        await confirmarPresenca.mutateAsync(evento.id)
        dispararSucesso('Presença confirmada.')
      } else {
        await recusarPresenca.mutateAsync(evento.id)
        dispararSucesso('Consulta recusada e cancelada.')
      }
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  const dentistaEdicao = dentistas.find((d) => d.id === editDentistaId)
  const { data: servicosPorEspecialidade } = useServicosPorEspecialidade(dentistaEdicao?.idEspecialidade)
  const servicosEdicao =
    dentistaEdicao?.idEspecialidade && servicosPorEspecialidade ? servicosPorEspecialidade : servicosGerais

  useEffect(() => {
    if (evento) {
      setView('info')
      setEditPacienteId(evento.idPaciente)
      setEditDentistaId(evento.idDentista)
      setEditData(evento.data)
      setEditHora(evento.hora)
      setEditServicoId(evento.idServico ? String(evento.idServico) : '')
      setEditRetorno(evento.retorno)
    }
  }, [evento])

  function fechar() {
    onFechar()
  }

  async function marcarChegou() {
    if (!evento) return
    try {
      await atualizarStatus.mutateAsync({ id: evento.id, status: 'Aguardando' })
      dispararSucesso('Paciente marcado como aguardando.')
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  async function confirmarCancelar() {
    if (!evento) return
    try {
      await cancelar.mutateAsync(evento.id)
      dispararSucesso('Consulta cancelada com sucesso.')
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  async function confirmarEdicao() {
    if (!evento) return

    if (!editPacienteId) return dispararErros('Selecione um paciente na lista.')
    if (!editDentistaId) return dispararErros('Selecione um dentista.')
    if (!editData) return dispararErros('Informe a data.')
    if (!editHora) return dispararErros('Informe o horário.')

    try {
      await editar.mutateAsync({
        id: evento.id,
        dados: {
          idPaciente: editPacienteId,
          idDentista: editDentistaId,
          dataConsulta: editData,
          horaConsulta: `${editHora}:00`,
          idServico: editServicoId ? Number(editServicoId) : undefined,
          retorno: editRetorno,
        },
      })
      dispararSucesso('Consulta atualizada com sucesso.')
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  const editavel = evento ? !['Encerrada', 'Cancelada'].includes(evento.status) : false
  const status = evento ? STATUS_LABEL[evento.status] ?? { classe: '', texto: evento.status } : null
  const confirmacao = CONFIRMACAO_LABEL[evento?.statusConfirmacao ?? 'Pendente'] ?? CONFIRMACAO_LABEL.Pendente

  return (
    <Modal show={evento !== null} onHide={fechar} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          <i className="fa-solid fa-calendar-check me-2" />
          Detalhes da Consulta
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        {view === 'info' && evento && (
          <div>
            <div className="detalhe-grid">
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-user fa-fw" /> Paciente
                </span>
                <span className="detalhe-valor">{evento.nomePaciente}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-user-doctor fa-fw" /> Dentista
                </span>
                <span className="detalhe-valor">{evento.nomeDentista}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-calendar fa-fw" /> Data
                </span>
                <span className="detalhe-valor">{formatarDataAgenda(evento.data)}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-clock fa-fw" /> Horário
                </span>
                <span className="detalhe-valor">{evento.hora}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-tooth fa-fw" /> Serviço
                </span>
                <span className="detalhe-valor">{evento.nomeServico}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-circle-info fa-fw" /> Status
                </span>
                <span className="detalhe-valor">
                  <span className={`status-badge ${status?.classe}`}>{status?.texto}</span>
                </span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">
                  <i className="fa-solid fa-mobile-screen fa-fw" /> Confirmação
                </span>
                <span className="detalhe-valor" style={{ color: confirmacao.cor }}>
                  <i className={`fa-solid ${confirmacao.icone} me-1`} />
                  {confirmacao.texto}
                </span>
              </div>
            </div>
            {/* O paciente responde pelo aplicativo, mas muita gente liga para a
                clínica: aqui a recepção registra a resposta por ele. */}
            {editavel && evento.statusConfirmacao === 'Pendente' && (
              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                <span className="text-muted small">Registrar resposta do paciente:</span>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{ background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0' }}
                  onClick={() => responderPorPaciente('confirmar')}
                  disabled={confirmarPresenca.isPending || recusarPresenca.isPending}
                >
                  <i className="fa-solid fa-circle-check me-1" />
                  Confirmou
                </button>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{ background: 'var(--cor-perigo-fundo)', color: 'var(--cor-perigo)', border: '1.5px solid #fca5a5' }}
                  onClick={() => responderPorPaciente('recusar')}
                  disabled={confirmarPresenca.isPending || recusarPresenca.isPending}
                >
                  <i className="fa-solid fa-circle-xmark me-1" />
                  Recusou
                </button>
              </div>
            )}
            {evento.retorno && (
              <div className="mt-2">
                <span className="badge-retorno">
                  <i className="fa-solid fa-rotate-left me-1" />
                  Retorno
                </span>
              </div>
            )}
            <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top flex-wrap">
              <button type="button" className="btn px-3 text-dark bg-white border" onClick={fechar}>
                Fechar
              </button>
              {editavel && (
                <button
                  type="button"
                  className="btn px-3"
                  style={{ background: 'var(--cor-perigo-fundo)', color: 'var(--cor-perigo)', border: '1.5px solid #fca5a5' }}
                  onClick={() => setView('cancelar')}
                >
                  <i className="fa-solid fa-ban me-1" />
                  Cancelar Consulta
                </button>
              )}
              {evento.status === 'Agendada' && (
                <button
                  type="button"
                  className="btn px-3"
                  style={{
                    background: cores.statusConsulta.aguardando.solido,
                    borderColor: cores.statusConsulta.aguardando.solido,
                    color: '#fff',
                  }}
                  onClick={marcarChegou}
                  disabled={atualizarStatus.isPending}
                >
                  <i className="fa-solid fa-person-walking-arrow-right me-1" />
                  Paciente Chegou
                </button>
              )}
              {editavel && (
                <button
                  type="button"
                  className="btn px-3 text-white"
                  style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
                  onClick={() => setView('editar')}
                >
                  <i className="fa-solid fa-pen me-1" />
                  Editar
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'cancelar' && (
          <div>
            <div
              className="alert py-2 mb-3"
              style={{ background: '#fff3e0', border: '1px solid #ffd180', color: '#e65100', fontSize: '0.88rem' }}
            >
              <i className="fa-solid fa-triangle-exclamation me-1" />
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
            </div>
            <div className="d-flex gap-2 justify-content-end mt-3 pt-3 border-top">
              <button type="button" className="btn px-3 text-dark bg-white border" onClick={() => setView('info')}>
                <i className="fa-solid fa-arrow-left me-1" />
                Voltar
              </button>
              <button
                type="button"
                className="btn px-3 text-white"
                style={{ backgroundColor: 'var(--cor-perigo)', borderColor: 'var(--cor-perigo)' }}
                onClick={confirmarCancelar}
                disabled={cancelar.isPending}
              >
                <i className="fa-solid fa-ban me-1" />
                {cancelar.isPending ? 'Cancelando…' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        )}

        {view === 'editar' && evento && (
          <div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                Paciente <span className="text-danger">*</span>
              </label>
              <AutocompletePaciente
                pacientes={pacientes}
                valorInicial={evento.nomePaciente}
                placeholder="Nome do paciente..."
                onSelecionar={(p) => setEditPacienteId(p.id)}
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Dentista <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={editDentistaId ?? ''}
                  onChange={(e) => setEditDentistaId(Number(e.target.value))}
                >
                  {dentistas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Data <span className="text-danger">*</span>
                </label>
                <input type="date" className="form-control" value={editData} onChange={(e) => setEditData(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Horário <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className="form-control"
                  step={1800}
                  value={editHora}
                  onChange={(e) => setEditHora(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                Serviço
              </label>
              <select className="form-select" value={editServicoId} onChange={(e) => setEditServicoId(e.target.value)}>
                <option value="">Nenhum</option>
                {servicosEdicao.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="editRetorno"
                  checked={editRetorno}
                  onChange={(e) => setEditRetorno(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="editRetorno" style={{ fontSize: '0.88rem' }}>
                  É uma consulta de retorno?
                </label>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end pt-3 border-top">
              <button type="button" className="btn px-3 text-dark bg-white border" onClick={() => setView('info')}>
                <i className="fa-solid fa-arrow-left me-1" />
                Voltar
              </button>
              <button
                type="button"
                className="btn px-3 text-white"
                style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
                onClick={confirmarEdicao}
                disabled={editar.isPending}
              >
                <i className="fa-solid fa-floppy-disk me-1" />
                {editar.isPending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}
