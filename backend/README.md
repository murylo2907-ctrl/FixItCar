# FixIt Car — API (demo)

## Subir o servidor

```bash
cd backend
npm install
npm run dev
```

A API escuta em `http://localhost:4000` por padrão (`PORT` opcional).

## Rotas

- `GET /api/health` — status
- `GET/PUT /api/perfil/me` — perfil do usuário (header `Authorization: Bearer <token>` do login demo)
- `GET/PUT /api/app-data` — snapshot global do app (chamados, pedidos, etc.)

Os dados ficam em `backend/data/` (JSON, ignorados pelo Git).

## Frontend

Com o Vite em desenvolvimento, o proxy encaminha `/api` para esta porta. Opcionalmente defina `VITE_API_URL=http://localhost:4000` no frontend.
