import { useState } from 'react'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Pedidos from './components/Pedidos'
import Clientes from './components/Clientes'
import Relatorios from './components/Relatorios'
import Configuracoes from './components/Configuracoes'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const handleLogin = (success) => {
    setIsAuthenticated(success)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage('dashboard')
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'pedidos':
        return <Pedidos />
      case 'clientes':
        return <Clientes />
      case 'relatorios':
        return <Relatorios />
      case 'configuracoes':
        return <Configuracoes />
      default:
        return <Dashboard />
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  )
}

export default App

