export function mascararCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return cpf
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`
}

/** Mascara os primeiros 7 dígitos do CPF, mantendo os últimos 4 visíveis
 * (mesmo padrão de admin/pacientes.js original: ***.***.*XY-ZW). */
export function mascararCpfParcial(cpf: string): string {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return cpf
  return `***.***.*${digitos[7]}${digitos[8]}-${digitos[9]}${digitos[10]}`
}

export function mascararTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  return telefone
}

/** Aplica máscara progressiva de CPF enquanto o usuário digita (lógica idêntica
 * a admin/pacientes.js:aplicarMascaraCPF original). */
export function aplicarMascaraCpfProgressiva(valor: string): string {
  let v = valor.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  return v
}

/** Aplica máscara progressiva de telefone enquanto o usuário digita (lógica
 * idêntica a admin/funcionarios.js original). */
export function aplicarMascaraTelefoneProgressiva(valor: string): string {
  const v = valor.replace(/\D/g, '').slice(0, 11)
  if (v.length > 10) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 0) return `(${v}`
  return v
}

export function formatarDataBr(dataIso: string | undefined): string {
  if (!dataIso || dataIso.startsWith('0001-01-01')) return '—'
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}
