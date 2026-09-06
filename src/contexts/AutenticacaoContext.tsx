import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { configurarHttpClient } from '../services/httpClient'
import { autenticacaoService } from '../services/autenticacaoService'
import type { TipoAcesso } from '../types/dominio'

export type PerfilRota = 'admin' | 'dentista' | 'recepcionista'

const mapaPerfil: Record<TipoAcesso, PerfilRota> = {
  ADMINISTRADOR: 'admin',
  DENTISTA: 'dentista',
  SECRETARIA: 'recepcionista',
}

export interface SessaoUsuario {
  id: number
  nome: string
  token: string
  tipoAcesso: TipoAcesso
  perfil: PerfilRota
  expiracao: string
}

interface AutenticacaoContextValor {
  usuario: SessaoUsuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<SessaoUsuario>
  sair: () => void
}

const CHAVES = {
  token: 'token',
  tipoAcesso: 'tipoAcesso',
  nome: 'nome',
  id: 'id',
  expiracao: 'expiracao',
} as const

function sessaoValida(expiracao: string | null): boolean {
  if (!expiracao) return false
  return new Date(expiracao) > new Date()
}

function lerSessao(): SessaoUsuario | null {
  const token = sessionStorage.getItem(CHAVES.token)
  const expiracao = sessionStorage.getItem(CHAVES.expiracao)
  const tipoAcesso = sessionStorage.getItem(CHAVES.tipoAcesso) as TipoAcesso | null

  if (!token || !tipoAcesso || !sessaoValida(expiracao)) return null

  return {
    id: Number(sessionStorage.getItem(CHAVES.id)),
    nome: sessionStorage.getItem(CHAVES.nome) ?? '',
    token,
    tipoAcesso,
    perfil: mapaPerfil[tipoAcesso],
    expiracao: expiracao as string,
  }
}

function salvarSessao(sessao: SessaoUsuario) {
  sessionStorage.setItem(CHAVES.token, sessao.token)
  sessionStorage.setItem(CHAVES.tipoAcesso, sessao.tipoAcesso)
  sessionStorage.setItem(CHAVES.nome, sessao.nome)
  sessionStorage.setItem(CHAVES.id, String(sessao.id))
  sessionStorage.setItem(CHAVES.expiracao, sessao.expiracao)
}

const AutenticacaoContext = createContext<AutenticacaoContextValor | undefined>(undefined)

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(() => lerSessao())
  const [carregando, setCarregando] = useState(false)

  function sair() {
    sessionStorage.clear()
    setUsuario(null)
  }

  useEffect(() => {
    configurarHttpClient({
      obterToken: () => sessionStorage.getItem(CHAVES.token),
      aoReceberNaoAutorizado: sair,
    })
  }, [])

  async function entrar(email: string, senha: string) {
    setCarregando(true)
    try {
      const resposta = await autenticacaoService.login(email, senha)
      const sessao: SessaoUsuario = {
        id: resposta.id,
        nome: resposta.nome,
        token: resposta.token,
        tipoAcesso: resposta.tipoAcesso,
        perfil: mapaPerfil[resposta.tipoAcesso],
        expiracao: resposta.expiracao,
      }
      salvarSessao(sessao)
      setUsuario(sessao)
      return sessao
    } finally {
      setCarregando(false)
    }
  }

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair }),
    [usuario, carregando],
  )

  return <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext)
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider')
  return contexto
}
