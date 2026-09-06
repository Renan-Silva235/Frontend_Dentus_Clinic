import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { PerfilRota } from '../../contexts/AutenticacaoContext'
import { useAutenticacao } from '../../contexts/AutenticacaoContext'
import { ModalConfirmacao } from '../ModalConfirmacao/ModalConfirmacao'
import { ModalConfiguracoes } from '../ModalConfiguracoes/ModalConfiguracoes'
import './Sidebar.css'

interface ItemMenu {
  id: string
  icone: string
  rotulo: string
  para: string
}

const menusPorPerfil: Record<PerfilRota, ItemMenu[]> = {
  recepcionista: [
    { id: 'dashboard', icone: 'fa-solid fa-house', rotulo: 'Página Inicial', para: '/recepcionista/dashboard' },
    { id: 'agenda', icone: 'fa-solid fa-calendar-check', rotulo: 'Agenda', para: '/recepcionista/agenda' },
    { id: 'pacientes', icone: 'fa-solid fa-user-injured', rotulo: 'Pacientes', para: '/recepcionista/pacientes' },
    { id: 'funcionarios', icone: 'fa-solid fa-id-card', rotulo: 'Funcionários', para: '/recepcionista/funcionarios' },
  ],
  dentista: [
    { id: 'dashboard', icone: 'fa-solid fa-tooth', rotulo: 'Página Inicial', para: '/dentista/dashboard' },
    { id: 'tratamentos', icone: 'fa-solid fa-file', rotulo: 'Tratamentos', para: '/dentista/tratamentos' },
    { id: 'agenda', icone: 'fa-solid fa-calendar-days', rotulo: 'Agenda', para: '/dentista/agenda' },
    { id: 'pacientes', icone: 'fa-solid fa-user-injured', rotulo: 'Meus Pacientes', para: '/dentista/pacientes' },
  ],
  admin: [
    { id: 'funcionarios', icone: 'fa-solid fa-id-card', rotulo: 'Funcionários', para: '/admin/funcionarios' },
    { id: 'pacientes', icone: 'fa-solid fa-user-injured', rotulo: 'Pacientes', para: '/admin/pacientes' },
    { id: 'servicos', icone: 'fa-solid fa-tooth', rotulo: 'Serviços', para: '/admin/servicos' },
  ],
}

interface Props {
  perfil: PerfilRota
  nome: string
}

export function Sidebar({ perfil, nome }: Props) {
  const { sair } = useAutenticacao()
  const navegar = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false)
  const [modalConfigAberto, setModalConfigAberto] = useState(false)

  const menus = menusPorPerfil[perfil]
  const cargoLabel = perfil.charAt(0).toUpperCase() + perfil.slice(1)

  function confirmarLogout() {
    sair()
    navegar('/login', { replace: true })
  }

  return (
    <>
      <button
        type="button"
        className="btn-hamburger"
        aria-label="Abrir menu"
        onClick={() => setMenuAberto(true)}
      >
        <i className="fa-solid fa-bars" />
      </button>

      <aside className={`sidebar ${menuAberto ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/img/dental.svg" alt="Ícone de início" className="sidebar-logo-img" />
          <span className="sidebar-brand">Dentu's Clinic</span>
        </div>
        <hr className="sidebar-divider" />

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <i className="fa-solid fa-user" />
          </div>
          <div className="sidebar-profile-info">
            <span className="sidebar-role">{cargoLabel}</span>
            <span className="sidebar-name">{nome}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {menus.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.para}
                  className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setMenuAberto(false)}
                >
                  <i className={`${item.icone} me-2`} />
                  <span>{item.rotulo}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <a
            href="#"
            className="sidebar-nav-link"
            onClick={(e) => {
              e.preventDefault()
              setModalConfigAberto(true)
            }}
          >
            <i className="fa-solid fa-gear me-2" />
            <span>Configurações</span>
          </a>
          <a
            href="#"
            className="sidebar-nav-link sidebar-logout"
            onClick={(e) => {
              e.preventDefault()
              setModalLogoutAberto(true)
            }}
          >
            <i className="fa-solid fa-right-from-bracket me-2" />
            <span>Sair</span>
          </a>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${menuAberto ? 'active' : ''}`}
        onClick={() => setMenuAberto(false)}
      />

      <ModalConfirmacao
        aberto={modalLogoutAberto}
        titulo="Sair da conta"
        icone="fa-solid fa-right-from-bracket"
        textoBotaoConfirmar="Sair"
        onCancelar={() => setModalLogoutAberto(false)}
        onConfirmar={confirmarLogout}
      >
        <p className="mb-0">Deseja realmente sair?</p>
      </ModalConfirmacao>

      <ModalConfiguracoes aberto={modalConfigAberto} onFechar={() => setModalConfigAberto(false)} />
    </>
  )
}
