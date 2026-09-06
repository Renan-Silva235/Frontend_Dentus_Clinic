import { useEffect, useRef, useState } from 'react'
import { mascararCpf } from '../../utils/formatadores'
import type { Paciente } from '../../types/dominio'

interface Props {
  pacientes: Paciente[]
  valorInicial?: string
  onSelecionar: (paciente: Paciente) => void
  placeholder?: string
}

export function AutocompletePaciente({ pacientes, valorInicial = '', onSelecionar, placeholder }: Props) {
  const [termo, setTermo] = useState(valorInicial)
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setTermo(valorInicial), [valorInicial])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('click', aoClicarFora)
    return () => document.removeEventListener('click', aoClicarFora)
  }, [])

  const sugestoes = termo.trim()
    ? pacientes.filter((p) => p.nome.toLowerCase().includes(termo.trim().toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="position-relative" ref={containerRef}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        autoComplete="off"
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value)
          setAberto(true)
        }}
      />
      {aberto && sugestoes.length > 0 && (
        <div
          className="list-group position-absolute w-100 shadow"
          style={{ zIndex: 1060, maxHeight: 180, overflowY: 'auto', borderRadius: '0 0 6px 6px' }}
        >
          {sugestoes.map((p) => (
            <button
              key={p.id}
              type="button"
              className="list-group-item list-group-item-action py-2 px-3"
              onMouseDown={() => {
                setTermo(p.nome)
                setAberto(false)
                onSelecionar(p)
              }}
            >
              <div className="fw-semibold" style={{ fontSize: '.85rem' }}>
                {p.nome}
              </div>
              {p.cpf && (
                <div className="text-muted" style={{ fontSize: '.75rem' }}>
                  {mascararCpf(p.cpf)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
