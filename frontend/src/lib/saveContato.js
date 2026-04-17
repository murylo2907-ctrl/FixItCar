const KEY = 'fixitcar_contatos_v1'

function readList() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** Mensagens do «Fale conosco» (mais recentes primeiro). */
export function loadMensagensContato() {
  return readList()
    .filter((r) => r && r.id)
    .sort((a, b) => {
      const ta = new Date(a.criadoEm || 0).getTime()
      const tb = new Date(b.criadoEm || 0).getTime()
      return tb - ta
    })
}

/**
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function removeMensagemContato(id) {
  if (id == null) return { ok: false, message: 'Mensagem inválida.' }
  const list = readList()
  const next = list.filter((r) => String(r.id) !== String(id))
  if (next.length === list.length) return { ok: false, message: 'Mensagem não encontrada.' }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Não foi possível excluir. Tente novamente.' }
  }
}

export function saveMensagemContato({ nome, contato, mensagem }) {
  try {
    const list = readList()
    const row = {
      id: crypto.randomUUID(),
      nome: String(nome || '').trim(),
      contato: String(contato || '').trim(),
      mensagem: String(mensagem || '').trim(),
      criadoEm: new Date().toISOString(),
    }
    if (!row.nome || !row.contato || !row.mensagem) return { ok: false, message: 'Preencha todos os campos.' }
    list.push(row)
    localStorage.setItem(KEY, JSON.stringify(list))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Não foi possível salvar. Tente novamente.' }
  }
}
