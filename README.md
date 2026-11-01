# Dentus Clinic — Sistema Web

Sistema web da clínica odontológica Dentu's Clinic, usado por administrador, recepcionista e dentista.

React 19 · TypeScript · Vite · TanStack Query · React Bootstrap

O paciente não usa este sistema: ele tem o aplicativo mobile.

## Estrutura

```text
src/
├── componentes/     # Componentes compartilhados (Odontograma, CalendarioSemanal, Sidebar)
├── contexts/        # Autenticação e tema
├── hooks/
│   └── queries/     # Hooks de dados (TanStack Query), um por recurso
├── layouts/         # Layout público e autenticado
├── paginas/
│   ├── admin/       # Funcionários, serviços, pacientes
│   ├── dentista/    # Agenda, dashboard, pacientes, tratamentos
│   ├── recepcionista/ # Agenda, dashboard, pacientes, funcionários
│   └── login/
├── routes/          # Rotas e proteção por perfil
├── services/        # Chamadas HTTP, uma por recurso
├── styles/          # Cores e estilos globais
├── types/           # Tipos do domínio
└── utils/           # Formatadores, validadores, datas
```

Os componentes de tela não chamam a API direto: eles usam um hook de `hooks/queries`, que usa um service de `services/`. Isso mantém cache, recarregamento e tratamento de erro num lugar só.

## Como rodar

```bash
npm install
cp .env.example .env    # e preencha o endereço da API
npm run dev
```

O sistema abre em `http://localhost:3000`.

Precisa do backend no ar. Na pasta da API:

```bash
dotnet run
```

## Configuração

O `.env` **não é versionado**. Só tem uma variável:

```ini
VITE_API_BASE=http://localhost:5081
```

O Vite usa esse valor de duas formas: como destino do proxy de `/api` e como base das chamadas. O navegador sempre fala com `localhost:3000/api`, e o Vite repassa para a API — por isso não há problema de CORS em desenvolvimento.

**Ao mudar o `.env`, reinicie o `npm run dev`.** O proxy lê a variável só na subida do servidor; sem reiniciar, o sistema continua conversando com o endereço antigo e os dados parecem desatualizados sem explicação.

## Perfis e acesso

O login é o mesmo para todos; o que muda é o perfil que vem no token.

| Perfil | Telas |
|---|---|
| `ADMINISTRADOR` | funcionários, serviços, pacientes |
| `SECRETARIA` | agenda, consultas, pacientes, funcionários |
| `DENTISTA` | agenda própria, pacientes, tratamentos e prontuários |

As rotas são protegidas por `routes/RotaProtegida.tsx`. A sessão fica em `sessionStorage`, então fechar a aba encerra o acesso.

Usuários de exemplo criados pelo backend:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@dentusclinic.com` | `Admin@123` |
| Dentista | `ana.souza@dentusclinic.com` | `Dentista@123` |
| Recepcionista | `julia.mendes@dentusclinic.com` | `Secretaria@123` |

## Pontos de atenção

**A agenda e o painel se atualizam sozinhos a cada 15 segundos.** O paciente confirma a consulta pelo aplicativo, sem passar por esta tela — sem o recarregamento automático, a recepção só veria a resposta ao atualizar a página. Voltar para a aba também força uma atualização na hora.

**Registro de prontuário não é editado.** Finalizar uma consulta cria um registro novo; a tela de prontuário do dentista é somente leitura. Isso é exigência legal, não decisão de interface.

**A senha temporária do paciente aparece uma única vez**, na confirmação do cadastro. Ela não é recuperável depois: se for perdida, o paciente precisa ser cadastrado de novo ou ter a senha trocada por quem tem acesso ao banco.

**Consulta tem duas situações diferentes.** O `status` é o andamento na clínica (Agendada, Em Fila, Em Consulta, Encerrada, Cancelada), controlado pelas setas no painel. O `statusConfirmacao` é a resposta do paciente ao aviso (Pendente, Confirmada, Recusada) e aparece no modal da agenda, onde a recepção também pode registrá-la por telefone.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento na porta 3000 |
| `npm run build` | checa os tipos e gera o build de produção |
| `npm run lint` | oxlint |
| `npm run preview` | serve o build gerado |
