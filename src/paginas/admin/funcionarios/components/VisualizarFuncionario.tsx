import { useRef, useState } from 'react'
import { mascararCpf, formatarDataBr } from '../../../../utils/formatadores'
import { ModalInativarFuncionario } from './ModalInativarFuncionario'
import { ModalRestaurarSenha } from './ModalRestaurarSenha'
import { ModalEditarCampo } from './ModalEditarCampo'
import type { PessoaEquipe } from '../tipos'

interface Props {
  pessoa: PessoaEquipe
  onVoltar: () => void
  onInativado: () => void
  onFotoAlterada: (dataUrl: string) => void
  onCampoSalvo: (campo: 'email' | 'telefone', valor: string) => void
}

export function VisualizarFuncionario({ pessoa, onVoltar, onInativado, onFotoAlterada, onCampoSalvo }: Props) {
  const inputFotoRef = useRef<HTMLInputElement>(null)
  const [modalInativar, setModalInativar] = useState(false)
  const [modalSenha, setModalSenha] = useState(false)
  const [campoEmEdicao, setCampoEmEdicao] = useState<'email' | 'telefone' | null>(null)

  const isDentista = pessoa.tipo === 'dentista'

  function lidarUploadFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = (e) => {
      if (typeof e.target?.result === 'string') onFotoAlterada(e.target.result)
    }
    leitor.readAsDataURL(arquivo)
  }

  return (
    <div className="pb-5">
      <div className="mb-4 mt-2">
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={onVoltar}>
          <i className="fa-solid fa-arrow-left" /> Voltar
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          <div className="card shadow-sm p-4 border-0 rounded-3">
            <h4 className="fw-bold mb-4 text-center">Informações do Funcionário</h4>

            <div className="text-center mb-4">
              <div
                className="d-inline-flex border rounded-3 justify-content-center align-items-center mb-3 position-relative overflow-hidden"
                style={{ width: 150, height: 150, backgroundColor: '#f8f9fa' }}
              >
                {pessoa.foto ? (
                  <img src={pessoa.foto} alt={pessoa.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fa-solid fa-user text-secondary" style={{ fontSize: '5rem' }} />
                )}
              </div>
              <div>
                <input type="file" accept="image/*" className="d-none" ref={inputFotoRef} onChange={lidarUploadFoto} />
                <button
                  type="button"
                  className="btn btn-sm text-white"
                  style={{ backgroundColor: 'var(--cor-primaria)', borderColor: 'var(--cor-primaria)' }}
                  onClick={() => inputFotoRef.current?.click()}
                >
                  Subir Foto
                </button>
              </div>
            </div>

            <form>
              <div className="mb-3">
                <label className="form-label fw-semibold">Cargo</label>
                <input type="text" className="form-control" readOnly value={pessoa.cargo} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Nome</label>
                <input type="text" className="form-control" readOnly value={pessoa.nome} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">CPF</label>
                <input type="text" className="form-control" readOnly value={mascararCpf(pessoa.cpf)} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">E-mail</label>
                <div className="input-group">
                  <input type="text" className="form-control border-end-0" readOnly value={pessoa.email || ''} />
                  <span
                    className="input-group-text bg-transparent border-start-0"
                    style={{ cursor: 'pointer' }}
                    title="Editar e-mail"
                    onClick={() => setCampoEmEdicao('email')}
                  >
                    <i className="fa-solid fa-pencil text-secondary" style={{ fontSize: '0.8rem' }} />
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Telefone</label>
                <div className="input-group">
                  <input type="text" className="form-control border-end-0" readOnly value={pessoa.telefone || ''} />
                  <span
                    className="input-group-text bg-transparent border-start-0"
                    style={{ cursor: 'pointer' }}
                    title="Editar telefone"
                    onClick={() => setCampoEmEdicao('telefone')}
                  >
                    <i className="fa-solid fa-pencil text-secondary" style={{ fontSize: '0.8rem' }} />
                  </span>
                </div>
              </div>

              {!isDentista && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Data de Nascimento</label>
                  <input type="text" className="form-control" readOnly value={formatarDataBr(pessoa.dataNascimento)} />
                </div>
              )}

              {isDentista && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">CRO</label>
                    <input type="text" className="form-control" readOnly value={pessoa.cro || ''} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Especialidade</label>
                    <input type="text" className="form-control" readOnly value={pessoa.especialidade || ''} />
                  </div>
                </>
              )}

              <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setModalSenha(true)}
                >
                  <i className="fa-solid fa-rotate" />
                  Restaurar Senha
                </button>
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-center gap-2 text-white"
                  style={{ backgroundColor: 'var(--cor-perigo)', borderColor: 'var(--cor-perigo)' }}
                  onClick={() => setModalInativar(true)}
                >
                  <i className="fa-solid fa-user-slash" />
                  Inativar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ModalInativarFuncionario
        pessoa={modalInativar ? pessoa : null}
        onFechar={() => setModalInativar(false)}
        onInativado={onInativado}
      />
      <ModalRestaurarSenha pessoa={modalSenha ? pessoa : null} onFechar={() => setModalSenha(false)} />
      <ModalEditarCampo
        pessoa={pessoa}
        campo={campoEmEdicao}
        onFechar={() => setCampoEmEdicao(null)}
        onSalvo={(campo, valor) => {
          onCampoSalvo(campo, valor)
          setCampoEmEdicao(null)
        }}
      />
    </div>
  )
}
