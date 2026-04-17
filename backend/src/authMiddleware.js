/**
 * Token demo: mesmo formato do frontend (btoa(JSON.stringify({ sub, email, role, t }))).
 */
export function decodeDemoToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const json = Buffer.from(token, 'base64').toString('utf8')
    const p = JSON.parse(json)
    const sub = p.sub
    if (sub == null || sub === '') return null
    return {
      userId: Number(sub) || String(sub),
      email: p.email,
      role: p.role,
    }
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  const raw = m ? m[1].trim() : null
  const session = decodeDemoToken(raw)
  if (!session) {
    res.status(401).json({ error: 'Não autorizado. Faça login novamente.' })
    return
  }
  req.user = session
  next()
}
