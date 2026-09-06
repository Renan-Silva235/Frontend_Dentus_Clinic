import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  DAY_ABBR,
  DAY_FULL,
  HOUR_COUNT,
  HOUR_START,
  MONTHS_PT,
  dateKey,
  getWeekNumber,
  slotToTime,
  toISODate,
} from '../../utils/datasAgenda'
import { STATUS_CORES, type EventoAgenda, type GradeSemana } from './tipos'
import './CalendarioSemanal.css'

interface Props {
  monday: Date
  grade: GradeSemana
  somenteLeitura?: boolean
  extraToolbarDesktop?: ReactNode
  extraToolbarMobile?: ReactNode
  onNavegarSemana: (direcao: -1 | 0 | 1) => void
  onSlotLivreClick?: (dia: number, dataISO: string, hora: string) => void
  onEventoClick: (evento: EventoAgenda) => void
}

export function CalendarioSemanal({
  monday,
  grade,
  somenteLeitura = false,
  extraToolbarDesktop,
  extraToolbarMobile,
  onNavegarSemana,
  onSlotLivreClick,
  onEventoClick,
}: Props) {
  const [diaAtivoMobile, setDiaAtivoMobile] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const todayKey = dateKey(new Date())

  const labelPeriodo =
    monday.getMonth() === sunday.getMonth()
      ? `${MONTHS_PT[monday.getMonth()]} ${monday.getFullYear()}`
      : `${MONTHS_PT[monday.getMonth()].slice(0, 3)} — ${MONTHS_PT[sunday.getMonth()].slice(0, 3)} ${monday.getFullYear()}`

  const semanaAtual = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const mostraSemanaAtual = semanaAtual.some((d) => dateKey(d) === todayKey)

  useEffect(() => {
    if (!mostraSemanaAtual || !scrollRef.current) return
    const now = new Date()
    const mins = (now.getHours() - HOUR_START) * 60 + now.getMinutes()
    if (mins < 0) return
    scrollRef.current.scrollTop = Math.max(0, (Math.floor(mins / 30) - 1) * 48)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday])

  const diaMobile = semanaAtual[diaAtivoMobile]
  const dataIsoMobile = toISODate(diaMobile)
  const slotsMobile = grade[diaAtivoMobile] || []

  return (
    <>
      {/* ══ DESKTOP ══ */}
      <div className="tcal-wrapper">
        <div className="tcal-toolbar">
          <div className="tcal-toolbar-left">
            <button className="tcal-btn-today" onClick={() => onNavegarSemana(0)}>
              Hoje
            </button>
            <div className="tcal-nav-group">
              <button className="tcal-btn-nav" aria-label="Semana anterior" onClick={() => onNavegarSemana(-1)}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button className="tcal-btn-nav" aria-label="Próxima semana" onClick={() => onNavegarSemana(1)}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
            <span className="tcal-period">{labelPeriodo}</span>
          </div>
          <div className="tcal-toolbar-right">{extraToolbarDesktop}</div>
        </div>

        <div className="tcal-scroll-area" ref={scrollRef}>
          <div className="tcal-head">
            <div className="tcal-head-gutter" />
            {semanaAtual.map((dia, i) => (
              <div key={i} className={`tcal-head-day ${dateKey(dia) === todayKey ? 'today' : ''}`}>
                <span className="tcal-abbr">{DAY_ABBR[dia.getDay()]}</span>
                <span className="tcal-num">{dia.getDate()}</span>
              </div>
            ))}
          </div>

          <div className="tcal-body">
            <div className="tcal-time-col">
              {Array.from({ length: HOUR_COUNT }, (_, i) => (
                <div className="tcal-hour-cell" key={i}>
                  <span className="tcal-hour-lbl">{slotToTime(i)}</span>
                </div>
              ))}
            </div>

            <div className="tcal-grid">
              {semanaAtual.map((dia, d) => (
                <div key={d} className={`tcal-day-col ${dateKey(dia) === todayKey ? 'today' : ''}`}>
                  {Array.from({ length: HOUR_COUNT }, (_, h) => {
                    const slot = grade[d]?.[h] ?? null
                    if (slot) {
                      const cor = STATUS_CORES[slot.status] || { bg: 'var(--cor-primaria)', texto: '#fff' }
                      return (
                        <div className="tcal-cell" key={h}>
                          <div
                            className="tcal-event"
                            style={{ background: cor.bg, color: cor.texto }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventoClick(slot)
                            }}
                          >
                            <span className="tcal-event-name">{slot.nomePaciente}</span>
                            <span className="tcal-event-service">{slot.nomeServico}</span>
                          </div>
                        </div>
                      )
                    }
                    const horaSlot = slotToTime(h)
                    return (
                      <div
                        className={`tcal-cell ${!somenteLeitura ? 'tcal-cell--livre' : ''}`}
                        key={h}
                        title={!somenteLeitura ? `Agendar ${horaSlot}` : undefined}
                        onClick={() => !somenteLeitura && onSlotLivreClick?.(d, toISODate(dia), horaSlot)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="agenda-mobile">
        {extraToolbarMobile}

        <div className="am-nav">
          <button className="am-nav-btn" onClick={() => onNavegarSemana(-1)}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="am-nav-info">
            <span className="am-nav-semana">Semana {getWeekNumber(monday)}</span>
            <span className="am-nav-mes">
              {MONTHS_PT[monday.getMonth()]} {monday.getFullYear()}
            </span>
          </div>
          <button className="am-nav-btn" onClick={() => onNavegarSemana(1)}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>

        <div className="am-strip-wrap">
          <div className="am-strip">
            {semanaAtual.map((dia, i) => (
              <div
                key={i}
                className={`am-day ${dateKey(dia) === todayKey ? 'hoje' : ''} ${i === diaAtivoMobile ? 'ativo' : ''}`}
                onClick={() => setDiaAtivoMobile(i)}
              >
                <span className="am-day-nome">{DAY_ABBR[dia.getDay()]}</span>
                <span className="am-day-num">{dia.getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="am-slots">
          <div className="am-slots-titulo">
            {DAY_FULL[diaMobile.getDay()]}, {diaMobile.getDate()} de {MONTHS_PT[diaMobile.getMonth()]}
          </div>

          {slotsMobile.map((slot, idx) => {
            const hora = slotToTime(idx)
            const isLast = idx === slotsMobile.length - 1
            const cor = slot ? STATUS_CORES[slot.status] || { bg: 'var(--cor-primaria)', texto: '#fff' } : null
            return (
              <div className="am-slot" key={idx}>
                <span className="am-slot-hora">{hora}</span>
                <div className="am-slot-linha">
                  <span className={`am-slot-dot ${slot ? 'ocupado' : ''}`} />
                  {!isLast && <span className="am-slot-fio" />}
                </div>
                <div className="am-slot-corpo">
                  {slot ? (
                    <div className="am-evento" style={{ background: cor?.bg }} onClick={() => onEventoClick(slot)}>
                      <span className="am-evento-nome" style={{ color: cor?.texto }}>
                        {slot.nomePaciente}
                      </span>
                      <span className="am-evento-servico" style={{ color: cor?.texto, opacity: 0.8 }}>
                        {slot.nomeServico}
                      </span>
                    </div>
                  ) : somenteLeitura ? (
                    <span className="am-livre">Livre</span>
                  ) : (
                    <button className="am-btn-agendar" onClick={() => onSlotLivreClick?.(diaAtivoMobile, dataIsoMobile, hora)}>
                      <i className="fa-solid fa-plus" /> Agendar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
