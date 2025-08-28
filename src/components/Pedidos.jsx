import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'

import {

  Plus,

  FileText,

  Calculator,

  Download,

  MessageCircle,

  Mail,

  Trash2,

  Edit

} from 'lucide-react'



const Pedidos = () => {

  const [pedidos, setPedidos] = useState([])

  const [clientesDisponiveis, setClientesDisponiveis] = useState([])

  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState([])

  const [showForm, setShowForm] = useState(false)

  const [editingPedido, setEditingPedido] = useState(null)

  const [formData, setFormData] = useState({

    cliente_id: "",

    material: "",

    espessura: "",

    largura: "",

    comprimento: "",

    quantidade: "",

    observacoes: ""

  })



  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const N8N_WEBHOOK_URL = "https://n8n-nw.nicwalsolutions.com.br/webhook-test/evo-api-nw-5511979987046";



  const fetchPedidos = async () => {

    try {

      const response = await fetch(`${API_BASE_URL}/api/pedidos`);

      if (response.ok) {

        const data = await response.json();

        setPedidos(data);

      } else {

        console.error("Erro ao buscar pedidos:", response.statusText);

      }

    } catch (error) {

      console.error("Erro de rede ao buscar pedidos:", error);

    }

  };



  const fetchClientesDisponiveis = async () => {

    try {

      const response = await fetch(`${API_BASE_URL}/api/clients`);

      if (response.ok) {

        const data = await response.json();

        setClientesDisponiveis(data);

      } else {

        console.error("Erro ao buscar clientes disponíveis:", response.statusText);

      }

    } catch (error) {

      console.error("Erro de rede ao buscar clientes disponíveis:", error);

    }

  };



  const fetchMateriaisDisponiveis = async () => {

    // Por enquanto, materiais são fixos, mas poderiam vir do backend

    setMateriaisDisponiveis([

      { nome: 'Aço Carbono', preco: 25.00 },

      { nome: 'Aço Galvanizado', preco: 32.00 },

      { nome: 'Aço Inox', preco: 85.00 },

      { nome: 'Alumínio', preco: 45.00 },

      { nome: 'Ferro', preco: 18.00 }

    ]);

  };



  useEffect(() => {

    fetchPedidos();

    fetchClientesDisponiveis();

    fetchMateriaisDisponiveis();

  }, []);



  const calcularValor = () => {

    if (!formData.material || !formData.largura || !formData.comprimento || !formData.quantidade) {

      return 0;

    }



    const material = materiaisDisponiveis.find(m => m.nome === formData.material);

    if (!material) return 0;



    const area = (parseFloat(formData.largura) * parseFloat(formData.comprimento)) / 1000000; // m²

    const valorTotal = area * material.preco * parseInt(formData.quantidade);

    

    return valorTotal;

  };



  const enviarPedidoParaN8n = async (pedido) => {

    try {

      const response = await fetch(N8N_WEBHOOK_URL, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify(pedido),

      });



      if (response.ok) {

        console.log("✅ Pedido enviado ao N8N com sucesso!", await response.json());

      } else {

        console.error("❌ Erro ao enviar pedido para o N8N:", response.statusText);

      }

    } catch (error) {

      console.error("❌ Erro de rede ao enviar pedido para o N8N:", error);

    }

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    const valor = calcularValor();

    const clienteNome = clientesDisponiveis.find(c => c.id === formData.cliente_id)?.name || "";



    const pedidoData = {

      ...formData,

      valor: valor.toFixed(2),

      status: editingPedido ? editingPedido.status : 'Aguardando',

      data: editingPedido ? editingPedido.data : new Date().toISOString().split('T')[0],

      cliente_nome: clienteNome // Adiciona o nome do cliente para o PDF/N8N

    };



    try {

      let response;

      if (editingPedido) {

        response = await fetch(`${API_BASE_URL}/api/pedidos/${editingPedido.id}`, {

          method: 'PUT',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(pedidoData)

        });

      } else {

        response = await fetch(`${API_BASE_URL}/api/pedidos`, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(pedidoData)

        });

      }



      if (response.ok) {

        fetchPedidos();

        resetForm();

        if (!editingPedido) {

          enviarPedidoParaN8n(pedidoData);

        }

      } else {

        console.error("Erro ao salvar pedido:", response.statusText);

      }

    } catch (error) {

      console.error("Erro de rede ao salvar pedido:", error);

    }

  };



  const resetForm = () => {

    setFormData({

      cliente_id: "",

      material: "",

      espessura: "",

      largura: "",

      comprimento: "",

      quantidade: "",

      observacoes: ""

    });

    setShowForm(false);

    setEditingPedido(null);

  };



  const handleEdit = (pedido) => {

    setFormData({

      cliente_id: pedido.cliente_id,

      material: pedido.material,

      espessura: pedido.espessura,

      largura: pedido.largura.toString(),

      comprimento: pedido.comprimento.toString(),

      quantidade: pedido.quantidade.toString(),

      observacoes: pedido.observacoes

    });

    setEditingPedido(pedido);

    setShowForm(true);

  };



  const handleDelete = async (id) => {

    try {

      const response = await fetch(`${API_BASE_URL}/api/pedidos/${id}`, {

        method: 'DELETE'

      });

      if (response.ok) {

        fetchPedidos();

      } else {

        console.error("Erro ao deletar pedido:", response.statusText);

      }

    } catch (error) {

      console.error("Erro de rede ao deletar pedido:", error);

    }

  };



  const getStatusColor = (status) => {

    switch (status) {

      case 'Concluído': return 'bg-green-100 text-green-800';

      case 'Em produção': return 'bg-blue-100 text-blue-800';

      case 'Aguardando': return 'bg-yellow-100 text-yellow-800';

      default: return 'bg-gray-100 text-gray-800';

    }

  };



  const gerarPDF = (pedido) => {

    import('../utils/pdfGenerator').then(({ gerarPedidoPDF }) => {

      gerarPedidoPDF(pedido);

    }).catch(error => {

      console.error('Erro ao gerar PDF:', error);

      alert('Erro ao gerar PDF. Tente novamente.');

    });

  };



  const enviarWhatsApp = (pedido) => {

    const mensagem = `Olá! Segue o pedido ${pedido.numero}:\n\nCliente: ${pedido.cliente_nome}\nMaterial: ${pedido.material}\nValor: R$ ${pedido.valor}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');

  };



  const enviarEmail = (pedido) => {

    const assunto = `Pedido ${pedido.numero} - GBL Corte e Dobra`;

    const corpo = `Pedido: ${pedido.numero}\nCliente: ${pedido.cliente_nome}\nMaterial: ${pedido.material}\nValor: R$ ${pedido.valor}`;

    const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

    window.open(url);

  };



  return (

    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-foreground">Gestão de Pedidos</h1>

          <p className="text-muted-foreground">

            Crie e gerencie pedidos de corte e dobra

          </p>

        </div>

        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">

          <Plus className="h-4 w-4" />

          Novo Pedido

        </Button>

      </div>



      {/* Formulário de Pedido */}

      {showForm && (

        <Card>

          <CardHeader>

            <CardTitle>

              {editingPedido ? 'Editar Pedido' : 'Novo Pedido'}

            </CardTitle>

            <CardDescription>

              Preencha os dados do pedido para calcular automaticamente o valor

            </CardDescription>

          </CardHeader>

          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">

                  <Label htmlFor="cliente">Cliente</Label>

                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>

                    <SelectTrigger>

                      <SelectValue placeholder="Selecione o cliente" />

                    </SelectTrigger>

                    <SelectContent>

                      {clientesDisponiveis.map((cliente) => (

                        <SelectItem key={cliente.id} value={cliente.id}>

                          {cliente.name}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="material">Material</Label>

                  <Select value={formData.material} onValueChange={(value) => setFormData({...formData, material: value})}>

                    <SelectTrigger>

                      <SelectValue placeholder="Selecione o material" />

                    </SelectTrigger>

                    <SelectContent>

                      {materiaisDisponiveis.map((material) => (

                        <SelectItem key={material.nome} value={material.nome}>

                          {material.nome} - R$ {material.preco.toFixed(2)}/m²

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="espessura">Espessura</Label>

                  <Select value={formData.espessura} onValueChange={(value) => setFormData({...formData, espessura: value})}>

                    <SelectTrigger>

                      <SelectValue placeholder="Selecione a espessura" />

                    </SelectTrigger>

                    <SelectContent>

                      {['1mm', '2mm', '3mm', '4mm', '5mm', '6mm', '8mm', '10mm'].map((espessura) => (

                        <SelectItem key={espessura} value={espessura}>

                          {espessura}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="quantidade">Quantidade</Label>

                  <Input

                    id="quantidade"

                    type="number"

                    placeholder="Ex: 5"

                    value={formData.quantidade}

                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}

                    required

                  />

                </div>



                <div className="space-y-2">

                  <Label htmlFor="largura">Largura (mm)</Label>

                  <Input

                    id="largura"

                    type="number"

                    placeholder="Ex: 1000"

                    value={formData.largura}

                    onChange={(e) => setFormData({...formData, largura: e.target.value})}

                    required

                  />

                </div>



                <div className="space-y-2">

                  <Label htmlFor="comprimento">Comprimento (mm)</Label>

                  <Input

                    id="comprimento"

                    type="number"

                    placeholder="Ex: 2000"

                    value={formData.comprimento}

                    onChange={(e) => setFormData({...formData, comprimento: e.target.value})}

                    required

                  />

                </div>

              </div>



              <div className="space-y-2">

                <Label htmlFor="observacoes">Observações</Label>

                <Textarea

                  id="observacoes"

                  placeholder="Instruções especiais, tipo de corte, dobras, etc."

                  value={formData.observacoes}

                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}

                />

              </div>



              <div className="bg-accent/50 p-4 rounded-lg">

                <div className="flex items-center gap-2 mb-2">

                  <Calculator className="h-4 w-4" />

                  <span className="font-medium">Cálculo Automático</span>

                </div>

                <div className="text-2xl font-bold text-primary">

                  R$ {calcularValor().toFixed(2)}

                </div>

                <p className="text-sm text-muted-foreground">

                  Valor calculado com base na área e material selecionado

                </p>

              </div>



              <div className="flex gap-2">

                <Button type="submit">

                  {editingPedido ? 'Atualizar Pedido' : 'Criar Pedido'}

                </Button>

                <Button type="button" variant="outline" onClick={resetForm}>

                  Cancelar

                </Button>

              </div>

            </form>

          </CardContent>

        </Card>

      )}



      <div className="space-y-4">

        <h2 className="text-xl font-semibold">Pedidos Cadastrados</h2>

        {pedidos.map((pedido) => (

          <Card key={pedido.id}>

            <CardContent className="p-6">

              <div className="flex justify-between items-start mb-4">

                <div>

                  <h3 className="text-lg font-semibold">{pedido.numero} - {pedido.cliente_nome}</h3>

                  <p className="text-muted-foreground">{new Date(pedido.data).toLocaleDateString('pt-BR')}</p>

                </div>

                <div className="flex items-center gap-2">

                  <Badge className={getStatusColor(pedido.status)}>

                    {pedido.status}

                  </Badge>

                  <Button variant="ghost" size="sm" onClick={() => handleEdit(pedido)}>

                    <Edit className="h-4 w-4" />

                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pedido.id)}>

                    <Trash2 className="h-4 w-4" />

                  </Button>

                </div>

              </div>



              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                <div>

                  <p className="text-sm text-muted-foreground">Material</p>

                  <p className="font-medium">{pedido.material}</p>

                </div>

                <div>

                  <p className="text-sm text-muted-foreground">Espessura</p>

                  <p className="font-medium">{pedido.espessura}</p>

                </div>

                <div>

                  <p className="text-sm text-muted-foreground">Dimensões</p>

                  <p className="font-medium">{pedido.largura}x{pedido.comprimento}mm</p>

                </div>

                <div>

                  <p className="text-sm text-muted-foreground">Quantidade</p>

                  <p className="font-medium">{pedido.quantidade} peças</p>

                </div>

              </div>



              {pedido.observacoes && (

                <div className="mb-4">

                  <p className="text-sm text-muted-foreground">Observações</p>

                  <p className="text-sm">{pedido.observacoes}</p>

                </div>

              )}



              <Separator className="my-4" />



              <div className="flex justify-between items-center">

                <div className="text-xl font-bold text-primary">

                  R$ {parseFloat(pedido.valor).toFixed(2)}

                </div>

                <div className="flex gap-2">

                  <Button variant="outline" size="sm" onClick={() => gerarPDF(pedido)}>

                    <Download className="h-4 w-4 mr-1" />

                    PDF

                  </Button>

                  <Button variant="outline" size="sm" onClick={() => enviarWhatsApp(pedido)}>

                    <MessageCircle className="h-4 w-4 mr-1" />

                    WhatsApp

                  </Button>

                  <Button variant="outline" size="sm" onClick={() => enviarEmail(pedido)}>

                    <Mail className="h-4 w-4 mr-1" />

                    E-mail

                  </Button>

                </div>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>

    </div>

  );

};



export default Pedidos;
