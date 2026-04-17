import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CadastroPage from './pages/CadastroPage.jsx'
import ServicosPage from './pages/ServicosPage.jsx'
import TermosPage from './pages/TermosPage.jsx'
import PrivacidadePage from './pages/PrivacidadePage.jsx'
import DashboardIndexRedirect from './pages/dashboard/DashboardIndexRedirect.jsx'
import MeusCarrosPage from './pages/dashboard/motorista/MeusCarrosPage.jsx'
import OrcamentosPendentesPage from './pages/dashboard/motorista/OrcamentosPendentesPage.jsx'
import HistoricoMotoristaPage from './pages/dashboard/motorista/HistoricoMotoristaPage.jsx'
import MeuPerfilMotoristaPage from './pages/dashboard/motorista/MeuPerfilMotoristaPage.jsx'
import EntradaVeiculosPage from './pages/dashboard/oficina/EntradaVeiculosPage.jsx'
import OrdensServicoPage from './pages/dashboard/oficina/OrdensServicoPage.jsx'
import HistoricoServicoPage from './pages/dashboard/oficina/HistoricoServicoPage.jsx'
import SolicitarPecasPage from './pages/dashboard/oficina/SolicitarPecasPage.jsx'
import MeuPerfilOficinaPage from './pages/dashboard/oficina/MeuPerfilOficinaPage.jsx'
import CotacoesRecebidasPage from './pages/dashboard/autopecas/CotacoesRecebidasPage.jsx'
import PedidosVendidosPage from './pages/dashboard/autopecas/PedidosVendidosPage.jsx'
import MeuPerfilAutopecasPage from './pages/dashboard/autopecas/MeuPerfilAutopecasPage.jsx'
import SinistrosAnalisePage from './pages/dashboard/seguradora/SinistrosAnalisePage.jsx'
import AprovacoesSeguradoraPage from './pages/dashboard/seguradora/AprovacoesSeguradoraPage.jsx'
import CadastroVeiculosSeguradoraPage from './pages/dashboard/seguradora/CadastroVeiculosSeguradoraPage.jsx'
import HistoricoSinistrosSeguradoraPage from './pages/dashboard/seguradora/HistoricoSinistrosSeguradoraPage.jsx'
import MeuPerfilSeguradoraPage from './pages/dashboard/seguradora/MeuPerfilSeguradoraPage.jsx'
import AdminUsuariosPorPerfilPage from './pages/dashboard/admin/AdminUsuariosPorPerfilPage.jsx'
import AdminMensagensPage from './pages/dashboard/admin/AdminMensagensPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/termos" element={<TermosPage />} />
            <Route path="/privacidade" element={<PrivacidadePage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndexRedirect />} />
              <Route path="motorista/carros" element={<MeusCarrosPage />} />
              <Route path="motorista/orcamentos" element={<OrcamentosPendentesPage />} />
              <Route path="motorista/historico" element={<HistoricoMotoristaPage />} />
              <Route path="motorista/perfil" element={<MeuPerfilMotoristaPage />} />
              <Route path="oficina/entrada" element={<EntradaVeiculosPage />} />
              <Route path="oficina/ordens" element={<OrdensServicoPage />} />
              <Route path="oficina/historico" element={<HistoricoServicoPage />} />
              <Route path="oficina/pecas" element={<SolicitarPecasPage />} />
              <Route path="oficina/perfil" element={<MeuPerfilOficinaPage />} />
              <Route path="autopecas/cotacoes" element={<CotacoesRecebidasPage />} />
              <Route path="autopecas/vendidos" element={<PedidosVendidosPage />} />
              <Route path="autopecas/perfil" element={<MeuPerfilAutopecasPage />} />
              <Route path="seguradora/sinistros" element={<SinistrosAnalisePage />} />
              <Route path="seguradora/aprovacoes" element={<AprovacoesSeguradoraPage />} />
              <Route path="seguradora/cadastro-veiculos" element={<CadastroVeiculosSeguradoraPage />} />
              <Route path="seguradora/historico" element={<HistoricoSinistrosSeguradoraPage />} />
              <Route path="seguradora/perfil" element={<MeuPerfilSeguradoraPage />} />
              <Route path="admin" element={<Outlet />}>
                <Route index element={<Navigate to="motoristas" replace />} />
                <Route path="mensagens" element={<AdminMensagensPage />} />
                <Route path=":modulo" element={<AdminUsuariosPorPerfilPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  )
}
