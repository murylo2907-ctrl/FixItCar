import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from '../components/marketing/SiteHeader.jsx'
import SiteFooter from '../components/marketing/SiteFooter.jsx'

export default function PrivacidadePage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#cookies') {
      document.getElementById('cookies')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SiteHeader anchorPrefix="/" />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full text-sm text-slate-700 leading-relaxed">
        <h1 className="text-2xl font-bold text-slate-900">Política de privacidade</h1>
        <p className="text-slate-600 mt-2 text-sm">Última atualização: abril de 2026.</p>
        <p className="mt-6 text-slate-700 leading-relaxed">
          Coletamos apenas as informações necessárias para o funcionamento do serviço (por exemplo, dados de cadastro e
          mensagens de contato que você enviar pelo formulário). Em modo demonstração, parte dos dados pode ficar
          armazenada no seu próprio navegador (localStorage).
        </p>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Não vendemos seus dados pessoais. Utilizamos fornecedores (hospedagem, e-mail) conforme necessário para
          operar o produto. Você pode solicitar esclarecimentos ou revisão de dados conforme a LGPD.
        </p>
        <h2 id="cookies" className="text-lg font-bold text-slate-900 mt-10 scroll-mt-24">
          Cookies
        </h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Podemos usar cookies ou armazenamento local para manter sessão, preferências e métricas básicas de uso. Você
          pode limpar os dados do site nas configurações do navegador.
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
