import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useEditarFuncionario } from '../../../../hooks/queries/funcionarios'
import { useEditarDentista } from '../../../../hooks/queries/dentistas'
import { aplicarMascaraTelefoneProgressiva } from '../../../../utils/formatadores'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import type { PessoaEquipe } from '../tipos'

type Campo = 'email' | 'telefone'

interface Props {
  pessoa: PessoaEquipe | null
  campo: Campo | null
  onFechar: () => void
  onSalvo: (campo: Campo, valor: string) => void
}

export function ModalEditarCampo({ pessoa, campo, onFechar, onSalvo }: Props) {
  const [etapa, setEtapa] = useState<'editar' | 'confirmar'>('editar')
  const [valor, setValor] = useState('')
  const editarFuncionario = useEditarFuncionario()
  const editarDentista = useEditarDentista()

  const carregando = editarFuncionario.isPending || editarDentista.isPending
  const isEmail = campo === 'email'

  useEffect(() => {
    if (campo) {
      setEtapa('editar')
      setValor('')
    }
  }, [campo, pessoa])

  function fechar() {
    onFechar()
  }

  function avancar() {
    if (isEmail) {
      if (!valor.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) {
        dispararErros('Informe um e-mail válido.')
        return
      }
    } else {
      const digitos = valor.replace(/\D/g, '')
      if (digitos.length < 10 || digitos.length > 11) {
        dispararErros('Informe um telefone válido (10 ou 11 dígitos).')
        return
      }
    }
    setEtapa('confirmar')
  }

  async function salvar() {
    if (!pessoa || !campo) return
    try {
      const valorParaApi = isEmail ? valor.trim() : valor.replace(/\D/g, '')
      const dados = { [campo]: valorParaApi }
      if (pessoa.tipo === 'dentista') {
        await editarDentista.mutateAsync({ id: pessoa.id, dados })
      } else {
        await editarFuncionario.mutateAsync({ id: pessoa.id, dados })
      }
      dispararSucesso(isEmail ? 'E-mail atualizado com sucesso.' : 'Telefone atualizado com sucesso.')
      onSalvo(campo, valor.trim())
    } catch (e) {
      dispararErroApi(e)
      setEtapa('editar')
    }
  }

  return (
    <Modal show={campo !== null} onHide={fechar} centered backdrop="static" size="sm">
      {etapa === 'editar' ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title className="fs-6">{isEmail ? 'Editar E-mail' : 'Editar Telefone'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">{isEmail ? 'Novo e-mail' : 'Novo telefone'}</label>
              <input
                type={isEmail ? 'email' : 'tel'}
                className="form-control"
                placeholder={isEmail ? 'ex: nome@email.com' : 'ex: (11) 99999-9999'}
                value={valor}
                onChange={(e) => setValor(isEmail ? e.target.value : aplicarMascaraTelefoneProgressiva(e.target.value))}
              />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn px-4 text-dark bg-white border" onClick={fechar}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn px-4 text-white"
                style={{ backgroundColor: 'var(--cor-perigo)', borderColor: 'var(--cor-perigo)' }}
                onClick={avancar}
              >
                Continuar
              </button>
            </div>
          </Modal.Body>
        </>
      ) : (
        <>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">Confirmar Alteração</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-3">
            <div className="mb-3">
              <i className="fa-solid fa-pen-to-square fa-2x text-primary" />
            </div>
            <p className="mb-1">
              Deseja alterar <strong>{isEmail ? 'e-mail' : 'telefone'}</strong> para:
            </p>
            <p className="fw-semibold text-break">{valor}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 justify-content-center gap-2">
            <button type="button" className="btn px-4 text-dark bg-white border" onClick={fechar} disabled={carregando}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn px-4 text-white"
              style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
              onClick={salvar}
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Confirmar'}
            </button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}
