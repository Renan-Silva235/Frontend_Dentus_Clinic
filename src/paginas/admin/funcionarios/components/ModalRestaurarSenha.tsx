import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useEditarFuncionario } from '../../../../hooks/queries/funcionarios'
import { useEditarDentista } from '../../../../hooks/queries/dentistas'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import type { PessoaEquipe } from '../tipos'

interface Props {
  pessoa: PessoaEquipe | null
  onFechar: () => void
}

export function ModalRestaurarSenha({ pessoa, onFechar }: Props) {
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const editarFuncionario = useEditarFuncionario()
  const editarDentista = useEditarDentista()

  const carregando = editarFuncionario.isPending || editarDentista.isPending

  function fechar() {
    setSenha('')
    onFechar()
  }

  async function confirmar() {
    if (!pessoa) return

    if (!senha.trim() || senha.trim().length < 6) {
      dispararErros('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    try {
      if (pessoa.tipo === 'dentista') {
        await editarDentista.mutateAsync({ id: pessoa.id, dados: { senha: senha.trim() } })
      } else {
        await editarFuncionario.mutateAsync({ id: pessoa.id, dados: { senha: senha.trim() } })
      }
      dispararSucesso('Senha restaurada com sucesso.')
      fechar()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  return (
    <Modal show={pessoa !== null} onHide={fechar} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">Restaurar Senha</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">Nova Senha</label>
          <div className="input-group">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              className="form-control"
              placeholder="Digite a nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setMostrarSenha((v) => !v)}>
              <i className={`fa-solid ${mostrarSenha ? 'fa-eye' : 'fa-eye-slash'}`} />
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={fechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn text-white px-4"
            style={{ backgroundColor: 'var(--cor-primaria)', borderColor: 'var(--cor-primaria)' }}
            onClick={confirmar}
            disabled={carregando}
          >
            {carregando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
