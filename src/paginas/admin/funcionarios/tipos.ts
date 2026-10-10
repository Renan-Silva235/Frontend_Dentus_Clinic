export type TipoEquipe = "dentista" | "secretaria" | "administrador";

export interface PessoaEquipe {
  id: number;
  tipo: TipoEquipe;
  cargo: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email: string;
  dataNascimento?: string;
  cro?: string;
  especialidade?: string;
  /** Preview local (base64), nunca enviado à API — funcionalidade incompleta
   * preservada do original (ver docs/migracao-react/03-cruzamento-e-inconsistencias.md). */
  foto?: string;
}
