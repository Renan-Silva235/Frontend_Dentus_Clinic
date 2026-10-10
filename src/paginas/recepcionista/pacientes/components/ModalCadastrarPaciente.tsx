import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useCadastrarPaciente } from '../../../../hooks/queries/pacientes'
import { useFormValidation, type RegrasValidacao } from '../../../../hooks/useFormValidation'
import { aplicarMascaraCpfProgressiva, aplicarMascaraTelefoneProgressiva } from '../../../../utils/formatadores'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import { validarCpf, validarDataPassada, validarEmail, validarNome } from '../../../../utils/validadores'

interface Props {
  aberto: boolean
  onFechar: () => void
}

interface FormularioPaciente {
  nome: string
  cpf: string
  telefone: string
  email: string
  dataNascimento: string
  endereco: string
}

const valoresIniciais: FormularioPaciente = { nome: '', cpf: '', telefone: '', email: '', dataNascimento: '', endereco: '' }

const REGRAS: RegrasValidacao<FormularioPaciente> = {
  nome: (valor) => validarNome(valor),
  cpf: (valor) => validarCpf(valor),
  email: (valor) => validarEmail(valor),
  dataNascimento: (valor) => validarDataPassada(valor),
}

export function ModalCadastrarPaciente({ aberto, onFechar }: Props) {
  const { valores, definirValor, validar, resetar } = useFormValidation(valoresIniciais, REGRAS)
  const cadastrar = useCadastrarPaciente()
  const [senhaTemporaria, setSenhaTemporaria] = useState<string | null>(null)

  function fechar() {
    resetar()
    setSenhaTemporaria(null)
    onFechar()
  }

  async function confirmar() {
    const { valido, mensagens } = validar()
    if (!valido) {
      dispararErros(mensagens)
      return
    }

    try {
      const paciente = await cadastrar.mutateAsync({
        nome: valores.nome.trim(),
        cpf: valores.cpf.replace(/\D/g, ''),
        telefone: valores.telefone.replace(/\D/g, ''),
        email: valores.email.trim(),
        dataNascimento: valores.dataNascimento,
        endereco: valores.endereco.trim(),
      })
      dispararSucesso('Paciente cadastrado com sucesso.')

      // A senha só aparece nesta resposta: sem exibi-la, a recepcionista não
      // tem como informar ao paciente qual é o acesso dele.
      if (paciente.senhaTemporaria) {
        setSenhaTemporaria(paciente.senhaTemporaria)
        return
      }
      fechar()
    } catch (erro) {
      dispararErroApi(erro)
    }
  }

  async function copiarSenha() {
    if (!senhaTemporaria) return
    try {
      await navigator.clipboard.writeText(senhaTemporaria)
      dispararSucesso('Senha copiada.')
    } catch {
      dispararErros('Não foi possível copiar. Anote a senha manualmente.')
    }
  }

  return (
    <Modal show={aberto} onHide={fechar} centered scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          <i className={`fa-solid me-2 ${senhaTemporaria ? 'fa-circle-check' : 'fa-user-plus'}`} />
          {senhaTemporaria ? 'Paciente Cadastrado' : 'Cadastrar Paciente'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-2">
        {senhaTemporaria ? (
          <div className="text-center py-2">
            <p className="mb-3">
              Informe esta senha ao paciente para o primeiro acesso ao aplicativo:
            </p>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <code className="fs-4 px-3 py-2 bg-light border rounded user-select-all">{senhaTemporaria}</code>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={copiarSenha}
                title="Copiar senha"
              >
                <i className="fa-regular fa-copy" />
              </button>
            </div>
            <p className="text-muted small mb-0">
              Ao entrar com ela, o paciente define a senha dele. Esta senha não
              aparece novamente — se for perdida, cadastre uma nova pelo painel.
            </p>
          </div>
        ) : (
        <>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Nome completo <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Nome do paciente"
            value={valores.nome}
            onChange={(e) => definirValor('nome', e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            CPF <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="000.000.000-00"
            maxLength={14}
            value={valores.cpf}
            onChange={(e) => definirValor('cpf', aplicarMascaraCpfProgressiva(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Telefone <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={valores.telefone}
            onChange={(e) => definirValor('telefone', aplicarMascaraTelefoneProgressiva(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="email@exemplo.com"
            value={valores.email}
            onChange={(e) => definirValor('email', e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Data de Nascimento <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={valores.dataNascimento}
            onChange={(e) => definirValor('dataNascimento', e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">
            Endereço <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Rua, número, bairro, cidade"
            value={valores.endereco}
            onChange={(e) => definirValor('endereco', e.target.value)}
          />
        </div>
        </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 gap-2">
        {senhaTemporaria ? (
          <button
            type="button"
            className="btn px-4 text-white"
            style={{ backgroundColor: 'var(--cor-acao-primaria)', borderColor: 'var(--cor-acao-primaria)' }}
            onClick={fechar}
          >
            Concluir
          </button>
        ) : (
          <>
            <button type="button" className="btn px-4 text-dark bg-white border" onClick={fechar}>
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
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}
