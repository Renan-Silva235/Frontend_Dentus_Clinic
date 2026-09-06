const ARCADA_SUPERIOR_DIREITA = [18, 17, 16, 15, 14, 13, 12, 11]
const ARCADA_SUPERIOR_ESQUERDA = [21, 22, 23, 24, 25, 26, 27, 28]
const ARCADA_INFERIOR_DIREITA = [48, 47, 46, 45, 44, 43, 42, 41]
const ARCADA_INFERIOR_ESQUERDA = [31, 32, 33, 34, 35, 36, 37, 38]

interface Props {
  prefixo: 'dente-consulta' | 'dente-prontuario' | 'dente-finalizar'
  classeAtiva: 'tratamento' | 'tratado-consulta'
  numerosSelecionados: Set<number>
  somenteLeitura?: boolean
  onToggle?: (numero: number) => void
}

export function Odontograma({ prefixo, classeAtiva, numerosSelecionados, somenteLeitura, onToggle }: Props) {
  function renderDente(numero: number) {
    const ativo = numerosSelecionados.has(numero)
    return (
      <div
        key={numero}
        className={`${prefixo} ${ativo ? classeAtiva : 'saudavel'}`}
        onClick={somenteLeitura ? undefined : () => onToggle?.(numero)}
      >
        {numero}
      </div>
    )
  }

  return (
    <div className="odontograma-chart">
      <div className="arcada-row">
        <div className="arcada-grupo">{ARCADA_SUPERIOR_DIREITA.map(renderDente)}</div>
        <div className="arcada-gap" />
        <div className="arcada-grupo">{ARCADA_SUPERIOR_ESQUERDA.map(renderDente)}</div>
      </div>
      <div className="arcada-row">
        <div className="arcada-grupo">{ARCADA_INFERIOR_DIREITA.map(renderDente)}</div>
        <div className="arcada-gap" />
        <div className="arcada-grupo">{ARCADA_INFERIOR_ESQUERDA.map(renderDente)}</div>
      </div>
    </div>
  )
}
