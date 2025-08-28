import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Download,
  Upload,
  X // Ícone para fechar formulário
} from 'lucide-react';
// NOVAS IMPORTAÇÕES PARA TOOLTIPS
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileToImport, setFileToImport] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    cnpj: "",
    observations: ""
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        console.error("Erro ao buscar clientes:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingCliente) {
        response = await fetch(`${API_BASE_URL}/api/clients/${editingCliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        fetchClients();
        resetForm();
        alert('Cliente salvo com sucesso!'); // Manter alert por enquanto
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar cliente: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao salvar cliente:", error);
      alert("Erro de rede ao salvar cliente. Verifique a conexão.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      cnpj: "",
      observations: ""
    });
    setShowForm(false);
    setEditingCliente(null);
  };

  const handleEdit = (cliente) => {
    setFormData({
      name: cliente.name,
      contact_person: cliente.contact_person,
      email: cliente.email,
      phone: cliente.phone,
      address: cliente.address,
      cnpj: cliente.cnpj,
      observations: cliente.observations
    });
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este cliente?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchClients();
        alert('Cliente deletado com sucesso!'); // Manter alert por enquanto
      } else {
        const errorData = await response.json();
        alert(`Erro ao deletar cliente: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao deletar cliente:", error);
      alert("Erro de rede ao deletar cliente. Verifique a conexão.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchClients();
        alert(`Status do cliente alterado para ${newStatus}.`); // Manter alert por enquanto
      } else {
        const errorData = await response.json();
        alert(`Erro ao alterar status do cliente: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao alterar status do cliente:", error);
      alert("Erro de rede ao alterar status do cliente. Verifique a conexão.");
    }
  };

  // FUNÇÃO DE EXPORTAÇÃO DE CLIENTES
  const handleExportClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/export`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'clientes_exportados.csv';
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('Exportação iniciada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao exportar: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro de rede ou ao exportar:', error);
      alert('Erro ao tentar exportar clientes. Verifique a conexão.');
    }
  };

  // FUNÇÃO DE IMPORTAÇÃO DE CLIENTES
  const handleImportClients = async () => {
    if (!fileToImport) {
      alert("Por favor, selecione um arquivo CSV para importar.");
      return;
    }

    const formData = new FormData();
    formData.append('file', fileToImport);

    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/import`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setFileToImport(null);
        fetchClients();
      } else {
        const errorData = await response.json();
        alert(`Erro na importação: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro de rede ou ao importar:', error);
      alert('Erro ao tentar importar clientes. Verifique a conexão.');
    }
  };


  const filteredClientes = clientes.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (cnpj) => {
    return cnpj ? cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
  };

  const formatPhone = (phone) => {
    return phone ? phone.replace(/^(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '';
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8"> {/* Adicionado padding responsivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"> {/* Layout responsivo */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie seus clientes
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto"> {/* Flex-wrap para botões em telas pequenas */}
          {/* Botão de Exportar Clientes */}
          <TooltipProvider> {/* NOVO: TooltipProvider para os tooltips */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleExportClients} className="flex items-center gap-2 transition-all duration-200 hover:scale-105" variant="outline" aria-label="Exportar Clientes">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar (CSV)</span> {/* Esconde texto em telas muito pequenas */}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar todos os clientes para um arquivo CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Input de arquivo e botão de Importar Clientes */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex items-center">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFileToImport(e.target.files[0])}
                    className="w-auto max-w-[150px] cursor-pointer pr-8 transition-all duration-200 hover:border-primary" // Ajustado padding para ícone
                    aria-label="Selecionar arquivo CSV para importar"
                  />
                  <Upload className="absolute right-2 h-4 w-4 text-muted-foreground pointer-events-none" /> {/* Ícone dentro do input */}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Selecione um arquivo CSV para importar clientes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleImportClients} className="flex items-center gap-2 transition-all duration-200 hover:scale-105" disabled={!fileToImport} aria-label="Importar Clientes">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importar (CSV)</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importar clientes de um arquivo CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Botão para Novo Cliente */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 transition-all duration-200 hover:scale-105" aria-label="Novo Cliente">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Cliente</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar um novo cliente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> {/* Centralizado verticalmente */}
          <Input
            placeholder="Pesquisar clientes por nome, contato ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Formulário de Cliente */}
      {showForm && (
        <Card className="mb-6 transition-all duration-300 ease-in-out transform scale-100 opacity-100"> {/* Adicionadas transições */}
          <CardHeader className="flex flex-row justify-between items-center"> {/* Layout para botão fechar */}
            <div>
              <CardTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </CardTitle>
              <CardDescription>
                Preencha os dados do cliente para cadastro no sistema
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetForm} aria-label="Fechar Formulário"> {/* Botão fechar */}
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Layout de 3 colunas em telas maiores */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Metalúrgica Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Pessoa de Contato *</Label>
                  <Input
                    id="contact_person"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    required
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: contato@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: (11) 3456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="Ex: 12.345.678/0001-90"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Ex: Rua das Indústrias, 123 - São Paulo/SP"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="transition-all duration-200 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Informações adicionais sobre o cliente..."
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  className="transition-all duration-200 focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="transition-all duration-200 hover:scale-105">
                  {editingCliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="transition-all duration-200 hover:scale-105">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Clientes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4"> {/* Adicionado mb-4 */}
          <h2 className="text-xl font-semibold">
            Clientes Cadastrados ({filteredClientes.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* Layout de 3-4 colunas em telas maiores */}
          {filteredClientes.length > 0 ? (
            filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="transition-all duration-220 hover:shadow-lg hover:border-primary/50"> {/* Adicionadas transições e hover */}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{cliente.name}</h3>
                        <p className="text-sm text-muted-foreground">{cliente.contact_person}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}
                        className={`transition-all duration-200 ${cliente.status === 'Ativo' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {cliente.status}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(cliente)} aria-label="Editar Cliente">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar informações do cliente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cliente.id)} aria-label="Deletar Cliente">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Deletar cliente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{cliente.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhone(cliente.phone)}</span>
                    </div>

                    {cliente.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{cliente.address}</span>
                      </div>
                    )}

                    {cliente.cnpj && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>CNPJ: {formatCNPJ(cliente.cnpj)}</span>
                      </div>
                    )}
                  </div>

                  {cliente.observations && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                        <p className="text-sm">{cliente.observations}</p>
                      </div>
                    </>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Cadastrado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(cliente.id, cliente.status)}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {cliente.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="lg:col-span-full text-center p-8 transition-all duration-220"> {/* Span em todas as colunas */}
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum cliente encontrado com os termos pesquisados.' : 'Nenhum cliente cadastrado ainda.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)} className="mt-4 transition-all duration-200 hover:scale-105">
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientes;

