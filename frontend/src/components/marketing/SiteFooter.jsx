import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 sm:justify-between text-sm text-slate-600">
        <p>© {new Date().getFullYear()} FixIt Car</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/termos" className="hover:text-brand-cyan-deep">
            Termos
          </Link>
          <Link to="/privacidade" className="hover:text-brand-cyan-deep">
            Privacidade
          </Link>
          <Link to="/servicos" className="hover:text-brand-cyan-deep">
            Serviços
          </Link>
        </div>
      </div>
    </footer>
  )
}
