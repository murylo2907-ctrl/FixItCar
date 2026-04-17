import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(__dirname, '..', 'data')

const PROFILES_FILE = 'profiles.json'
const APP_SNAPSHOT_FILE = 'appSnapshot.json'

export async function readJsonFile(filename, fallback) {
  const fp = path.join(DATA_DIR, filename)
  try {
    const raw = await fs.readFile(fp, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export async function writeJsonFile(filename, data) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const fp = path.join(DATA_DIR, filename)
  const tmp = `${fp}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data), 'utf8')
  await fs.rename(tmp, fp)
}

export async function loadProfiles() {
  const raw = await readJsonFile(PROFILES_FILE, {})
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
}

export async function saveProfiles(profiles) {
  await writeJsonFile(PROFILES_FILE, profiles)
}

export async function loadAppSnapshot(defaultShape) {
  const raw = await readJsonFile(APP_SNAPSHOT_FILE, null)
  if (!raw || typeof raw !== 'object') return defaultShape
  return {
    ...defaultShape,
    ...raw,
    solicitacoes: Array.isArray(raw.solicitacoes) ? raw.solicitacoes : defaultShape.solicitacoes,
    pedidos: Array.isArray(raw.pedidos) ? raw.pedidos : defaultShape.pedidos,
    veiculosSeguradora: Array.isArray(raw.veiculosSeguradora) ? raw.veiculosSeguradora : defaultShape.veiculosSeguradora,
    avisosMotorista: Array.isArray(raw.avisosMotorista) ? raw.avisosMotorista : defaultShape.avisosMotorista,
  }
}

export async function saveAppSnapshot(snapshot) {
  await writeJsonFile(APP_SNAPSHOT_FILE, snapshot)
}

export { PROFILES_FILE, APP_SNAPSHOT_FILE }
