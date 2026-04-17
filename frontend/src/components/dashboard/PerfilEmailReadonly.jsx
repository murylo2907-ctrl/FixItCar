import { servicoLabelForRole } from '../../lib/perfilTipoConta.js'

/**
 * E-mail da conta (somente leitura) e, abaixo em texto menor, o tipo de perfil (serviço).
 */
export default function PerfilEmailReadonly({ id, email, role }) {
  const servico = servicoLabelForRole(role)
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">
        E-mail
      </label>
      <input
        id={id}
        type="email"
        value={email ?? ''}
        readOnly
        aria-readonly="true"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 cursor-default"
        autoComplete="email"
      />
      {servico ? (
        <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500 leading-snug">{servico}</p>
      ) : null}
    </div>
  )
}
