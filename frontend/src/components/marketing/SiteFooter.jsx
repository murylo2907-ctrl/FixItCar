import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row gap-6 sm:justify-between sm:items-center text-sm text-slate-600">
        <p className="font-medium text-slate-700">© {new Date().getFullYear()} FixIt Car</p>
        <div className="flex flex-wrap gap-6">
          <Link to="/termos" className="hover:text-brand-cyan-deep font-medium transition-colors">
            Termos
          </Link>
          <Link to="/privacidade" className="hover:text-brand-cyan-deep font-medium transition-colors">
            Privacidade
          </Link>
          <Link to="/servicos" className="hover:text-brand-cyan-deep font-medium transition-colors">
            Serviços
          </Link>
        </div>
      </div>
    </footer>
  )
}
