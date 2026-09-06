interface Props {
  titulo: string
}

/** Placeholder temporário — será substituído página a página na Etapa 10. */
export function PaginaEmConstrucao({ titulo }: Props) {
  return (
    <div>
      <h1 className="page-title">{titulo}</h1>
      <p className="text-muted">Página ainda não migrada.</p>
    </div>
  )
}
