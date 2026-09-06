import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useEditarPaciente } from '../../../../hooks/queries/pacientes'
import { aplicarMascaraTelefoneProgressiva } from '../../../../utils/formatadores'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import type { Paciente } from '../../../../types/dominio'

interface Props {
  paciente: Paciente | null
  onFechar: () => void
}

export function ModalEditarPaciente({ paciente, onFechar }: Props) {
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const editar = useEditarPaciente()

  useEffect(() => {
    if (paciente) {
      setTelefone(paciente.telefone || '')
      setEmail(paciente.email || '')
    }
  }, [paciente])

  async function confirmar() {
    if (!paciente) return

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      dispararErros('Informe um e-mail válido.')
      setEmail('')
      return
    }

    try {
      await editar.mutateAsync({
        id: paciente.id,
        dados: {
          telefone: telefone.replace(/\D/g, '') || undefined,
          email: email.trim() || undefined,
        },
      })
      dispararSucesso('Paciente atualizado com sucesso.')
      onFechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  return (
    <Modal show={paciente !== null} onHide={onFechar} centered scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          <i className="fa-solid fa-pen me-2" />
          Editar Paciente
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-2">
        <div className="mb-3">
          <label className="form-label fw-semibold">Celular</label>
          <input
            type="text"
            className="form-control"
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={telefone}
            onChange={(e) => setTelefone(aplicarMascaraTelefoneProgressiva(e.target.value))}
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">E-mail</label>
          <input
            type="email"
            className="form-control"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 gap-2">
        <button type="button" className="btn px-4 text-dark bg-white border" onClick={onFechar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn px-4 text-white"
          style={{ backgroundColor: 'var(--cor-acao-primaria)' }}
          onClick={confirmar}
          disabled={editar.isPending}
        >
          {editar.isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
