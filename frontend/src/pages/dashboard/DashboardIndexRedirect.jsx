import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { defaultDashboardPath } from '../../lib/dashboardPaths.js'

export default function DashboardIndexRedirect() {
  const { user } = useAuth()
  return <Navigate to={defaultDashboardPath(user?.role)} replace />
}
