import { useEffect, useState } from 'react'
import { CalendarioSemanal } from '../../../componentes/CalendarioSemanal/CalendarioSemanal'
import type { EventoAgenda } from '../../../componentes/CalendarioSemanal/tipos'
import { useAgendaSemana } from '../../../hooks/queries/useAgendaSemana'
import { useDentistas } from '../../../hooks/queries/dentistas'
import { usePacientes } from '../../../hooks/queries/pacientes'
import { useServicos } from '../../../hooks/queries/servicos'
import { getMonday } from '../../../utils/datasAgenda'
import { ModalAgendarSlot, type SlotSelecionado } from './components/ModalAgendarSlot'
import { ModalDetalheConsulta } from './components/ModalDetalheConsulta'
import './Agenda.css'

export default function AgendaRecepcionista() {
  const { data: dentistas = [] } = useDentistas()
  const { data: pacientes = [] } = usePacientes()
  const { data: servicosGerais = [] } = useServicos()

  const [dentistaId, setDentistaId] = useState<number | undefined>(undefined)
  const [weekOffset, setWeekOffset] = useState(0)
  const monday = getMonday(weekOffset)
  const { grade } = useAgendaSemana(dentistaId, monday)

  const [slotParaAgendar, setSlotParaAgendar] = useState<SlotSelecionado | null>(null)
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoAgenda | null>(null)

  const dentistaAtual = dentistaId ?? dentistas[0]?.id

  useEffect(() => {
    if (dentistaId === undefined && dentistas.length > 0) {
      setDentistaId(dentistas[0].id)
    }
  }, [dentistaId, dentistas])

  function navegarSemana(direcao: -1 | 0 | 1) {
    setWeekOffset((atual) => (direcao === 0 ? 0 : atual + direcao))
  }

  const seletorDentista = (
    <>
      <i className="fa-solid fa-user-doctor rec-dentista-icon" />
      <select
        className="rec-dentista-select"
        value={dentistaAtual ?? ''}
        onChange={(e) => setDentistaId(Number(e.target.value))}
      >
        {dentistas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
    </>
  )

  const seletorDentistaMobile = (
    <div className="am-dentista-bar">
      <i className="fa-solid fa-user-doctor" />
      <select
        className="am-dentista-select"
        value={dentistaAtual ?? ''}
        onChange={(e) => setDentistaId(Number(e.target.value))}
      >
        {dentistas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CalendarioSemanal
        monday={monday}
        grade={grade}
        extraToolbarDesktop={seletorDentista}
        extraToolbarMobile={seletorDentistaMobile}
        onNavegarSemana={navegarSemana}
        onSlotLivreClick={(_dia, data, hora) => {
          if (dentistaAtual) setSlotParaAgendar({ dentistaId: dentistaAtual, data, hora })
        }}
        onEventoClick={setEventoSelecionado}
      />

      <ModalAgendarSlot
        slot={slotParaAgendar}
        dentistas={dentistas}
        pacientes={pacientes}
        servicosGerais={servicosGerais}
        onFechar={() => setSlotParaAgendar(null)}
      />

      <ModalDetalheConsulta
        evento={eventoSelecionado}
        dentistas={dentistas}
        pacientes={pacientes}
        servicosGerais={servicosGerais}
        onFechar={() => setEventoSelecionado(null)}
      />
    </div>
  )
}
