import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { fetchAppDataFromApi, pushAppDataToApi } from '../lib/apiClient.js'
import { CHAMADO_STATUS, seguradoraPodeAtuarNoChamado } from '../lib/chamadoFlow.js'

const SNAPSHOT_KEY = 'fixitcar_app_v1'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeChecklist(raw) {
  return {
    frente: Boolean(raw?.frente),
    traseira: Boolean(raw?.traseira),
    lados: Boolean(raw?.lados),
    painel: Boolean(raw?.painel),
  }
}

function normalizeLog(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => ({
      id: x?.id || newId(),
      tipo: String(x?.tipo || 'evento'),
      texto: String(x?.texto || '').trim(),
      ator: String(x?.ator || '').trim(),
      createdAt: x?.createdAt || new Date().toISOString(),
    }))
    .filter((x) => x.texto)
}

function migrateSolicitacao(s) {
  if (!s || typeof s !== 'object') return s
  let next = s
  if (s.usaSeguro && s.status === CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE) {
    next = { ...next, status: CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA }
  }
  const checklistBase = normalizeChecklist(next?.checklistFotos)
  return {
    ...next,
    origemPagamento: next?.origemPagamento || (next?.usaSeguro ? 'seguradora' : 'particular'),
    vozCliente: String(next?.vozCliente || ''),
    checklistFotos: checklistBase,
    sinistroNumero: String(next?.sinistroNumero || ''),
    nomePerito: String(next?.nomePerito || ''),
    evidencias: Array.isArray(next?.evidencias) ? next.evidencias : [],
    aditivos: Array.isArray(next?.aditivos) ? next.aditivos : [],
    logDecisoes: normalizeLog(next?.logDecisoes),
    etapaOs: String(next?.etapaOs || 'triagem'),
  }
}

