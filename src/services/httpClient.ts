/**
 * Cliente HTTP central. Substitui js/api.js do Frontend original, mas
 * formaliza a tolerância aos 3 formatos de erro da API (ver
 * docs/migracao-react/01-analise-backend.md §2 e 03-cruzamento §"O que bate").
 */

const API_BASE = '/api'

export class ErroHttp extends Error {
  status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

interface ConfiguracaoHttpClient {
  obterToken: () => string | null
  aoReceberNaoAutorizado: () => void
}

let obterToken: () => string | null = () => null
let aoReceberNaoAutorizado: () => void = () => {}

export function configurarHttpClient(config: ConfiguracaoHttpClient) {
  obterToken = config.obterToken
  aoReceberNaoAutorizado = config.aoReceberNaoAutorizado
}

function extrairMensagemDeErro(corpo: unknown): string {
  if (!corpo || typeof corpo !== 'object') return 'Ocorreu um erro. Tente novamente.'
  const objeto = corpo as Record<string, unknown>

  if (Array.isArray(objeto.error)) return objeto.error.join('\n')
  if (Array.isArray(objeto.erros) && objeto.erros.length > 0) return objeto.erros.join('\n')
  if (typeof objeto.mensagem === 'string') return objeto.mensagem
  if (typeof objeto.message === 'string') return objeto.message

  return 'Ocorreu um erro. Tente novamente.'
}

async function request<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = obterToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErroHttp('Não foi possível conectar ao servidor. Tente novamente.', 0)
  }

  const texto = await response.text()
  const corpo = texto ? JSON.parse(texto) : undefined

  if (response.status === 401) {
    if (endpoint === '/auth/login') {
      throw new ErroHttp('E-mail ou senha inválidos.', 401)
    }
    aoReceberNaoAutorizado()
    throw new ErroHttp('Sua sessão expirou. Faça login novamente.', 401)
  }

  if (response.status === 403) {
    throw new ErroHttp('Você não tem permissão para realizar esta ação.', 403)
  }

  if (!response.ok) {
    throw new ErroHttp(extrairMensagemDeErro(corpo), response.status)
  }

  if (corpo && typeof corpo === 'object' && 'dados' in corpo) {
    return corpo.dados as T
  }
  return corpo as T
}

export const httpClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'POST', body),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'PATCH', body),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'PUT', body),
  delete: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
}
