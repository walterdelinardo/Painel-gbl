import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Importado Label
import { Textarea } from '@/components/ui/textarea'; // Importado Textarea
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Importado Badge
import { Separator } from '@/components/ui/separator'; // Importado Separator
import {
  Plus,
  Search,
  Download,
  Upload,
  Package,
  Edit, // Ícone de edição
  Trash2, // Ícone de exclusão
  X // Ícone para fechar formulário
} from 'lucide-react';

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileToImport, setFileToImport] = useState(null);
  const [showForm, setShowForm] = useState(false); // NOVO: Estado para mostrar/esconder formulário
  const [editingProduct, setEditingProduct] = useState(null); // NOVO: Estado para produto em edição
  const [formData, setFormData] = useState({ // NOVO: Estado para dados do formulário
    name: "",
    description: "",
    price: "",
    unit: "",
    sku: ""
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Função para buscar produtos do backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Erro ao buscar produtos:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar produtos:", error);
    }
  };

  // Carrega produtos ao montar o componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // FUNÇÃO DE EXPORTAÇÃO DE PRODUTOS
  const handleExportProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/export`); // Você precisaria criar esta rota no backend

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'produtos_exportados.csv';
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('Exportação de produtos iniciada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao exportar produtos: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro de rede ou ao exportar produtos:', error);
      alert('Erro ao tentar exportar produtos. Verifique a conexão.');
    }
  };

  // FUNÇÃO DE IMPORTAÇÃO DE PRODUTOS
  const handleImportProducts = async () => {
    if (!fileToImport) {
      alert("Por favor, selecione um arquivo CSV para importar.");
      return;
    }

    const formData = new FormData();
    formData.append('file', fileToImport);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/import`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setFileToImport(null);
        fetchProducts(); // Atualiza a lista de produtos após a importação
      } else {
        const errorData = await response.json();
        alert(`Erro na importação de produtos: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro de rede ou ao importar produtos:', error);
      alert('Erro ao tentar importar produtos. Verifique a conexão.');
    }
  };

  // NOVO: Funções para CRUD de Produtos
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingProduct) {
        // Rota PUT para atualizar
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Rota POST para criar
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        fetchProducts(); // Recarrega a lista de produtos
        resetForm(); // Limpa e esconde o formulário
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar produto: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao salvar produto:", error);
      alert("Erro de rede ao salvar produto. Verifique a conexão.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      unit: "",
      sku: ""
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "", // Garante string vazia se nulo
      price: product.price,
      unit: product.unit || "",
      sku: product.sku || ""
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Produto deletado com sucesso!");
        fetchProducts(); // Recarrega a lista de produtos
      } else {
        const errorData = await response.json();
        alert(`Erro ao deletar produto: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao deletar produto:", error);
      alert("Erro de rede ao deletar produto. Verifique a conexão.");
    }
  };


  // Filtra produtos com base no termo de pesquisa
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Produtos</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie seus produtos e preços
          </p>
        </div>
        <div className="flex gap-2"> {/* Container para os botões */}
          {/* Botão de Exportar Produtos (Descomente se criar a rota no backend) */}
          {/* <Button onClick={handleExportProducts} className="flex items-center gap-2" variant="outline">
            <Download className="h-4 w-4" />
            Exportar (CSV)
          </Button> */}
          {/* Input de arquivo e botão de Importar Produtos */}
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setFileToImport(e.target.files[0])}
            className="w-auto max-w-[150px] cursor-pointer"
          />
          <Button onClick={handleImportProducts} className="flex items-center gap-2" disabled={!fileToImport}>
            <Upload className="h-4 w-4" />
            Importar (CSV)
          </Button>
          {/* NOVO: Botão para Novo Produto */}
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos por nome, SKU ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* NOVO: Formulário de Cadastro/Edição de Produto */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
            <CardDescription>
              Preencha os dados do produto para cadastro ou edição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Chapa de Aço 10mm"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number" // Tipo number para preço
                    step="0.01" // Permite casas decimais
                    placeholder="Ex: 150.50"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    type="text"
                    placeholder="Ex: kg, m, unidade"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    type="text"
                    placeholder="Ex: P-A10MM"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do produto..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Produtos Cadastrados ({filteredProducts.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-semibold">R$ {product.price ? product.price.toFixed(2).replace('.', ',') : '0,00'}</h3>
                      <p className="text-sm text-muted-foreground">por {product.unit || 'unidade'}</p>
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                  )}
                  <Separator className="my-3" /> {/* Separador adicionado */}
                  <div className="flex justify-end gap-2"> {/* Botões de ação */}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="lg:col-span-2">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum produto encontrado com os termos pesquisados.' : 'Nenhum produto cadastrado ainda.'}
                </p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  Cadastrar Primeiro Produto
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Produtos;

