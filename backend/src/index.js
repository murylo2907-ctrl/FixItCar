import express from 'express'
import cors from 'cors'
import { authMiddleware } from './authMiddleware.js'
import { loadProfiles, saveProfiles, loadAppSnapshot, saveAppSnapshot } from './storage.js'

const PORT = Number(process.env.PORT) || 4000

function normalizeAppSnapshot(raw) {
  return {
    solicitacoes: Array.isArray(raw?.solicitacoes) ? raw.solicitacoes : [],
    pedidos: Array.isArray(raw?.pedidos) ? raw.pedidos : [],
    veiculosSeguradora: Array.isArray(raw?.veiculosSeguradora) ? raw.veiculosSeguradora : [],
    avisosMotorista: Array.isArray(raw?.avisosMotorista) ? raw.avisosMotorista : [],
  }
}

const EMPTY_SNAPSHOT = normalizeAppSnapshot({})

const app = express()

app.use(
  cors({
    origin: [
      'http://localhost:51573',
      'http://127.0.0.1:51573',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.18.178:51573',
      'http://192.168.18.178:5173',
    ],
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))

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
    perfil: 'GET/PUT /api/perfil/me (Bearer)',
    appData: 'GET/PUT /api/app-data (Bearer)',
  })
})

app.get('/api/perfil/me', authMiddleware, async (req, res) => {
  try {
    const key = String(req.user.userId)
    const all = await loadProfiles()
    const profile = all[key] && typeof all[key] === 'object' ? all[key] : {}
    res.json({ profile })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler perfil.' })
  }
})

app.put('/api/perfil/me', authMiddleware, async (req, res) => {
  try {
    const key = String(req.user.userId)
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {}
    const all = await loadProfiles()
    const prev = all[key] && typeof all[key] === 'object' ? all[key] : {}
    all[key] = { ...prev, ...body }
    await saveProfiles(all)
    res.json({ ok: true, profile: all[key] })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar perfil.' })
  }
})

app.get('/api/app-data', authMiddleware, async (_req, res) => {
  try {
    const snap = await loadAppSnapshot(EMPTY_SNAPSHOT)
    res.json(normalizeAppSnapshot(snap))
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler dados do app.' })
  }
})

app.put('/api/app-data', authMiddleware, async (req, res) => {
  try {
    const next = normalizeAppSnapshot(req.body || {})
    await saveAppSnapshot(next)
    res.json({ ok: true, ...next })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar dados do app.' })
  }
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Não encontrado' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FixIt Car API — http://localhost:${PORT}/api/health`)
})
