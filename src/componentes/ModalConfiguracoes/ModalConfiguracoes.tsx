import { Modal } from 'react-bootstrap'
import { useTema } from '../../contexts/TemaContext'
import './ModalConfiguracoes.css'

interface Props {
  aberto: boolean
  onFechar: () => void
}

export function ModalConfiguracoes({ aberto, onFechar }: Props) {
  const { modoEscuro, alternarModoEscuro } = useTema()

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="fa-solid fa-gear me-2" />
          Configurações
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-info">
              <span className="settings-label">Modo Escuro</span>
            </div>
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={modoEscuro}
                onChange={(e) => alternarModoEscuro(e.target.checked)}
              />
            </div>
          </div>
          <div className="settings-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            <div className="settings-info">
              <span className="settings-label">Notificações Desktop</span>
              <span className="settings-desc">Em breve</span>
            </div>
            <div className="form-check form-switch m-0">
              <input className="form-check-input" type="checkbox" disabled />
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
