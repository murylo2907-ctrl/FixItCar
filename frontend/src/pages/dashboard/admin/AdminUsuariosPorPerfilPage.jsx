import { useMemo, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal.jsx'
import PasswordField from '../../../components/ui/PasswordField.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import {
  loadRegisteredUsers,
  removeRegisteredUser,
  saveRegisteredUser,
  updateRegisteredUser,
} from '../../../lib/localRegistry.js'

const MODULOS = {
  motoristas: { role: 'motorista', titulo: 'Motoristas' },
  mecanicos: { role: 'mecanico', titulo: 'Oficina / Mecânica' },
  autopecas: { role: 'autopecas', titulo: 'Autopeças' },
  seguradoras: { role: 'seguradora', titulo: 'Seguradoras' },
}

const ROLE_LABEL = {
  motorista: 'Motorista',
  mecanico: 'Oficina / Mecânica',
  autopecas: 'Autopeças',
  seguradora: 'Seguradora',
  administrador: 'Administrador',
}

export default function AdminUsuariosPorPerfilPage() {
  const { modulo } = useParams()
  const navigate = useNavigate()
  const { user: sessionUser, updateUser, logout } = useAuth()
  const [busca, setBusca] = useState('')
  const [tick, setTick] = useState(0)
  const [modalCriar, setModalCriar] = useState(false)
  const [editando, setEditando] = useState(null)
  const [erroForm, setErroForm] = useState('')

  const cfg = MODULOS[modulo]
  if (!cfg) {
    return <Navigate to="/dashboard/admin/motoristas" replace />
  }

  const roleAlvo = cfg.role

  const usuarios = useMemo(() => {
    void tick
    const q = busca.trim().toLowerCase()
    return loadRegisteredUsers()
      .filter((u) => u.role === roleAlvo)
      .filter((u) => {
        if (!q) return true
        return (
          String(u.nome || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => Number(a.id) - Number(b.id))
  }, [roleAlvo, busca, tick])

  function recarregar() {
    setTick((t) => t + 1)
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{cfg.titulo}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Usuários cadastrados neste navegador com perfil {ROLE_LABEL[roleAlvo] || roleAlvo}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErroForm('')
            setModalCriar(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 text-white font-semibold text-sm px-4 py-2.5 shadow-sm hover:bg-violet-700 shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Novo
        </button>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm"
              aria-label="Buscar usuários"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Nenhum usuário neste módulo.
                  </td>
                </tr>
              ) : (
                usuarios.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 tabular-nums text-slate-600">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.nome}</td>
                    <td className="px-4 py-3 text-slate-700">{row.email}</td>
                    <td className="px-4 py-3 text-slate-600">{ROLE_LABEL[row.role] || row.role}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 ring-1 ring-emerald-200/80">
                        Ativo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setErroForm('')
                          setEditando(row)
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-violet-600 hover:bg-violet-50 mr-1"
                        title="Editar"
                        aria-label={`Editar ${row.nome}`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Excluir o usuário ${row.nome} (${row.email})? Esta ação não pode ser desfeita.`
                            )
                          ) {
                            return
                          }
                          const r = removeRegisteredUser(row.id)
                          if (!r.ok) {
                            alert(r.message)
                            return
                          }
                          if (Number(sessionUser?.id) === Number(row.id)) {
                            logout()
                            navigate('/login', { replace: true })
                            return
                          }
                          recarregar()
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Excluir"
                        aria-label={`Excluir ${row.nome}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalCriar} title={`Novo — ${cfg.titulo}`} onClose={() => setModalCriar(false)}>
        <FormCriarUsuario
          roleFixo={roleAlvo}
          erroExterno={erroForm}
          setErroExterno={setErroForm}
          onSucesso={() => {
            setModalCriar(false)
            recarregar()
          }}
          onCancelar={() => setModalCriar(false)}
        />
      </Modal>

      <Modal open={Boolean(editando)} title={`Editar — ${editando?.nome || ''}`} onClose={() => setEditando(null)}>
        {editando ? (
          <FormEditarUsuario
            usuario={editando}
            roleFixo={roleAlvo}
            sessionUserId={sessionUser?.id}
            erroExterno={erroForm}
            setErroExterno={setErroForm}
            onSucesso={(patchSync) => {
              setEditando(null)
              if (patchSync && Number(sessionUser?.id) === Number(editando.id)) {
                updateUser(patchSync)
              }
              recarregar()
            }}
            onCancelar={() => setEditando(null)}
          />
        ) : null}
      </Modal>
    </>
  )
}

function FormCriarUsuario({ roleFixo, erroExterno, setErroExterno, onSucesso, onCancelar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')

  function submit(e) {
    e.preventDefault()
    setErroExterno('')
    if (senha !== senha2) {
      setErroExterno('As senhas não coincidem.')
      return
    }
    const r = saveRegisteredUser({ nome, email, senha, role: roleFixo })
    if (!r.ok) {
      setErroExterno(r.message)
      return
    }
    onSucesso()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <PasswordField id="adm-nova-senha" label="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={4} />
      <PasswordField
        id="adm-nova-senha2"
        label="Confirmar senha"
        value={senha2}
        onChange={(e) => setSenha2(e.target.value)}
        required
        minLength={4}
      />
      {erroExterno ? <p className="text-sm text-red-600">{erroExterno}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
          Cancelar
        </button>
        <button type="submit" className="rounded-lg bg-violet-600 text-white font-semibold px-4 py-2 text-sm">
          Salvar
        </button>
      </div>
    </form>
  )
}

function FormEditarUsuario({
  usuario,
  roleFixo,
  sessionUserId,
  erroExterno,
  setErroExterno,
  onSucesso,
  onCancelar,
}) {
  const [nome, setNome] = useState(usuario.nome || '')
  const [email, setEmail] = useState(usuario.email || '')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')

  function submit(e) {
    e.preventDefault()
    setErroExterno('')
    if (senha || senha2) {
      if (senha !== senha2) {
        setErroExterno('As senhas não coincidem.')
        return
      }
      if (senha.length < 4) {
        setErroExterno('Senha deve ter pelo menos 4 caracteres.')
        return
      }
    }
    const patch = {
      nome,
      email,
      role: roleFixo,
    }
    if (senha) patch.senha = senha

    const r = updateRegisteredUser(usuario.id, patch)
    if (!r.ok) {
      setErroExterno(r.message)
      return
    }
    const patchSync =
      Number(sessionUserId) === Number(usuario.id)
        ? { nome: nome.trim(), email: String(email || '').toLowerCase().trim() }
        : null
    onSucesso(patchSync)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <p className="text-xs text-slate-500">Deixe em branco para manter a senha atual.</p>
      <PasswordField id="adm-ed-senha" label="Nova senha (opcional)" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={4} />
      <PasswordField
        id="adm-ed-senha2"
        label="Confirmar nova senha"
        value={senha2}
        onChange={(e) => setSenha2(e.target.value)}
        minLength={4}
      />
      {erroExterno ? <p className="text-sm text-red-600">{erroExterno}</p> : null}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
          Cancelar
        </button>
        <button type="submit" className="rounded-lg bg-violet-600 text-white font-semibold px-4 py-2 text-sm">
          Salvar alterações
        </button>
      </div>
    </form>
  )
}
