/**
 * Paleta central da aplicação. Reproduz as cores hoje espalhadas em
 * `Frontend/css/variables.css` e nos CSS específicos de cada página
 * (ver docs/migracao-react/02-analise-frontend.md, seção 2.1).
 *
 * Nenhum componente deve usar hex direto — sempre importar daqui.
 */

export const cores = {
  claro: {
    primaria: "#6e5430",
    primariaHover: "#8a783f",
    borda: "#beb48b",
    fundo: "#e7e7db",
    superficie: "#f9f9f9",
    texto: "#6e5430",
  },
  escuro: {
    fundo: "#141210",
    superficie: "#1e1b17",
    card: "#272318",
    borda: "#3a3226",
    texto: "#d5c5a1",
    textoSecundario: "#a09070",
  },

  // Unifica os hex de perigo hoje duplicados (#c0392b, #d9534f, #a93226, #b91c1c, #e74c3c).
  perigo: "#c0392b",
  perigoHover: "#a93226",
  perigoFundo: "#fdf0ee",
  sucesso: "#27ae60",
  aviso: "#e65100",
  info: "#4f46e5",
  acaoPrimaria: "#0d6efd",

  statusConsulta: {
    agendada: { fundo: "#eef2ff", texto: "#4f46e5", solido: "#4f46e5" },
    aguardando: { fundo: "#fef9e7", texto: "#8a783f", solido: "#d97706" },
    emConsulta: { fundo: "#e8f8f5", texto: "#16a085", solido: "#0d9488" },
    encerrada: { fundo: "#f0f0f0", texto: "#555555", solido: "#6b7280" },
    cancelada: {
      fundo: "#fdf0ee",
      texto: "#c0392b",
      solido: "rgba(220,38,38,.35)",
    },
  },

  retorno: { fundo: "#fff3e0", texto: "#e65100" },

  cargo: {
    secretaria: { fundo: "#e8f5e9", texto: "#2e7d32" },
    dentista: { fundo: "#e3f2fd", texto: "#1565c0" },
    tiAdm: { fundo: "#fce4ec", texto: "#ad1457" },
    default: { fundo: "#f3e5f5", texto: "#6a1b9a" },
  },

  odontograma: {
    saudavel: { fundo: "#ffffff", borda: "#cccccc" },
    selecao: { fundo: "#e74c3c", borda: "#c0392b" },
    tratado: { fundo: "#3498db", borda: "#2980b9" },
    ausente: { fundo: "#bdc3c7", borda: "#95a5a6" },
  },
} as const;

export const tipografia = {
  fonteDisplay: "'Merriweather', Georgia, serif",
  fonteCorpo: "'Inter', sans-serif",
};

export const espacamento = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
};

export const raios = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  card: "1rem",
};

export const sombras = {
  sm: "0 1px 3px rgba(110, 84, 48, .10)",
  md: "0 4px 16px rgba(110, 84, 48, .12)",
  card: "0 8px 40px rgba(110, 84, 48, .15)",
};

export const transicaoPadrao = "180ms cubic-bezier(.16, 1, .3, 1)";

export const larguraSidebar = "220px";

/**
 * Converte um hex (#rrggbb) em "r, g, b" — usado para expor variáveis
 * `--cor-*-rgb` consumidas dentro de `rgba(var(--cor-*-rgb), alfa)`.
 * CSS não permite compor um `rgba()` a partir de uma variável que guarda
 * um hex completo, só a partir dos componentes separados.
 */
function hexParaRgb(hex: string): string {
  const valor = hex.replace("#", "");
  const r = parseInt(valor.substring(0, 2), 16);
  const g = parseInt(valor.substring(2, 4), 16);
  const b = parseInt(valor.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Gera o CSS que expõe todos os tokens acima como custom properties
 * (`--cor-primaria`, `--espaco-4`, etc.), consumidas por todo `.css` da
 * aplicação. Isto faz deste arquivo a fonte real: mudar um valor aqui muda
 * a aplicação inteira, sem precisar tocar em nenhum `.css`.
 */
export function gerarVariaveisCss(): string {
  return `
:root {
  --cor-primaria: ${cores.claro.primaria};
  --cor-primaria-rgb: ${hexParaRgb(cores.claro.primaria)};
  --cor-primaria-hover: ${cores.claro.primariaHover};
  --cor-borda: ${cores.claro.borda};
  --cor-fundo: ${cores.claro.fundo};
  --cor-superficie: ${cores.claro.superficie};
  --cor-texto: ${cores.claro.texto};

  --cor-odontograma-tratado-rgb: ${hexParaRgb(cores.odontograma.tratado.fundo)};

  --cor-card: #fff;
  --cor-texto-secundario: #888;

  --cor-perigo: ${cores.perigo};
  --cor-perigo-hover: ${cores.perigoHover};
  --cor-perigo-fundo: ${cores.perigoFundo};
  --cor-sucesso: ${cores.sucesso};
  --cor-aviso: ${cores.aviso};
  --cor-info: ${cores.info};
  --cor-acao-primaria: ${cores.acaoPrimaria};

  --fonte-display: ${tipografia.fonteDisplay};
  --fonte-corpo: ${tipografia.fonteCorpo};

  --espaco-1: ${espacamento[1]};
  --espaco-2: ${espacamento[2]};
  --espaco-3: ${espacamento[3]};
  --espaco-4: ${espacamento[4]};
  --espaco-6: ${espacamento[6]};
  --espaco-8: ${espacamento[8]};

  --raio-sm: ${raios.sm};
  --raio-md: ${raios.md};
  --raio-lg: ${raios.lg};
  --raio-card: ${raios.card};

  --sombra-sm: ${sombras.sm};
  --sombra-md: ${sombras.md};
  --sombra-card: ${sombras.card};

  --transicao-padrao: ${transicaoPadrao};
  --largura-sidebar: ${larguraSidebar};
}

html.dark-mode {
  color-scheme: dark;
  --cor-fundo: ${cores.escuro.fundo};
  --cor-superficie: ${cores.escuro.superficie};
  --cor-card: ${cores.escuro.card};
  --cor-borda: ${cores.escuro.borda};
  --cor-texto: ${cores.escuro.texto};
  --cor-texto-secundario: ${cores.escuro.textoSecundario};

  --sombra-sm: 0 1px 3px rgba(0, 0, 0, 0.45);
  --sombra-md: 0 4px 16px rgba(0, 0, 0, 0.55);
  --sombra-card: 0 8px 40px rgba(0, 0, 0, 0.65);
}
`.trim();
}

/** Injeta o `<style>` gerado a partir de `colors.ts` no `<head>`. Deve ser
 * chamado uma vez, antes da renderização (ver `main.tsx`). */
export function aplicarTokens(): void {
  const existente = document.getElementById("tokens-tema");
  if (existente) existente.remove();

  const style = document.createElement("style");
  style.id = "tokens-tema";
  style.textContent = gerarVariaveisCss();
  document.head.prepend(style);
}
