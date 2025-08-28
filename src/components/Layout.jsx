import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  LayoutDashboard, // Adicionado para o ícone do Dashboard
  ShoppingCart,    // Adicionado para o ícone de Pedidos
  Package          // Adicionado para o ícone de Produtos
} from 'lucide-react';

// Importe os componentes das páginas
import Dashboard from './Dashboard';
import Clientes from './Clientes';
import Pedidos from './Pedidos';
import Relatorios from './Relatorios'; // Assumindo que você tem um Relatorios.jsx
import Configuracoes from './Configuracoes'; // Assumindo que você tem um Configuracoes.jsx
import Produtos from './Produtos';
import Usuarios from './Usuarios'; // NOVO: Importe o componente Usuarios

const Layout = ({ currentPage, onPageChange, onLogout }) => { // Removido 'children' pois a renderização é controlada aqui
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pedidos', label: 'Pedidos', icon: FileText },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuários', icon: Users }, // NOVO: Adicionado item para Usuários
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Função para renderizar o componente da página atual
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pedidos':
        return <Pedidos />;
      case 'clientes':
        return <Clientes />;
      case 'produtos':
        return <Produtos />;
      case 'relatorios':
        return <Relatorios />;
      case 'usuarios': // NOVO: Renderiza o componente Usuarios
        return <Usuarios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />; // Página padrão
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}>
        <div className="flex items-center justify-between h-16 px-6 bg-sidebar-header">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">G</span>
            </div>
            <span className="text-sidebar-foreground font-semibold">Painel GBL</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${
                  currentPage === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-sm text-muted-foreground">
              Bem-vindo ao Painel GBL Corte e Dobra
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

