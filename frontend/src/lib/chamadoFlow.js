/** Fluxo de chamado (demo local). Mantém strings estáveis para localStorage. */
export const CHAMADO_STATUS = {
  PENDENTE_MECANICO: 'pendente_mecanico',
  PENDENTE_MECANICO_SEGURO: 'pendente_mecanico_seguro',
  EM_ANALISE_MECANICO: 'em_analise_mecanico',
  ENVIADO_PARA_SEGURADORA: 'enviado_seguradora',
  /** Com seguro: aprovação do orçamento fica com a seguradora, não com o motorista. */
  AGUARDANDO_APROVACAO_SEGURADORA: 'aguardando_aprovacao_seguradora',
  AGUARDANDO_APROVACAO_CLIENTE: 'aguardando_aprovacao_cliente',
  EM_REPARO: 'em_reparo',
  AGUARDANDO_PECAS: 'aguardando_pecas',
  CONCLUIDO: 'concluido',
  FINALIZADO_PELA_SEGURADORA: 'finalizado_seguradora',
}

const LABELS = {
  [CHAMADO_STATUS.PENDENTE_MECANICO]: 'Aguardando triagem na oficina',
  [CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO]: 'Aguardando triagem (com seguro)',
  [CHAMADO_STATUS.EM_ANALISE_MECANICO]: 'Em análise na oficina',
  [CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA]: 'Enviado à seguradora',
  [CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA]: 'Aguardando aprovação do orçamento (seguradora)',
  [CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE]: 'Aguardando sua aprovação do orçamento',
  [CHAMADO_STATUS.EM_REPARO]: 'Reparo em andamento',
  [CHAMADO_STATUS.AGUARDANDO_PECAS]: 'Aguardando peças / cotações',
  [CHAMADO_STATUS.CONCLUIDO]: 'Concluído',
  [CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA]: 'Encerrado pela seguradora',
}

export function labelChamadoStatus(status) {
  return LABELS[status] || String(status || '—')
}

export function chavePlacaComparacao(placa) {
  return String(placa || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export function totalPecasSugeridas(pecas) {
  if (!Array.isArray(pecas) || pecas.length === 0) return 0
  return pecas.reduce((acc, p) => {
    const u = Number(p?.precoUnitario)
    const q = Math.max(1, Number(p?.qtd) || 1)
    if (!Number.isFinite(u) || u < 0) return acc
    return acc + u * q
  }, 0)
}

export function diasCorridosEntre(inicio, fim) {
  const a = new Date(inicio).getTime()
  const b = new Date(fim).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  const ms = b - a
  if (ms < 0) return 0
  return Math.ceil(ms / 86400000)
}

export function textoPrazoDiasCorridos(dias) {
  if (dias == null) return '—'
  if (dias <= 0) return 'No mesmo dia'
  if (dias === 1) return '1 dia'
  return `${dias} dias`
}

const PROGRESSO = {
  [CHAMADO_STATUS.PENDENTE_MECANICO]: 15,
  [CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO]: 18,
  [CHAMADO_STATUS.EM_ANALISE_MECANICO]: 35,
  [CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA]: 45,
  [CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA]: 55,
  [CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE]: 55,
  [CHAMADO_STATUS.EM_REPARO]: 75,
  [CHAMADO_STATUS.AGUARDANDO_PECAS]: 88,
  [CHAMADO_STATUS.CONCLUIDO]: 100,
  [CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA]: 100,
}

export function progressoMotoristaChamado(status) {
  return PROGRESSO[status] ?? 10
}

export const ETAPAS_OS = ['orcamento', 'aguardando_pecas', 'execucao', 'pronto']

export function labelEtapaOs(etapa) {
  return (
    {
      orcamento: 'Orçamento',
      aguardando_pecas: 'Aguardando peças',
      execucao: 'Execução',
      pronto: 'Pronto',
    }[etapa] || 'Orçamento'
  )
}

export function etapaOsFromStatus(status, etapaOs) {
  if (etapaOs === 'lavagem') return 'execucao'
  if (etapaOs && ETAPAS_OS.includes(etapaOs)) return etapaOs
  if (status === CHAMADO_STATUS.AGUARDANDO_PECAS) return 'aguardando_pecas'
  if (status === CHAMADO_STATUS.CONCLUIDO || status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA) return 'pronto'
  if (status === CHAMADO_STATUS.EM_REPARO) return 'execucao'
  return 'orcamento'
}

export function semaforoStatus(status) {
  if (
    status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA ||
    status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
  ) {
    return { cor: 'vermelho', classe: 'text-red-700 bg-red-50 border-red-100' }
  }
  if (status === CHAMADO_STATUS.AGUARDANDO_PECAS) {
    return { cor: 'amarelo', classe: 'text-amber-800 bg-amber-50 border-amber-100' }
  }
  if (status === CHAMADO_STATUS.EM_REPARO || status === CHAMADO_STATUS.CONCLUIDO) {
    return { cor: 'verde', classe: 'text-emerald-800 bg-emerald-50 border-emerald-100' }
  }
  return { cor: 'azul', classe: 'text-sky-800 bg-sky-50 border-sky-100' }
}

/**
 * Indica se a seguradora logada pode aprovar orçamento / atuar no chamado.
 * Usa o vínculo definido ao encaminhar à oficina; se ausente (dados antigos), cai na placa no cadastro de veículos.
 */
export function seguradoraPodeAtuarNoChamado(solicitacao, seguradoraId, veiculosSeguradora) {
  const sid = Number(seguradoraId)
  if (!solicitacao || !Number.isFinite(sid)) return false
  if (Number(solicitacao.seguradoraResponsavelId) === sid) return true
  if (solicitacao.seguradoraResponsavelId != null && solicitacao.seguradoraResponsavelId !== '') return false
  const alvo = chavePlacaComparacao(solicitacao.placa)
  if (!alvo) return false
  for (const v of veiculosSeguradora || []) {
    if (Number(v.seguradoraId) === sid && chavePlacaComparacao(v.placa) === alvo) return true
  }
  return false
}
