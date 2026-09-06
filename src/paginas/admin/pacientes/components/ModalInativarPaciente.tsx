import { ModalConfirmacao } from '../../../../componentes/ModalConfirmacao/ModalConfirmacao'
import { useInativarPaciente } from '../../../../hooks/queries/pacientes'
import { mascararCpfParcial, formatarDataBr } from '../../../../utils/formatadores'
import type { Paciente } from '../../../../types/dominio'
import { dispararErroApi, dispararSucesso } from '../../../../utils/toastErros'

interface Props {
  paciente: Paciente | null
  onFechar: () => void
}

export function ModalInativarPaciente({ paciente, onFechar }: Props) {
  const inativar = useInativarPaciente()

  async function confirmar() {
    if (!paciente) return
    try {
      await inativar.mutateAsync(paciente.id)
      dispararSucesso('Paciente inativado com sucesso.')
      onFechar()
    } catch (erro) {
      dispararErroApi(erro)
    }
  }

  return (
    <ModalConfirmacao
      aberto={paciente !== null}
      titulo="Inativar Paciente"
      icone="fa-solid fa-trash"
      textoBotaoConfirmar="INATIVAR"
      carregando={inativar.isPending}
      onCancelar={onFechar}
      onConfirmar={confirmar}
    >
      <p className="fw-semibold mb-1">Tem certeza que deseja inativar este paciente?</p>
      <small className="text-muted d-block mb-3">O paciente não aparecerá mais nas listagens</small>
      {paciente && (
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <div>Nome: {paciente.nome}</div>
          <div>CPF: {mascararCpfParcial(paciente.cpf)}</div>
          <div>Celular: {paciente.telefone || '—'}</div>
          <div>Data Cadastral: {formatarDataBr(paciente.dataNascimento)}</div>
        </div>
      )}
    </ModalConfirmacao>
  )
}
