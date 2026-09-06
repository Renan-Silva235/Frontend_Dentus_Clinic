import { Outlet } from 'react-router-dom'
import { Sidebar } from '../componentes/Sidebar/Sidebar'
import { useAutenticacao } from '../contexts/AutenticacaoContext'

export function LayoutAutenticado() {
  const { usuario } = useAutenticacao()
  if (!usuario) return null

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar perfil={usuario.perfil} nome={usuario.nome} />
      <main className="flex-grow-1 app-content">
        <Outlet />
      </main>
    </div>
  )
}
