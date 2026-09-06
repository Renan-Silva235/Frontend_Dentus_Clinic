import { ModalConfirmacao } from '../../../../componentes/ModalConfirmacao/ModalConfirmacao'
import { useRemoverFuncionario } from '../../../../hooks/queries/funcionarios'
import { useRemoverDentista } from '../../../../hooks/queries/dentistas'
import { dispararErroApi, dispararSucesso } from '../../../../utils/toastErros'
import type { PessoaEquipe } from '../tipos'

interface Props {
  pessoa: PessoaEquipe | null
  onFechar: () => void
  onInativado: () => void
}

export function ModalInativarFuncionario({ pessoa, onFechar, onInativado }: Props) {
  const removerFuncionario = useRemoverFuncionario()
  const removerDentista = useRemoverDentista()

  const carregando = removerFuncionario.isPending || removerDentista.isPending

  async function confirmar() {
    if (!pessoa) return
    try {
      // Corrige um bug do Frontend original: a inativação sempre chamava o
      // endpoint de funcionário mesmo para dentistas (ver decisão registrada
      // em docs/migracao-react/03-cruzamento-e-inconsistencias.md, item 1).
      if (pessoa.tipo === 'dentista') {
        await removerDentista.mutateAsync(pessoa.id)
      } else {
        await removerFuncionario.mutateAsync(pessoa.id)
      }
      dispararSucesso('Funcionário inativado com sucesso.')
      onInativado()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  return (
    <ModalConfirmacao
      aberto={pessoa !== null}
      titulo="Inativar Funcionário"
      icone="fa-solid fa-user-slash"
      textoBotaoConfirmar="INATIVAR"
      carregando={carregando}
      onCancelar={onFechar}
      onConfirmar={confirmar}
    >
      <p className="fw-semibold mb-1">Tem certeza que deseja inativar este funcionário?</p>
      <small className="text-muted d-block">O funcionário não aparecerá mais nas listagens</small>
    </ModalConfirmacao>
  )
}
