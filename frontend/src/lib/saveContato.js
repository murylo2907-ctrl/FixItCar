const KEY = 'fixitcar_contatos_v1'

export function saveMensagemContato({ nome, contato, mensagem }) {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
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
