import { Link } from 'react-router-dom'
import SiteHeader from '../components/marketing/SiteHeader.jsx'
import SiteFooter from '../components/marketing/SiteFooter.jsx'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SiteHeader anchorPrefix="/" />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full text-sm text-slate-700 leading-relaxed">
        <h1 className="text-2xl font-bold text-slate-900">Termos de uso</h1>
        <p className="text-slate-600 mt-2 text-sm">Última atualização: abril de 2026.</p>
        <p className="mt-6 text-slate-700 leading-relaxed">
          Ao utilizar o site e os serviços do FixIt Car, você concorda em cumprir estes termos. O produto pode incluir
          versões de demonstração com dados armazenados localmente no seu navegador; não nos responsabilizamos por
          perdas decorrentes de limpeza de dados ou uso em dispositivos compartilhados.
        </p>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Conteúdos, marcas e layout são protegidos. É proibido uso que viole a lei, terceiros ou a segurança da
          plataforma. Podemos alterar estes termos; o uso continuado após alterações constitui aceitação.
        </p>
        <p className="mt-8">
          <Link to="/" className="text-brand-cyan-deep font-semibold hover:underline">
            ← Voltar ao início
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
