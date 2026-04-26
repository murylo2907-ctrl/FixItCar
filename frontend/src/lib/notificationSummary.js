import { CHAMADO_STATUS, seguradoraPodeAtuarNoChamado } from './chamadoFlow.js'

/** Resumo para sino de notificações (marketing + dashboard). */
export function getNotificationSummary(user, solicitacoes, avisosMotorista, pedidos, veiculosSeguradora = []) {
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
    const aguardandoPecas = solicitacoes.filter((s) => s.status === CHAMADO_STATUS.AGUARDANDO_PECAS).length
    const cotacoesRespondidas = pedidos.filter((p) => p.status === 'respondido' && p.solicitacaoId).length
    return {
      listaNotificacoes: [],
      totalBadge: triagem + aguardandoPecas + cotacoesRespondidas,
      pendentesOrcamento: aguardandoPecas,
    }
  }
  if (user.role === 'autopecas') {
    const nPend = pedidos.filter((p) => (p.status === 'pendente' || p.status === 'em_analise') && p.solicitacaoId).length
    const n = nPend
    return { listaNotificacoes: [], totalBadge: n, pendentesOrcamento: 0 }
  }
  if (user.role === 'seguradora') {
    const nSinistros = solicitacoes.filter(
      (s) =>
        s.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
        (s.usaSeguro && s.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO)
    ).length
    const pendentesOrcSeg = solicitacoes.filter(
      (s) =>
        s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA && seguradoraPodeAtuarNoChamado(s, uid, veiculosSeguradora)
    ).length
    const n = nSinistros + pendentesOrcSeg
    return { listaNotificacoes: [], totalBadge: n, pendentesOrcamento: pendentesOrcSeg }
  }
  if (user.role === 'administrador') {
    return { listaNotificacoes: [], totalBadge: 0, pendentesOrcamento: 0 }
  }
  return { listaNotificacoes: [], totalBadge: 0, pendentesOrcamento: 0 }
}
