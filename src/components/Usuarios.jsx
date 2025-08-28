import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  X // Ícone para fechar formulário
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importado Select para o campo de role

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "", // Senha será enviada em texto puro e hashada no backend
    role: "user" // Padrão para 'user'
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Função para buscar usuários do backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Erro ao buscar usuários:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar usuários:", error);
    }
  };

  // Carrega usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Função para lidar com o envio do formulário (criar/editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingUser) {
        // Rota PUT para atualizar
        response = await fetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Rota POST para criar
        response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        fetchUsers(); // Recarrega a lista de usuários
        resetForm(); // Limpa e esconde o formulário
        alert('Usuário salvo com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar usuário: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao salvar usuário:", error);
      alert("Erro de rede ao salvar usuário. Verifique a conexão.");
    }
  };

  // Função para limpar e esconder o formulário
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "user"
    });
    setShowForm(false);
    setEditingUser(null);
  };

  // Função para preencher o formulário para edição
  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: "", // Não preenche a senha por segurança
      role: user.role
    });
    setEditingUser(user);
    setShowForm(true);
  };

  // Função para deletar um usuário
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este usuário?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Usuário deletado com sucesso!");
        fetchUsers(); // Recarrega a lista de usuários
      } else {
        const errorData = await response.json();
        alert(`Erro ao deletar usuário: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao deletar usuário:", error);
      alert("Erro de rede ao deletar usuário. Verifique a conexão.");
    }
  };

  // Filtra usuários com base no termo de pesquisa
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os usuários do sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
          {/* Botão para Novo Usuário */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 transition-all duration-200 hover:scale-105" aria-label="Novo Usuário">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Usuário</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar um novo usuário ao sistema</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar usuários por nome ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Formulário de Usuário */}
      {showForm && (
        <Card className="mb-6 transition-all duration-300 ease-in-out transform scale-100 opacity-100">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </CardTitle>
              <CardDescription>
                Preencha os dados do usuário para cadastro ou edição
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetForm} aria-label="Fechar Formulário">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ex: joao.silva"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha {editingUser ? '(deixe em branco para não alterar)' : '*'}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={editingUser ? 'Deixe em branco para não alterar' : '********'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser} // Senha é obrigatória apenas para novos usuários
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo / Permissão</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Usuário Padrão</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="transition-all duration-200 hover:scale-105">
                  {editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="transition-all duration-200 hover:scale-105">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Usuários Cadastrados ({filteredUsers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="transition-all duration-220 hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">Cargo: {user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={`transition-all duration-200 ${user.role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {user.role}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} aria-label="Editar Usuário">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar informações do usuário</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} aria-label="Deletar Usuário">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Deletar usuário</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="lg:col-span-full text-center p-8 transition-all duration-220">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum usuário encontrado com os termos pesquisados.' : 'Nenhum usuário cadastrado ainda.'}
                </p>
                <Button onClick={() => setShowForm(true)} className="mt-4 transition-all duration-200 hover:scale-105">
                  Cadastrar Primeiro Usuário
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
