import { Navigate, Outlet } from "react-router-dom";
import {
  useAutenticacao,
  type PerfilRota,
} from "../contexts/AutenticacaoContext";
import { rotaPadraoPorPerfil } from "./rotas";

interface Props {
  perfil: PerfilRota;
}

/**
 * Guard de rota real por perfil — hoje inexistente no /Frontend original
 * (ver docs/migracao-react/03-cruzamento-e-inconsistencias.md, item 7).
 */
export function RotaProtegida({ perfil }: Props) {
  const { usuario } = useAutenticacao();

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.perfil !== perfil)
    return <Navigate to={rotaPadraoPorPerfil[usuario.perfil]} replace />;

  return <Outlet />;
}
