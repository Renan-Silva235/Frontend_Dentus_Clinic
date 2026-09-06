import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../../contexts/AutenticacaoContext'
import { rotaPadraoPorPerfil } from '../../routes/rotas'
import { useFormValidation } from '../../hooks/useFormValidation'
import { validarEmail, validarSenha } from '../../utils/validadores'
import { dispararErroApi, dispararErros } from '../../utils/toastErros'
import './Login.css'

interface FormularioLogin {
  email: string
  senha: string
}

export default function Login() {
  const { entrar } = useAutenticacao()
  const navegar = useNavigate()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const { valores, definirValor, validar } = useFormValidation<FormularioLogin>(
    { email: '', senha: '' },
    {
      email: validarEmail,
      senha: (valor) => validarSenha(valor),
    },
  )

  async function aoSubmeter(e: React.FormEvent) {
    e.preventDefault()

    const resultado = validar()
    if (!resultado.valido) {
      dispararErros(resultado.mensagens)
      return
    }

    setCarregando(true)
    try {
      const sessao = await entrar(valores.email, valores.senha)
      navegar(rotaPadraoPorPerfil[sessao.perfil], { replace: true })
    } catch (erro) {
      dispararErroApi(erro)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <div className="login-logo text-center">
            <span className="tooth-icon">
              <i className="fa-solid fa-tooth" />
            </span>
            <span className="welcome-sub">Bem-vindo ao</span>
            <span className="brand-name">Dentu's Clinic</span>
          </div>

          <form className="login-form" onSubmit={aoSubmeter} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="usuario@dentusclinic.com"
                  autoComplete="email"
                  value={valores.email}
                  onChange={(e) => definirValor('email', e.target.value)}
                />
                <i className="fa-solid fa-envelope input-icon" />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label">
                Senha
              </label>
              <div className="input-wrapper">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  className="form-control"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={valores.senha}
                  onChange={(e) => definirValor('senha', e.target.value)}
                />
                <i
                  className={`fa-solid ${mostrarSenha ? 'fa-eye' : 'fa-eye-slash'} input-icon toggle-pw`}
                  role="button"
                  tabIndex={0}
                  aria-label="Mostrar/ocultar senha"
                  onClick={() => setMostrarSenha((atual) => !atual)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-center">
              <button type="submit" className="btn-login" disabled={carregando}>
                {carregando ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Autenticando…
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-right-to-bracket me-1" /> Entrar
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="login-right">
          <div className="img-placeholder">
            <img src="/img/logo1.png" alt="Dentu's Clinic" />
          </div>
        </div>
      </div>
    </div>
  )
}
