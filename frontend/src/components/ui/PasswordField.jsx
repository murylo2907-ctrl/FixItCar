import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordField({ id, label, className = '', ...rest }) {
  const [show, setShow] = useState(false)

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan-deep/40"
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
