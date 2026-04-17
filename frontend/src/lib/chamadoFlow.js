/** Fluxo de chamado (demo local). Mantém strings estáveis para localStorage. */
export const CHAMADO_STATUS = {
  PENDENTE_MECANICO: 'pendente_mecanico',
  PENDENTE_MECANICO_SEGURO: 'pendente_mecanico_seguro',
  EM_ANALISE_MECANICO: 'em_analise_mecanico',
  ENVIADO_PARA_SEGURADORA: 'enviado_seguradora',
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
  [CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE]: 55,
  [CHAMADO_STATUS.EM_REPARO]: 75,
  [CHAMADO_STATUS.AGUARDANDO_PECAS]: 88,
  [CHAMADO_STATUS.CONCLUIDO]: 100,
  [CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA]: 100,
}

export function progressoMotoristaChamado(status) {
  return PROGRESSO[status] ?? 10
}
