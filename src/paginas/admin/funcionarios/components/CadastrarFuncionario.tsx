import { useEspecialidades } from '../../../../hooks/queries/especialidades'
import { useCadastrarFuncionario } from '../../../../hooks/queries/funcionarios'
import { useCadastrarDentista } from '../../../../hooks/queries/dentistas'
import { useFormValidation, type RegrasValidacao } from '../../../../hooks/useFormValidation'
import { aplicarMascaraCpfProgressiva, aplicarMascaraTelefoneProgressiva } from '../../../../utils/formatadores'
import { dispararErroApi, dispararErros, dispararSucesso } from '../../../../utils/toastErros'
import {
  validarCpf,
  validarDataPassada,
  validarEmail,
  validarNome,
  validarObrigatorio,
  validarSenha,
} from '../../../../utils/validadores'
import type { Cargo } from '../../../../types/dominio'

interface Props {
  onCancelar: () => void
  onCadastrado: () => void
}

type CargoCompleto = Cargo | 'DENTISTA'

interface FormularioFuncionario {
  cargo: CargoCompleto
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  cro: string
  idEspecialidade: string
  email: string
  senha: string
}

const VALORES_INICIAIS: FormularioFuncionario = {
  cargo: 'DENTISTA',
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  cro: '',
  idEspecialidade: '',
  email: '',
  senha: '',
}

const REGRAS: RegrasValidacao<FormularioFuncionario> = {
  nome: (valor) => validarNome(valor),
  cpf: (valor) => validarCpf(valor),
  dataNascimento: (valor, valores) => (valores.cargo === 'DENTISTA' ? undefined : validarDataPassada(valor)),
  cro: (valor, valores) => {
    if (valores.cargo !== 'DENTISTA') return undefined
    if (!valor.trim()) return 'CRO é obrigatório.'
    if (valor.trim().length < 4 || valor.trim().length > 20) return 'CRO deve ter entre 4 e 20 caracteres.'
    return undefined
  },
  idEspecialidade: (valor, valores) =>
    valores.cargo === 'DENTISTA' ? validarObrigatorio(valor, 'Selecione uma especialidade.') : undefined,
  email: (valor) => validarEmail(valor),
  senha: (valor) => validarSenha(valor),
}

export function CadastrarFuncionario({ onCancelar, onCadastrado }: Props) {
  const { data: especialidades = [] } = useEspecialidades()
  const cadastrarFuncionario = useCadastrarFuncionario()
  const cadastrarDentista = useCadastrarDentista()

  const { valores, definirValor, validar } = useFormValidation(VALORES_INICIAIS, REGRAS)
  const { cargo, nome, cpf, dataNascimento, telefone, cro, idEspecialidade, email, senha } = valores

  const isDentista = cargo === 'DENTISTA'
  const carregando = cadastrarFuncionario.isPending || cadastrarDentista.isPending

  async function confirmar() {
    const { valido, mensagens } = validar()
    if (!valido) {
      dispararErros(mensagens)
      return
    }

    const cpfDigitos = cpf.replace(/\D/g, '')
    const telefoneDigitos = telefone.replace(/\D/g, '')

    try {
      if (isDentista) {
        await cadastrarDentista.mutateAsync({
          nome: nome.trim(),
          cpf: cpfDigitos,
          cro: cro.trim(),
          telefone: telefoneDigitos,
          idEspecialidade: Number(idEspecialidade),
          email: email.trim(),
          senha,
        })
      } else {
        await cadastrarFuncionario.mutateAsync({
          nome: nome.trim(),
          cpf: cpfDigitos,
          dataNascimento,
          telefone: telefoneDigitos,
          cargo,
          email: email.trim(),
          senha,
        })
      }
      dispararSucesso('Funcionário cadastrado com sucesso.')
      onCadastrado()
    } catch (e) {
      dispararErroApi(e)
    }
  }

  return (
    <div className="pb-5">
      <div className="row justify-content-center mt-4">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-sm p-4 border-0 rounded-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <h4 className="fw-bold mb-4">Cadastro de Funcionário</h4>

            <form className="text-start" onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  Cargo
                </label>
                <select
                  className="form-select"
                  value={cargo}
                  onChange={(e) => definirValor('cargo', e.target.value as CargoCompleto)}
                >
                  <option value="DENTISTA">Dentista</option>
                  <option value="SECRETARIA">Secretária</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  Nome
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => definirValor('nome', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  CPF
                </label>
                <input
                  type="text"
                  className="form-control"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => definirValor('cpf', aplicarMascaraCpfProgressiva(e.target.value))}
                />
              </div>

              {!isDentista && (
                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataNascimento}
                    onChange={(e) => definirValor('dataNascimento', e.target.value)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  Telefone
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => definirValor('telefone', aplicarMascaraTelefoneProgressiva(e.target.value))}
                />
              </div>

              {isDentista && (
                <>
                  <div className="mb-3">
                    <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                      CRO
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Número do CRO"
                      value={cro}
                      onChange={(e) => definirValor('cro', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                      Especialidade
                    </label>
                    <select
                      className="form-select"
                      value={idEspecialidade}
                      onChange={(e) => definirValor('idEspecialidade', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => definirValor('email', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label mb-1" style={{ fontSize: '0.9rem' }}>
                  Senha
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Digite a senha"
                  value={senha}
                  onChange={(e) => definirValor('senha', e.target.value)}
                />
              </div>

              <div className="d-flex flex-column gap-2 mt-4">
                <button
                  type="button"
                  className="btn text-white fw-semibold py-2"
                  style={{ borderRadius: 8, backgroundColor: 'var(--cor-primaria)', borderColor: 'var(--cor-primaria)' }}
                  onClick={confirmar}
                  disabled={carregando}
                >
                  {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  className="btn fw-semibold py-2 text-dark bg-white"
                  style={{ borderRadius: 8, border: '1px solid #ccc' }}
                  onClick={onCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
