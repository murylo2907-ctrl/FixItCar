const AUTH_KEY = 'fixitcar_auth_v1'

export function apiUrl(path) {
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? `${base}${p}` : p
}

export function getStoredToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p.token || null
  } catch {
    return null
  }
}

async function parseJson(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function apiGet(path, token = getStoredToken()) {
  const res = await fetch(apiUrl(path), {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  const data = await parseJson(res)
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Erro na requisição'
    throw new Error(msg)
  }
  return data
}

export async function apiPut(path, body, token = getStoredToken()) {
  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Erro na requisição'
    throw new Error(msg)
  }
  return data
}

export async function fetchAppDataFromApi(token) {
  return apiGet('/api/app-data', token)
}

export async function pushAppDataToApi(snapshot, token) {
  return apiPut('/api/app-data', snapshot, token)
}

export async function fetchPerfilFromApi(token) {
  const data = await apiGet('/api/perfil/me', token)
  return data?.profile && typeof data.profile === 'object' ? data.profile : {}
}

export async function pushPerfilToApi(patch, token) {
  return apiPut('/api/perfil/me', patch, token)
}
