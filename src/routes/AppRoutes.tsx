import { Navigate, Route, Routes } from 'react-router-dom'
import { LayoutAutenticado } from '../layouts/LayoutAutenticado'
import { LayoutPublico } from '../layouts/LayoutPublico'
import Login from '../paginas/login'
import { RotaProtegida } from './RotaProtegida'
import { rotasAdmin, rotasDentista, rotasRecepcionista } from './rotas'

/** Árvore de rotas da aplicação — mantida aqui (fora de App.tsx, que é só o
 * ponto de entrada com os providers) para deixar toda a configuração de
 * roteamento centralizada em `/routes`. */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LayoutPublico>
            <Login />
          </LayoutPublico>
        }
      />

      <Route element={<RotaProtegida perfil="admin" />}>
        <Route path="/admin" element={<LayoutAutenticado />}>
          {rotasAdmin.map(({ path, Componente }) => (
            <Route key={path} path={path} element={<Componente />} />
          ))}
        </Route>
      </Route>

      <Route element={<RotaProtegida perfil="dentista" />}>
        <Route path="/dentista" element={<LayoutAutenticado />}>
          {rotasDentista.map(({ path, Componente }) => (
            <Route key={path} path={path} element={<Componente />} />
          ))}
        </Route>
      </Route>

      <Route element={<RotaProtegida perfil="recepcionista" />}>
        <Route path="/recepcionista" element={<LayoutAutenticado />}>
          {rotasRecepcionista.map(({ path, Componente }) => (
            <Route key={path} path={path} element={<Componente />} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
