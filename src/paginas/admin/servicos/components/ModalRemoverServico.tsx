import { ModalConfirmacao } from '../../../../componentes/ModalConfirmacao/ModalConfirmacao'
import { useRemoverServico } from '../../../../hooks/queries/servicos'
import { dispararErroApi, dispararSucesso } from '../../../../utils/toastErros'
import type { ServicoComEspecialidade } from '../index'

interface Props {
  servico: ServicoComEspecialidade | null
  onFechar: () => void
}

export function ModalRemoverServico({ servico, onFechar }: Props) {
  const remover = useRemoverServico()

  async function confirmar() {
    if (!servico) return
    try {
      await remover.mutateAsync(servico.id)
      dispararSucesso('Serviço removido com sucesso.')
      onFechar()
    } catch (erro) {
      dispararErroApi(erro)
    }
  }

  return (
    <ModalConfirmacao
      aberto={servico !== null}
      titulo="Remover Serviço"
      icone="bi bi-trash"
      textoBotaoConfirmar="Remover"
      carregando={remover.isPending}
      onCancelar={onFechar}
      onConfirmar={confirmar}
    >
      <p className="fw-semibold mb-1">Tem certeza que deseja remover este serviço?</p>
      <small className="text-muted d-block mb-3">Essa ação não pode ser revertida</small>
      {servico && (
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <div>
            Nome: <strong>{servico.nome}</strong>
          </div>
          <div>Especialidade: {servico.nomeEspecialidade}</div>
        </div>
      )}
    </ModalConfirmacao>
  )
}
