import { Modal } from 'react-bootstrap'
import type { ReactNode } from 'react'

interface Props {
  aberto: boolean
  titulo: string
  icone?: string
  corIcone?: string
  corBotaoConfirmar?: string
  textoBotaoConfirmar?: string
  carregando?: boolean
  onCancelar: () => void
  onConfirmar: () => void
  children: ReactNode
}

/**
 * Modal de confirmação genérico — reproduz o padrão visual repetido no
 * Frontend original (logout, inativar funcionário/paciente, remover
 * serviço, cancelar consulta). Ver docs/migracao-react/02-analise-frontend.md §3.
 */
export function ModalConfirmacao({
  aberto,
  titulo,
  icone = 'fa-solid fa-triangle-exclamation',
  corIcone = 'var(--cor-perigo)',
  corBotaoConfirmar = 'var(--cor-perigo)',
  textoBotaoConfirmar = 'Confirmar',
  carregando = false,
  onCancelar,
  onConfirmar,
  children,
}: Props) {
  return (
    <Modal show={aberto} onHide={onCancelar} centered size="sm" backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-3">
        <div className="mb-3">
          <i className={icone} style={{ fontSize: '2rem', color: corIcone }} />
        </div>
        {children}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 justify-content-center gap-2">
        <button type="button" className="btn px-4 btn-cancelar-logout" onClick={onCancelar} disabled={carregando}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn px-4 text-white"
          style={{ backgroundColor: corBotaoConfirmar, borderColor: corBotaoConfirmar }}
          onClick={onConfirmar}
          disabled={carregando}
        >
          {carregando ? 'Aguarde…' : textoBotaoConfirmar}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
