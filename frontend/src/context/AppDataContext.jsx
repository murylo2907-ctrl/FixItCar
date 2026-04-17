import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CHAMADO_STATUS } from '../lib/chamadoFlow.js'

const SNAPSHOT_KEY = 'fixitcar_app_v1'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeSnapshot(raw) {
  return {
    solicitacoes: Array.isArray(raw?.solicitacoes) ? raw.solicitacoes : [],
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
  const [snap, setSnap] = useState(() => load())

  const syncAppData = useCallback(() => {
    setSnap(load())
  }, [])

  const commit = useCallback((updater) => {
    setSnap((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next)
      return next
    })
  }, [])

  const criarChamado = useCallback(
    (motoristaId, { placa, descricao, modelo, usaSeguro }) => {
      const p = String(placa || '').trim()
      const d = String(descricao || '').trim()
      if (!p || !d) return null
      const now = new Date().toISOString()
      const row = {
        id: newId(),
        motoristaId: Number(motoristaId),
        placa: p.toUpperCase(),
        modelo: String(modelo || '').trim(),
        descricao: d,
        usaSeguro: Boolean(usaSeguro),
        status: usaSeguro ? CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO : CHAMADO_STATUS.PENDENTE_MECANICO,
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

  const responderPedidoOrcamento = useCallback(
    (pedidoId, { preco, prazoDias }) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        pedidos: s.pedidos.map((p) =>
          p.id === pedidoId
            ? {
                ...p,
                status: 'respondido',
                preco: Number(preco),
                prazoDias: prazoDias === undefined ? p.prazoDias : Number(prazoDias),
                respondidoAt: now,
              }
            : p
        ),
      }))
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
          return { ...x, status: CHAMADO_STATUS.EM_REPARO, updatedAt: now }
        }),
      }))
    },
    [commit]
  )

  const encaminharSeguradoraParaOficina = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) =>
          x.id === solicitacaoId && x.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
            ? {
                ...x,
                status: CHAMADO_STATUS.EM_ANALISE_MECANICO,
                seguradoraLiberouOficina: true,
                updatedAt: now,
              }
            : x
        ),
      }))
    },
    [commit]
  )

  const finalizarSinistroSeguradora = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) =>
          x.id === solicitacaoId && x.status === CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA
            ? { ...x, status: CHAMADO_STATUS.FINALIZADO_PELA_SEGURADORA, updatedAt: now }
            : x
        ),
      }))
    },
    [commit]
  )

  const enviarAvisoSeguradoraParaMotorista = useCallback((solicitacaoId, { seguradoraId, seguradoraNome, texto }) => {
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
      if (!sol || sol.status !== CHAMADO_STATUS.ENVIADO_PARA_SEGURADORA) return s
      ok = true
      return { ...s, avisosMotorista: [aviso, ...s.avisosMotorista] }
    })
    return ok
  }, [commit])

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

  /** Oficina: triagem recebida */
  const mecanicoConfirmarTriagem = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          const ok =
            x.status === CHAMADO_STATUS.PENDENTE_MECANICO || x.status === CHAMADO_STATUS.PENDENTE_MECANICO_SEGURO
          if (!ok) return x
          return { ...x, status: CHAMADO_STATUS.EM_ANALISE_MECANICO, updatedAt: now }
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
          return {
            ...x,
            status: CHAMADO_STATUS.AGUARDANDO_APROVACAO_CLIENTE,
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

  const mecanicoConcluirServico = useCallback(
    (solicitacaoId) => {
      const now = new Date().toISOString()
      commit((s) => ({
        ...s,
        solicitacoes: s.solicitacoes.map((x) => {
          if (x.id !== solicitacaoId) return x
          const ok = x.status === CHAMADO_STATUS.EM_REPARO || x.status === CHAMADO_STATUS.AGUARDANDO_PECAS
          if (!ok) return x
          return { ...x, status: CHAMADO_STATUS.CONCLUIDO, updatedAt: now }
        }),
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
      responderPedidoOrcamento,
      motoristaAprovarOrcamento,
      encaminharSeguradoraParaOficina,
      finalizarSinistroSeguradora,
      enviarAvisoSeguradoraParaMotorista,
      cadastrarVeiculoSeguradora,
      removerVeiculoSeguradora,
      mecanicoConfirmarTriagem,
      mecanicoEnviarParaSeguradora,
      mecanicoRegistrarOrcamento,
      mecanicoGerarPedidosCotacao,
      mecanicoConcluirServico,
    }),
    [
      snap,
      syncAppData,
      criarChamado,
      responderPedidoOrcamento,
      motoristaAprovarOrcamento,
      encaminharSeguradoraParaOficina,
      finalizarSinistroSeguradora,
      enviarAvisoSeguradoraParaMotorista,
      cadastrarVeiculoSeguradora,
      removerVeiculoSeguradora,
      mecanicoConfirmarTriagem,
      mecanicoEnviarParaSeguradora,
      mecanicoRegistrarOrcamento,
      mecanicoGerarPedidosCotacao,
      mecanicoConcluirServico,
    ]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppDataContext() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppDataContext precisa de AppDataProvider')
  return ctx
}
