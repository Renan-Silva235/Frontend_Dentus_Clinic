export const HOUR_START = 8
export const SLOT_MIN = 30
export const HOUR_COUNT = 27 // 08:00 → 21:00, de 30 em 30 min

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
export const DAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DAY_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function getMonday(offset = 0): Date {
  const today = new Date()
  const dow = today.getDay()
  const d = new Date(today)
  d.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function formatarDataAgenda(iso: string): string {
  const [y, m, d] = String(iso).split('-')
  return `${d}/${m}/${y}`
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function slotToTime(idx: number): string {
  const mins = HOUR_START * 60 + idx * SLOT_MIN
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}
