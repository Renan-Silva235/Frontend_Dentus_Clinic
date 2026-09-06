import { Modal } from 'react-bootstrap'
import { useState } from 'react'
import type { Especialidade } from '../../../../types/dominio'
import { useCadastrarServico } from '../../../../hooks/queries/servicos'
import { validarObrigatorio } from '../../../../utils/validadores'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'

interface Props {
  aberto: boolean
  especialidades: Especialidade[]
  onFechar: () => void
}

export function ModalCadastrarServico({ aberto, especialidades, onFechar }: Props) {
  const [nome, setNome] = useState('')
  const [idEspecialidade, setIdEspecialidade] = useState('')
  const cadastrar = useCadastrarServico()

  function fecharEResetar() {
    setNome('')
    setIdEspecialidade('')
    onFechar()
  }

  async function confirmar() {
    const erroNome = validarObrigatorio(nome, 'Informe o nome do serviço.')
    const erroEspecialidade = validarObrigatorio(idEspecialidade, 'Selecione uma especialidade.')

    const mensagens = [erroNome, erroEspecialidade].filter(Boolean) as string[]
    if (mensagens.length > 0) {
      dispararErros(mensagens)
      return
    }

    try {
      await cadastrar.mutateAsync({ nome: nome.trim(), idEspecialidade: Number(idEspecialidade) })
      dispararSucesso('Serviço cadastrado com sucesso.')
      fecharEResetar()
    } catch (erro) {
      dispararErroApi(erro)
    }
  }

  return (
    <Modal show={aberto} onHide={fecharEResetar} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Cadastrar Serviço</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pt-3 pb-2">
        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
            Nome do serviço
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Limpeza, Clareamento..."
            maxLength={100}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
            Especialidade
          </label>
          <select
            className="form-select"
            value={idEspecialidade}
            onChange={(e) => setIdEspecialidade(e.target.value)}
          >
            <option value="">Selecione uma especialidade...</option>
            {especialidades.map((especialidade) => (
              <option key={especialidade.id} value={especialidade.id}>
                {especialidade.nome}
              </option>
            ))}
          </select>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-1 pb-3 justify-content-center gap-2">
        <button type="button" className="btn px-4 text-dark bg-white border" onClick={fecharEResetar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn px-4 text-white"
          style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
          onClick={confirmar}
          disabled={cadastrar.isPending}
        >
          {cadastrar.isPending ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