export function normalizeSnapshot(raw) {
  const sol = Array.isArray(raw?.solicitacoes) ? raw.solicitacoes.map(migrateSolicitacao) : []
  return {
    solicitacoes: sol,
    pedidos: Array.isArray(raw?.pedidos) ? raw.pedidos : [],
    veiculosSeguradora: Array.isArray(raw?.veiculosSeguradora) ? raw.veiculosSeguradora : [],
    avisosMotorista: Array.isArray(raw?.avisosMotorista) ? raw.avisosMotorista : [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    return normalizeSnapshot(raw ? JSON.parse(raw) : {})
  } catch {
    return normalizeSnapshot({})
  }
}

function persist(s) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s))
}

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const [snap, setSnap] = useState(() => load())
  const snapRef = useRef(snap)
  const remoteTimerRef = useRef(null)
  snapRef.current = snap

  useEffect(() => {
    if (!isAuthenticated || !token) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchAppDataFromApi(token)
        if (cancelled || !data) return
        const next = normalizeSnapshot(data)
        setSnap(next)
        persist(next)
      } catch {
        /* mantém localStorage */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, token])

  const scheduleRemotePersist = useCallback(
    (nextSnap) => {
      if (!token) return
      if (remoteTimerRef.current) clearTimeout(remoteTimerRef.current)
      remoteTimerRef.current = setTimeout(() => {
        remoteTimerRef.current = null
        pushAppDataToApi(nextSnap, token).catch(() => {})
      }, 450)
    },
    [token]
  )

  const syncAppData = useCallback(() => {
    const local = load()
    setSnap(local)
    if (!token) return
    fetchAppDataFromApi(token)
      .then((data) => {
        if (data && typeof data === 'object') {
          const next = normalizeSnapshot(data)
          setSnap(next)
          persist(next)
        }
      })
      .catch(() => {})
  }, [token])

  const commit = useCallback(
    (updater) => {
      setSnap((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        persist(next)
        snapRef.current = next
        scheduleRemotePersist(next)
        return next
      })
    },
    [scheduleRemotePersist]
  )

  const criarChamado = useCallback(
    (motoristaId, { placa, descricao, modelo, usaSeguro, motoristaNome, triagem = {} }) => {
      const p = String(placa || '').trim()
      const d = String(descricao || '').trim()
      if (!p || !d) return null
      const now = new Date().toISOString()
      const usaSeguroBool = Boolean(usaSeguro)
      const row = {
        id: newId(),
        motoristaId: Number(motoristaId),
        motoristaNome: String(motoristaNome || '').trim(),
        placa: p.toUpperCase(),
        modelo: String(modelo || '').trim(),
        descricao: d,
        usaSeguro: usaSeguroBool,
        origemPagamento: usaSeguroBool ? 'seguradora' : 'particular',
        vozCliente: String(triagem?.vozCliente || '').trim(),
        checklistFotos: normalizeChecklist(triagem?.checklistFotos),
        sinistroNumero: usaSeguroBool ? String(triagem?.sinistroNumero || '').trim() : '',
        nomePerito: usaSeguroBool ? String(triagem?.nomePerito || '').trim() : '',
        evidencias: [],
        aditivos: [],
        logDecisoes: [
          {
            id: newId(),
            tipo: 'abertura',
            texto: `Chamado aberto como ${usaSeguroBool ? 'Seguradora' : 'Particular'}.`,
            ator: 'motorista',
            createdAt: now,
          },
        ],
        etapaOs: 'triagem',
        /** Com seguro: vai direto à seguradora (fluxo acordado). Sem seguro: entrada na oficina. */
        status: usaSeguro ? CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA : CHAMADO_STATUS.PENDENTE_MECANICO,
        seguradoraLiberouOficina: false,
        descricaoMecanico: '',
        pecasSugeridas: [],
        createdAt: now,
        updatedAt: now,
      }
      commit((s) => ({ ...s, solicitacoes: [row, ...s.solicitacoes] }))
      return row
    },
    [commit]
  )

  const motoristaEditarChamado = useCallback(
    (motoristaId, solicitacaoId, { placa, modelo, descricao, usaSeguro: usaSeguroNovo }) => {
      const p = String(placa || '').trim()
      const d = String(descricao || '').trim()
      if (!p || !d) return { ok: false, message: 'Placa e o ocorrido do chamado são obrigatórios.' }
      if (typeof usaSeguroNovo !== 'boolean') {
        return { ok: false, message: 'Indique se possui seguro (Sim ou Não).' }
      }
      const s = snapRef.current
      const sol = s.solicitacoes.find(
        (x) => x.id === solicitacaoId && Number(x.motoristaId) === Number(motoristaId)
      )
      if (!sol) return { ok: false, message: 'Chamado não encontrado.' }
      if (sol.status === CHAMADO_STATUS.CONCLUIDO || sol.status === CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA) {
        return { ok: false, message: 'Não é possível editar um chamado encerrado.' }
      }
      const mudouSeguro = Boolean(sol.usaSeguro) !== usaSeguroNovo
      const estadosOndePodeMudarSeguro =
        sol.status === CHAMADO_STATUS.PENDENTE_MECANICO ||
        sol.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO ||
        sol.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
      if (mudouSeguro && !estadosOndePodeMudarSeguro) {
        return {
          ok: false,
          message:
            'Não é possível alterar o seguro após a oficina ou a seguradora já terem avançado. Edite só placa, modelo e ocorrido, ou o valor atual permanece.',
        }
      }
      const now = new Date().toISOString()
      commit((prev) => {
        const idx = prev.solicitacoes.findIndex((x) => x.id === solicitacaoId)
        if (idx === -1) return prev
        const x = prev.solicitacoes[idx]
        const list = [...prev.solicitacoes]
        let next = {
          ...x,
          placa: p.toUpperCase(),
          modelo: String(modelo || '').trim(),
          descricao: d,
          usaSeguro: usaSeguroNovo,
          updatedAt: now,
        }
        if (mudouSeguro && estadosOndePodeMudarSeguro) {
          if (usaSeguroNovo) {
            next = {
              ...next,
              status: CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA,
              seguradoraLiberouOficina: false,
              seguradoraResponsavelId: undefined,
              seguradoraResponsavelNome: undefined,
            }
          } else {
            next = {
              ...next,
              status: CHAMADO_STATUS.PENDENTE_MECANICO,
              seguradoraLiberouOficina: false,
              seguradoraResponsavelId: undefined,
              seguradoraResponsavelNome: undefined,
            }
          }
        }
        list[idx] = next
        return { ...prev, solicitacoes: list }
      })
      return { ok: true }
    },
    [commit]
  )

  const mecanicoRegistrarEvidencia = useCallback(
    (solicitacaoId, payload) => {
      const now = new Date().toISOString()
      const descricao = String(payload?.descricao || '').trim()
      if (!descricao) return false
      const evidencia = {
        id: newId(),
        descricao,
        tipo: String(payload?.tipo || 'foto').trim() || 'foto',
        lado: String(payload?.lado || '').trim(),
        createdAt: now,
        autor: String(payload?.autor || 'oficina'),
      }
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) =>
          x.id === solicitacaoId
            ? {
                ...x,
                evidencias: [evidencia, ...(x.evidencias || [])],
                logDecisoes: [
                  {
                    id: newId(),
                    tipo: 'evidencia',
                    texto: `Evidência enviada: ${descricao}`,
                    ator: 'oficina',
                    createdAt: now,
                  },
                  ...(x.logDecisoes || []),
                ],
                updatedAt: now,
              }
            : x
        ),
      }))
      return true
    },
    [commit]
  )

  const mecanicoSolicitarAditivo = useCallback(
    (solicitacaoId, payload) => {
      const now = new Date().toISOString()
      const motivo = String(payload?.motivo || '').trim()
      if (motivo.length < 6) return false
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          const aditivo = {
            id: newId(),
            motivo,
            valor: Number.isFinite(Number(payload?.valor)) ? Number(payload.valor) : undefined,
            createdAt: now,
            status: 'pendente',
          }
          const voltaAprovacao = x.usaSeguro
            ? CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA
            : CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE
          return {
            ...x,
            aditivos: [aditivo, ...(x.aditivos || [])],
            status: voltaAprovacao,
            logDecisoes: [
              {
                id: newId(),
                tipo: 'aditivo',
                texto: `Ajuste de orçamento solicitado: ${motivo}`,
                ator: 'oficina',
                createdAt: now,
              },
              ...(x.logDecisoes || []),
            ],
            updatedAt: now,
          }
        }),
      }))
      return true
    },
    [commit]
  )

  const responderPedidoOrcamento = useCallback(
    (pedidoId, { preco, prazoDias, marca, fornecedorNome }) => {
      const now = new Date().toISOString()
      commit((s) => {
        let solicitacaoId = null
        const nextPedidos = s.pedidos.map((p) => {
          if (p.id !== pedidoId) return p
          solicitacaoId = p.solicitacaoId
          return {
            ...p,
            status: 'respondido',
            preco: Number(preco),
            prazoDias: prazoDias === undefined ? p.prazoDias : Number(prazoDias),
            marca: String(marca || p.marca || '').trim(),
            fornecedorNome: String(fornecedorNome || p.fornecedorNome || '').trim(),
            respondidoAt: now,
          }
        })
        if (!solicitacaoId) return { ...s, pedidos: nextPedidos }
        return {
          ...s,
          pedidos: nextPedidos,
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === solicitacaoId
              ? {
                  ...x,
                  logDecisoes: [
                    {
                      id: newId(),
                      tipo: 'cotacao',
                      texto: 'Autopeças enviou cotação de peça.',
                      ator: 'autopecas',
                      createdAt: now,
                    },
                    ...(x.logDecisoes || []),
                  ],
                  updatedAt: now,
                }
              : x
          ),
        }
      })
    },
    [commit]
  )

  const motoristaAprovarOrcamento = useCallback(
    (solicitacaoId, motoristaId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          if (Number(x.motoristaId) !== Number(motoristaId)) return x
          if (x.status !== CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE) return x
          return {
            ...x,
            status: CHAMADO_STATUS.EM_REPARO,
            etapaOs: 'execucao',
            logDecisoes: [
              {
                id: newId(),
                tipo: 'aprovacao',
                texto: 'Motorista aprovou orçamento.',
                ator: 'motorista',
                createdAt: now,
              },
              ...(x.logDecisoes || []),
            ],
            updatedAt: now,
          }
        }),
      }))
    },
    [commit]
  )

  const seguradoraAprovarOrcamento = useCallback(
    (solicitacaoId, seguradoraId) => {
      const now = new Date().toISOString()
      const sid = Number(seguradoraId)
      if (!Number.isFinite(sid)) return
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          if (x.status !== CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA) return x
          if (!seguradoraPodeAtuarNoChamado(x, sid, s.veiculosSeguradora)) return x
          return {
            ...x,
            status: CHAMADO_STATUS.EM_REPARO,
            etapaOs: 'execucao',
            logDecisoes: [
              {
                id: newId(),
                tipo: 'aprovacao',
                texto: 'Seguradora aprovou orçamento.',
                ator: 'seguradora',
                createdAt: now,
              },
              ...(x.logDecisoes || []),
            ],
            updatedAt: now,
          }
        }),
      }))
    },
    [commit]
  )

  const encaminharSeguradoraParaOficina = useCallback(
    (solicitacaoId, opts) => {
      const { seguradoraId, seguradoraNome } = opts || {}
      const sid = Number(seguradoraId)
      const temResponsavel = Number.isFinite(sid)
      const nomeSeg = String(seguradoraNome || '').trim()
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          const podeEncaminhar =
            x.id === solicitacaoId &&
            (x.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
              (x.usaSeguro && x.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO))
          return podeEncaminhar
            ? {
                ...x,
                status: CHAMADO_STATUS.EM_ANALISE_MECANICO,
                seguradoraLiberouOficina: true,
                etapaOs: 'orcamento',
                ...(temResponsavel
                  ? {
                      seguradoraResponsavelId: sid,
                      ...(nomeSeg ? { seguradoraResponsavelNome: nomeSeg } : {}),
                    }
                  : {}),
                updatedAt: now,
              }
            : x
        }),
      }))
    },
    [commit]
  )

  const finalizarSinistroSeguradora = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          const podeFinalizar =
            x.id === solicitacaoId &&
            (x.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
              (x.usaSeguro && x.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO))
          return podeFinalizar ? { ...x, status: CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA, updatedAt: now } : x
        }),
      }))
    },
    [commit]
  )

  const enviarAvisoSeguradoraParaMotorista = useCallback(
    (solicitacaoId, { seguradoraId, seguradoraNome, texto }) => {
      const t = String(texto || '').trim()
      if (t.length < 15) return false
      const now = new Date().toISOString()
      const aviso = {
        id: newId(),
        solicitacaoId,
        seguradoraId: Number(seguradoraId),
        seguradoraNome: String(seguradoraNome || '').trim() || 'Seguradora',
        texto: t,
        createdAt: now,
      }
      let ok = false
      commit((s) => {
        const sol = s.solicitacoes.find((x) => x.id === solicitacaoId)
        const podeAvisoSeguro =
          sol?.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA ||
          (sol?.usaSeguro && sol?.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO)
        if (!sol || !podeAvisoSeguro) return s
        ok = true
        return { ...s, avisosMotorista: [aviso, ...s.avisosMotorista] }
      })
      return ok
    },
    [commit]
  )

  const cadastrarVeiculoSeguradora = useCallback(
    (seguradoraId, { modelo, placa, ano, valorSeguro }) => {
      const m = String(modelo || '').trim()
      const p = String(placa || '').trim()
      const anoNum = Number(ano)
      const val = Number(valorSeguro)
      if (!m || !p) return false
      if (!Number.isFinite(anoNum) || anoNum < 1950 || anoNum > 2100) return false
      if (!Number.isFinite(val) || val < 0) return false
      const now = new Date().toISOString()
      const row = {
        id: newId(),
        seguradoraId: Number(seguradoraId),
        modelo: m,
        placa: p.toUpperCase(),
        ano: anoNum,
        valorSeguro: val,
        createdAt: now,
      }
      commit((s) => ({ ...s, veiculosSeguradora: [row, ...s.veiculosSeguradora] }))
      return true
    },
    [commit]
  )

  const removerVeiculoSeguradora = useCallback(
    (seguradoraId, veiculoId) => {
      commit((s) => ({
        ...s,
        veiculosSeguradora: s.veiculosSeguradora.filter(
          (v) => !(Number(v.seguradoraId) === Number(seguradoraId) && v.id === veiculoId)
        ),
      }))
    },
    [commit]
  )

  const mecanicoConfirmarTriagem = useCallback(
    (solicitacaoId, { mecanicoId, mecanicoNome } = {}) => {
      const now = new Date().toISOString()
      const midRaw = mecanicoId != null ? Number(mecanicoId) : NaN
      const mid = Number.isFinite(midRaw) ? midRaw : null
      const nomeOficina = String(mecanicoNome || '').trim() || 'Oficina'
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          const ok =
            x.status === CHAMADO_STATUS.PENDENTE_MECANICO || x.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO
          if (!ok) return x
          const already = x.mecanicoId != null && x.mecanicoId !== ''
          if (already && mid != null && Number(x.mecanicoId) !== mid) return x
          return {
            ...x,
            status: CHAMADO_STATUS.EM_ANALISE_MECANICO,
            etapaOs: 'orcamento',
            updatedAt: now,
            ...(!already && mid != null
              ? {
                  mecanicoId: mid,
                  mecanicoNome: nomeOficina,
                }
              : {}),
          }
        }),
      }))
    },
    [commit]
  )

  const mecanicoEnviarParaSeguradora = useCallback(
    (solicitacaoId, descricaoMecanico) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          if (x.status !== CHAMADO_STATUS.EM_ANALISE_MECANICO || !x.usaSeguro) return x
          if (x.seguradoraLiberouOficina) return x
          return {
            ...x,
            status: CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA,
            descricaoMecanico: String(descricaoMecanico || '').trim() || x.descricaoMecanico,
            updatedAt: now,
          }
        }),
      }))
    },
    [commit]
  )

  const mecanicoRegistrarOrcamento = useCallback(
    (solicitacaoId, descricaoMecanico, pecasSugeridas) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          if (x.status !== CHAMADO_STATUS.EM_ANALISE_MECANICO) return x
          if (x.usaSeguro && !x.seguradoraLiberouOficina) return x
          const pecas = Array.isArray(pecasSugeridas) ? pecasSugeridas : []
          const proxStatus = x.usaSeguro
            ? CHAMADO_STATUS.AGUARDANDO_APROVACAO_SEGURADORA
            : CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE
          return {
            ...x,
            status: proxStatus,
            etapaOs: 'aprovacao',
            descricaoMecanico: String(descricaoMecanico || '').trim(),
            pecasSugeridas: pecas.map((p) => ({
              nome: String(p.nome || '').trim(),
              qtd: Math.max(1, Number(p.qtd) || 1),
              precoUnitario: Number.isFinite(Number(p.precoUnitario)) ? Number(p.precoUnitario) : undefined,
            })),
            updatedAt: now,
          }
        }),
      }))
    },
    [commit]
  )

  const mecanicoGerarPedidosCotacao = useCallback(
    (solicitacaoId, mecanicaNome) => {
      const now = new Date().toISOString()
      commit((s) => {
        const sol = s.solicitacoes.find((x) => x.id === solicitacaoId)
        if (!sol || sol.status !== CHAMADO_STATUS.EM_REPARO) return s
        const pecas = Array.isArray(sol.pecasSugeridas) ? sol.pecasSugeridas : []
        if (!pecas.length) return s
        const novos = pecas.map((p) => ({
          id: newId(),
          solicitacaoId: sol.id,
          pecaNome: p.nome,
          qtd: Math.max(1, Number(p.qtd) || 1),
          placa: sol.placa,
          mecanicaNome: String(mecanicaNome || '').trim() || 'Oficina',
          status: 'pendente',
          fornecedorNome: '',
          marca: '',
          precoUnitarioReferencia: Number.isFinite(Number(p.precoUnitario)) ? Number(p.precoUnitario) : undefined,
          createdAt: now,
        }))
        return {
          ...s,
          pedidos: [...novos, ...s.pedidos],
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === solicitacaoId ? { ...x, status: CHAMADO_STATUS.AGUARDANDO_PECAS, updatedAt: now } : x
          ),
        }
      })
    },
    [commit]
  )

  const dispararCotacaoRede = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        pedidos: s.pedidos.map((p) =>
          p.solicitacaoId === solicitacaoId && (p.status === 'pendente' || p.status === 'em_analise')
            ? { ...p, status: 'em_analise', requestedAt: now }
            : p
        ),
      }))
    },
    [commit]
  )

  const oficinaComprarPecasHibrido = useCallback(
    (solicitacaoId, selecoes = []) => {
      const now = new Date().toISOString()
      const ids = new Set((selecoes || []).map((x) => x.id))
      commit((s) => ({
        ...s,
        pedidos: s.pedidos.map((p) => {
          if (p.solicitacaoId !== solicitacaoId || !ids.has(p.id)) return p
          const escolhido = selecoes.find((x) => x.id === p.id)
          return {
            ...p,
            status: 'comprado',
            fornecedorEscolhido: String(escolhido?.fornecedor || p.fornecedorNome || 'Fornecedor'),
            preco: Number.isFinite(Number(escolhido?.preco)) ? Number(escolhido.preco) : p.preco,
            prazoDias: Number.isFinite(Number(escolhido?.prazoDias)) ? Number(escolhido.prazoDias) : p.prazoDias,
            marca: String(escolhido?.marca || p.marca || '').trim(),
            compradoAt: now,
          }
        }),
      }))
    },
    [commit]
  )

  const mecanicoConcluirServico = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => {
        let fechou = false
        const solicitacoes = s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          const ok = x.status === CHAMADO_STATUS.EM_REPARO || x.status === CHAMADO_STATUS.AGUARDANDO_PECAS
          if (!ok) return x
          fechou = true
          return { ...x, status: CHAMADO_STATUS.CONCLUIDO, etapaOs: 'pronto', updatedAt: now }
        })
        if (!fechou) return s
        const pedidos = s.pedidos.map((p) =>
          p.solicitacaoId === solicitacaoId && p.status !== 'comprado'
            ? { ...p, status: 'comprado', compradoAt: now, autoEncerrado: true }
            : p
        )
        return { ...s, solicitacoes, pedidos }
      })
    },
    [commit]
  )

  const marcarAvisoMotoristaComoLido = useCallback(
    (avisoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        avisosMotorista: s.avisosMotorista.map((a) =>
          a.id === avisoId ? { ...a, lida: true, lidaAt: now } : a
        ),
      }))
    },
    [commit]
  )

  const value = useMemo(
    () => ({
      solicitacoes: snap.solicitacoes,
      pedidos: snap.pedidos,
      veiculosSeguradora: snap.veiculosSeguradora,
      avisosMotorista: snap.avisosMotorista,
      syncAppData,
      criarChamado,
      motoristaEditarChamado,
      mecanicoRegistrarEvidencia,
      mecanicoSolicitarAditivo,
      responderPedidoOrcamento,
      motoristaAprovarOrcamento,
      seguradoraAprovarOrcamento,
      encaminharSeguradoraParaOficina,
      finalizarSinistroSeguradora,
      enviarAvisoSeguradoraParaMotorista,
      cadastrarVeiculoSeguradora,
      removerVeiculoSeguradora,
      mecanicoConfirmarTriagem,
      mecanicoEnviarParaSeguradora,
      mecanicoRegistrarOrcamento,
      mecanicoGerarPedidosCotacao,
      dispararCotacaoRede,
      oficinaComprarPecasHibrido,
      mecanicoConcluirServico,
      marcarAvisoMotoristaComoLido,
    }),
    [
      snap,
      syncAppData,
      criarChamado,
      motoristaEditarChamado,
      mecanicoRegistrarEvidencia,
      mecanicoSolicitarAditivo,
      responderPedidoOrcamento,
      motoristaAprovarOrcamento,
      seguradoraAprovarOrcamento,
      encaminharSeguradoraParaOficina,
      finalizarSinistroSeguradora,
      enviarAvisoSeguradoraParaMotorista,
      cadastrarVeiculoSeguradora,
      removerVeiculoSeguradora,
      mecanicoConfirmarTriagem,
      mecanicoEnviarParaSeguradora,
      mecanicoRegistrarOrcamento,
      mecanicoGerarPedidosCotacao,
      dispararCotacaoRede,
      oficinaComprarPecasHibrido,
      mecanicoConcluirServico,
      marcarAvisoMotoristaComoLido,
    ]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppDataContext() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppDataContext precisa de AppDataProvider')
  return ctx
}
