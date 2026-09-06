/**
 * Formato de resposta da API .NET (ver docs/migracao-react/01-analise-backend.md, seção 2).
 * A API tem 3 formatos de erro coexistindo — o httpClient trata todos.
 */
export interface ApiResponse<T> {
  sucesso: boolean
  mensagem?: string
  dados?: T
  erros?: string[]
}

export interface ErroValidacaoDto {
  error: string[]
}

export interface ErroSimples {
  mensagem?: string
  message?: string
}
