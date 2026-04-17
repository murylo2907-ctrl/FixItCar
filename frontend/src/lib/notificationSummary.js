import { CHAMADO_STATUS } from './chamadoFlow.js'

/** Resumo para sino de notificações (marketing + dashboard). */
export function getNotificationSummary(user, solicitacoes, avisosMotorista, pedidos) {
  if (!user?.role) return { listaNotificacoes: [], totalBadge: 0, pendentesOrcamento: 0 }
  const uid = Number(user.id)
  if (user.role === 'motorista') {
    const meusIds = new Set(solicitacoes.filter((s) => Number(s.motoristaId) === uid).map((s) => s.id))
    const avisos = (avisosMotorista || [])
      .filter((a) => meusIds.has(a.solicitacaoId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const nAvisosNaoLidos = avisos.filter((a) => !a.lida).length
    const pendentesOrc = solicitacoes.filter(
      (s) => Number(s.motoristaId) === uid && s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE
    ).length
    return {
      listaNotificacoes: avisos,
      totalBadge: nAvisosNaoLidos + pendentesOrc,
      pendentesOrcamento: pendentesOrc,
    }
  }
  if (user.role === 'mecanico') {
    const triagem = solicitacoes.filter(
      (s) =>
        s.status === CHAMADO_STATUS.PENDENTE_MECANICO || s.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO
    ).length
    return { listaNotificacoes: [], totalBadge: triagem, pendentesOrcamento: 0 }
  }
  if (user.role === 'autopecas') {
    const n = pedidos.filter((p) => p.status === 'pendente' && p.solicitacaoId).length
    return { listaNotificacoes: [], totalBadge: n, pendentesOrcamento: 0 }
  }
  if (user.role === 'seguradora') {
    const n = solicitacoes.filter(
      (s) =>
        s.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
        (s.usaSeguro && s.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO)
    ).length
    return { listaNotificacoes: [], totalBadge: n, pendentesOrcamento: 0 }
  }
  return { listaNotificacoes: [], totalBadge: 0, pendentesOrcamento: 0 }
}
