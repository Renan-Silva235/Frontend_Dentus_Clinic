/** Validadores espelhando as regras do backend (ver docs/migracao-react/01-analise-backend.md §6). */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_NOME = /^[\p{L} ]+$/u

export function validarObrigatorio(valor: string | undefined, mensagem: string): string | undefined {
  if (!valor || !valor.trim()) return mensagem
  return undefined
}

export function validarEmail(valor: string | undefined): string | undefined {
  if (!valor || !valor.trim()) return 'E-mail é obrigatório.'
  if (!REGEX_EMAIL.test(valor)) return 'Informe um e-mail válido.'
  return undefined
}

export function validarSenha(valor: string | undefined, minimo = 6): string | undefined {
  if (!valor) return 'Senha é obrigatória.'
  if (valor.length < minimo) return `A senha deve ter no mínimo ${minimo} caracteres.`
  return undefined
}

export function validarNome(valor: string | undefined): string | undefined {
  if (!valor || !valor.trim()) return 'Nome é obrigatório.'
  if (valor.trim().length < 3 || valor.trim().length > 100) return 'Nome deve ter entre 3 e 100 caracteres.'
  if (!REGEX_NOME.test(valor)) return 'Nome deve conter apenas letras e espaços.'
  return undefined
}

export function validarCpf(valor: string | undefined): string | undefined {
  const digitos = (valor ?? '').replace(/\D/g, '')
  if (!digitos) return 'CPF é obrigatório.'
  if (digitos.length !== 11) return 'CPF inválido. Informe exatamente 11 dígitos.'
  if (/^(\d)\1{10}$/.test(digitos)) return 'CPF inválido.'

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const d1 = calcularDigito(digitos.slice(0, 9), 10)
  const d2 = calcularDigito(digitos.slice(0, 10), 11)
  if (d1 !== Number(digitos[9]) || d2 !== Number(digitos[10])) return 'CPF inválido.'

  return undefined
}

export function validarTelefone(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length !== 10 && digitos.length !== 11) {
    return 'Informe um telefone válido (10 ou 11 dígitos).'
  }
  return undefined
}

export function validarDataPassada(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  const data = new Date(valor)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  if (data >= hoje) return 'Data de nascimento não pode ser hoje ou no futuro.'
  return undefined
}
