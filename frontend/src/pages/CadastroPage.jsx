import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordField from '../components/ui/PasswordField.jsx'
import { saveRegisteredUser } from '../lib/localRegistry.js'

const roles = [
  { value: 'motorista', label: 'Motorista' },
  { value: 'mecanico', label: 'Oficina / Mecânica' },
  { value: 'autopecas', label: 'Autopeças' },
  { value: 'seguradora', label: 'Seguradora' },
]

export default function CadastroPage() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('motorista')
  const [erro, setErro] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    const r = saveRegisteredUser({ nome, email, senha, role })
    if (!r.ok) {
      setErro(r.message)
      return
    }
    navigate('/login', { state: { registeredEmail: email.trim() } })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-semibold">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-rose shadow-sm ring-1 ring-slate-200/60" aria-hidden />
          FixIt Car
        </Link>
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Já tenho conta
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900">Cadastrar</h1>
          <p className="text-sm text-slate-600 mt-1 mb-6">Conta local no navegador (demonstração).</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                {roles.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <PasswordField
              id="senha-cadastro"
              label="Senha"
              autoComplete="new-password"
              required
              minLength={4}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {erro ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p> : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-cyan-deep text-white font-semibold py-2.5 text-sm shadow-sm"
            >
              Criar conta
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
