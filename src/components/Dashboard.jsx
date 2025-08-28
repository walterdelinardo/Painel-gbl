import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, Package, AlertTriangle } from 'lucide-react'; // Adicionado AlertTriangle para ícone de alerta
// Importações para Recharts (manter por enquanto)
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  // Dados simulados para demonstração (manter por enquanto, ou remover se todos os dados vierem da API)
  const stats = [
    {
      title: "Pedidos do Mês",
      value: "127",
      description: "+12% em relação ao mês anterior",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Clientes Ativos",
      value: "89",
      description: "+5 novos clientes este mês",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Faturamento",
      value: "R$ 45.280",
      description: "+8% em relação ao mês anterior",
      icon: TrendingUp,
      color: "text-yellow-600"
    },
    {
      title: "Materiais em Estoque",
      value: "234",
      description: "Chapas disponíveis",
      icon: Package,
      color: "text-purple-600"
    }
  ];

  const [salesData, setSalesData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]); // NOVO: Estado para produtos com estoque baixo
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/sales_by_month`);
      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      } else {
        console.error("Erro ao buscar dados de vendas por mês:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar dados de vendas por mês:", error);
    }
  };

  // NOVO: Função para buscar produtos com estoque baixo
  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/low_stock_products`);
      if (response.ok) {
        const data = await response.json();
        setLowStockProducts(data);
      } else {
        console.error("Erro ao buscar produtos com estoque baixo:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar produtos com estoque baixo:", error);
    }
  };


  useEffect(() => {
    fetchSalesData();
    fetchLowStockProducts(); // Chama a nova função ao montar
  }, []);


  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio de corte e dobra
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de Vendas por Mês (Mantido) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento e Pedidos por Mês</CardTitle>
            <CardDescription>
              Visão geral do desempenho de vendas e pedidos ao longo do tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value, name, props) => {
                    if (name === 'Faturamento') return [`R$ ${value.toFixed(2).replace('.', ',')}`, name];
                    if (name === 'Pedidos') return [value, name];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="total_value" name="Faturamento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="total_orders" name="Pedidos" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NOVO: Seção de Alertas de Estoque Baixo */}
        <Card className="lg:col-span-1"> {/* Ocupa 1 coluna */}
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Alertas de Estoque Baixo
            </CardTitle>
            <CardDescription>
              Produtos que precisam de atenção no estoque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg transition-all duration-200 hover:bg-red-100">
                    <div>
                      <p className="font-medium">{product.name} ({product.sku})</p>
                      <p className="text-sm text-muted-foreground">Estoque: <span className="font-bold text-red-600">{product.stock} {product.unit}</span></p>
                    </div>
                    {/* Botão para ir para a página de produtos, se desejar */}
                    {/* <Button variant="ghost" size="sm">Ver</Button> */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2" />
                <p>Nenhum produto com estoque baixo no momento.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Pedidos Recentes (Mantida e ajustada para layout) */}
        <Card className="lg:col-span-1"> {/* Ocupa 1 coluna */}
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Últimos pedidos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Agora, esta seção estará vazia se não houver dados reais de pedidos */}
              {/* Você pode adicionar uma mensagem de "Nenhum pedido recente" aqui se quiser */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

