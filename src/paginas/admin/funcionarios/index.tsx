import { useMemo, useState } from "react";
import { useFuncionarios } from "../../../hooks/queries/funcionarios";
import { useDentistas } from "../../../hooks/queries/dentistas";
import { useDebounce } from "../../../hooks/useDebounce";
import { VisualizarFuncionario } from "./components/VisualizarFuncionario";
import { CadastrarFuncionario } from "./components/CadastrarFuncionario";
import type { PessoaEquipe, TipoEquipe } from "./tipos";
import "../../../styles/equipe.css";

type Visao = "lista" | "visualizar" | "cadastrar";

export default function FuncionariosAdmin() {
  const { data: funcionarios = [] } = useFuncionarios();
  const { data: dentistas = [] } = useDentistas();

  const [visao, setVisao] = useState<Visao>("lista");
  const [filtroAtivo, setFiltroAtivo] = useState<TipoEquipe | "todos">("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const termoBuscaDebounced = useDebounce(termoBusca, 250);
  const [selecaoId, setSelecaoId] = useState<{
    id: number;
    tipo: TipoEquipe;
  } | null>(null);
  const [fotosLocais, setFotosLocais] = useState<Record<string, string>>({});

  const equipe: PessoaEquipe[] = useMemo(() => {
    const listaFuncionarios: PessoaEquipe[] = funcionarios.map((f) => ({
      id: f.id,
      tipo: f.cargo.toLowerCase() as TipoEquipe,
      cargo: f.cargo,
      nome: f.nome,
      cpf: f.cpf,
      telefone: f.telefone,
      email: f.email,
      dataNascimento: f.dataNascimento,
    }));

    const listaDentistas: PessoaEquipe[] = dentistas.map((d) => ({
      id: d.id,
      tipo: "dentista",
      cargo: "Dentista",
      nome: d.nome,
      cpf: d.cpf,
      telefone: d.telefone,
      email: d.email,
      cro: d.cro,
      especialidade: d.nomeEspecialidade,
    }));

    return [...listaFuncionarios, ...listaDentistas].map((p) => {
      const chave = `${p.tipo}-${p.id}`;
      return fotosLocais[chave] ? { ...p, foto: fotosLocais[chave] } : p;
    });
  }, [funcionarios, dentistas, fotosLocais]);

  const lista = useMemo(() => {
    const termo = termoBuscaDebounced.toLowerCase().trim();
    return equipe.filter((p) => {
      const matchFiltro = filtroAtivo === "todos" || p.tipo === filtroAtivo;
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.cargo.toLowerCase().includes(termo);
      return matchFiltro && matchBusca;
    });
  }, [equipe, filtroAtivo, termoBuscaDebounced]);

  const pessoaSelecionada = selecaoId
    ? (equipe.find((p) => p.id === selecaoId.id && p.tipo === selecaoId.tipo) ??
      null)
    : null;

  const chips: { filtro: TipoEquipe | "todos"; label: string }[] = [
    { filtro: "todos", label: "Todos" },
    { filtro: "secretaria", label: "Secretária" },
    { filtro: "dentista", label: "Dentista" },
    { filtro: "administrador", label: "ADM" },
  ];

  function voltarParaLista() {
    setVisao("lista");
    setSelecaoId(null);
  }

  const titulo =
    visao === "visualizar" && pessoaSelecionada
      ? `Visualizar: ${pessoaSelecionada.nome}`
      : visao === "cadastrar"
        ? "Cadastrar Funcionário"
        : "Funcionários";

  const subtitulo =
    visao === "visualizar" && pessoaSelecionada
      ? pessoaSelecionada.cargo
      : visao === "cadastrar"
        ? "Preencha os dados do novo funcionário"
        : "Gerencie a equipe da Dentu's Clinic";

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{titulo}</h1>
        <p className="page-subtitle">{subtitulo}</p>
      </header>

      {visao === "lista" && (
        <div>
          <div className="toolbar">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar funcionário..."
                autoComplete="off"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <div className="filter-group">
              {chips.map((chip) => (
                <button
                  key={chip.filtro}
                  className={`filter-chip ${filtroAtivo === chip.filtro ? "active" : ""}`}
                  onClick={() => setFiltroAtivo(chip.filtro)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <section className="grid-funcionarios">
            {lista.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-user-xmark" />
                <p>Nenhum funcionário encontrado</p>
              </div>
            ) : (
              lista.map((p) => (
                <article className="card-funcionario" key={`${p.tipo}-${p.id}`}>
                  <div className="card-avatar">
                    {p.foto ? (
                      <img
                        src={p.foto}
                        alt={p.nome}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-user card-avatar-icon" />
                    )}
                  </div>
                  <h3 className="card-nome">{p.nome}</h3>
                  <span className={`cargo-badge ${p.tipo}`}>{p.cargo}</span>
                  <button
                    className="btn-visualizar"
                    title={`Visualizar ${p.nome}`}
                    onClick={() => {
                      setSelecaoId({ id: p.id, tipo: p.tipo });
                      setVisao("visualizar");
                    }}
                  >
                    <i className="fa-solid fa-eye" />
                    Visualizar
                  </button>
                </article>
              ))
            )}
          </section>

          <button
            className="btn-add-funcionario"
            title="Adicionar Funcionário"
            onClick={() => setVisao("cadastrar")}
          >
            <i className="fa-solid fa-plus" />
            <span>Adicionar Funcionário</span>
          </button>
        </div>
      )}

      {visao === "visualizar" && pessoaSelecionada && (
        <VisualizarFuncionario
          pessoa={pessoaSelecionada}
          onVoltar={voltarParaLista}
          onInativado={voltarParaLista}
          onFotoAlterada={(dataUrl) =>
            setFotosLocais((atual) => ({
              ...atual,
              [`${pessoaSelecionada.tipo}-${pessoaSelecionada.id}`]: dataUrl,
            }))
          }
          onCampoSalvo={() => {
            /* a lista é recarregada via invalidação do React Query */
          }}
        />
      )}

      {visao === "cadastrar" && (
        <CadastrarFuncionario
          onCancelar={voltarParaLista}
          onCadastrado={voltarParaLista}
        />
      )}
    </div>
  );
}
