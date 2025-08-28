import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Package, 
  Calendar,
  Download,
  Filter
} from 'lucide-react'

const Relatorios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6meses')

  // Dados simulados para os gráficos
  const vendasPorMes = [
    { mes: 'Jul/24', vendas: 28500, pedidos: 45 },
    { mes: 'Ago/24', vendas: 32100, pedidos: 52 },
    { mes: 'Set/24', vendas: 29800, pedidos: 48 },
    { mes: 'Out/24', vendas: 35600, pedidos: 58 },
    { mes: 'Nov/24', vendas: 41200, pedidos: 67 },
    { mes: 'Dez/24', vendas: 45280, pedidos: 73 }
  ]

  const clientesPorPeriodo = [
    { mes: 'Jul/24', novos: 8, total: 67 },
    { mes: 'Ago/24', novos: 12, total: 79 },
    { mes: 'Set/24', novos: 6, total: 85 },
    { mes: 'Out/24', novos: 9, total: 94 },
    { mes: 'Nov/24', novos: 11, total: 105 },
    { mes: 'Dez/24', novos: 15, total: 120 }
  ]

  const materiaisMaisPedidos = [
    { material: 'Aço Carbono', quantidade: 245, valor: 35, cor: '#3b82f6' },
    { material: 'Aço Galvanizado', quantidade: 189, valor: 28, cor: '#10b981' },
    { material: 'Aço Inox', quantidade: 156, valor: 23, cor: '#f59e0b' },
    { material: 'Alumínio', quantidade: 98, valor: 14, cor: '#ef4444' },
    { material: 'Ferro', quantidade: 67, valor: 10, cor: '#8b5cf6' }
  ]

  const statusPedidos = [
    { status: 'Concluído', quantidade: 156, cor: '#10b981' },
    { status: 'Em Produção', quantidade: 89, cor: '#3b82f6' },
    { status: 'Aguardando', quantidade: 45, cor: '#f59e0b' },
    { status: 'Cancelado', quantidade: 12, cor: '#ef4444' }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'vendas' ? 
                `${entry.name}: ${formatCurrency(entry.value)}` :
                `${entry.name}: ${entry.value}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const exportarRelatorio = () => {
    alert('Funcionalidade de exportação será implementada em breve!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Gráficos</h1>
          <p className="text-muted-foreground">
            Visualize dados e estatísticas do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3meses">Últimos 3 meses</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="12meses">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">R$ 212.480</p>
                <p className="text-xs text-green-600">+18% vs período anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">343</p>
                <p className="text-xs text-blue-600">+12% vs período anterior</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                <p className="text-2xl font-bold">61</p>
                <p className="text-xs text-purple-600">+25% vs período anterior</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 619</p>
                <p className="text-xs text-orange-600">+5% vs período anterior</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês</CardTitle>
            <CardDescription>
              Faturamento e número de pedidos mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="vendas" fill="#3b82f6" name="Faturamento (R$)" />
                <Bar yAxisId="right" dataKey="pedidos" fill="#10b981" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clientes por Período */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Clientes</CardTitle>
            <CardDescription>
              Novos clientes cadastrados por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientesPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="novos" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="Novos Clientes"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Total Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materiais Mais Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais Mais Pedidos</CardTitle>
            <CardDescription>
              Ranking de materiais por quantidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materiaisMaisPedidos} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="material" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
            <CardDescription>
              Distribuição atual dos pedidos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPedidos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, valor }) => `${status} (${valor}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {statusPedidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Material</CardTitle>
          <CardDescription>
            Análise detalhada do desempenho por tipo de material
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Material</th>
                  <th className="text-right p-2">Quantidade</th>
                  <th className="text-right p-2">% do Total</th>
                  <th className="text-right p-2">Faturamento</th>
                  <th className="text-right p-2">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {materiaisMaisPedidos.map((material, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{material.material}</td>
                    <td className="p-2 text-right">{material.quantidade}</td>
                    <td className="p-2 text-right">{material.valor}%</td>
                    <td className="p-2 text-right">
                      {formatCurrency(material.quantidade * 150)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(150)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Relatorios

