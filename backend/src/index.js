import express from 'express'
import cors from 'cors'

const PORT = Number(process.env.PORT) || 4000

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.18.178:5173'],
    credentials: true,
  })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'fixitcar-api',
    time: new Date().toISOString(),
  })
})

app.get('/api', (_req, res) => {
  res.json({
    name: 'FixIt Car API',
    health: '/api/health',
    note: 'Frontend demo usa dados locais; esta API está pronta para evoluir (auth, DB).',
  })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Não encontrado' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FixIt Car API — http://localhost:${PORT}/api/health`)
})
