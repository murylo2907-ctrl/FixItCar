/**
 * Fila / ordens: chamado ainda sem oficina atribuída (legado) ou atribuído ao mecânico logado.
 */
export function solicitacaoVisivelParaMecanico(s, userId) {
  if (s.mecanicoId == null || s.mecanicoId === '') return true
  if (userId == null || userId === '') return false
  return Number(s.mecanicoId) === Number(userId)
}

/**
 * Histórico: concluídos sem dono (legado) ou concluídos por esta oficina.
 */
export function solicitacaoHistoricoMecanico(s, userId) {
  if (s.mecanicoId == null || s.mecanicoId === '') return true
  if (userId == null || userId === '') return false
  return Number(s.mecanicoId) === Number(userId)
}
