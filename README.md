# FixIt Car

## Subir o projeto (localhost)

Na **pasta raiz** do repositório:

```bash
npm install
npm run install:all
npm run dev
```

| Serviço | URL |
|---------|-----|
| App (interface) | http://localhost:5173 |
| API | http://localhost:4000/api/health |

### Só um dos dois

```bash
npm run dev:web   # frontend — porta 5173
npm run dev:api   # backend — porta 4000
```

## Erros comuns

- **`Missing script: "dev"`** — você está na pasta errada. Use a raiz `FixItCar` ou entre em `frontend` / `backend`.
- **`istall` não é comando** — use `npm install`.
- **Página não abre** — confira se os dois terminais estão rodando (`npm run dev` sobe os dois juntos).

## Deploy na Vercel

O repositório inclui `vercel.json` na raiz. Na Vercel, deixe o **Root Directory** vazio (raiz do repo) e faça o redeploy.

- **Build:** instala e compila só o `frontend` → pasta `frontend/dist`
- **API:** o backend Express não roda na Vercel (site estático); login e dados usam `localStorage` no navegador. Para API em produção, hospede o `backend` separadamente (Railway, Render, etc.) e defina `VITE_API_URL` nas variáveis de ambiente da Vercel.
