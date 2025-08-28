import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Save, 
  Building, 
  Calculator, 
  Mail, 
  Phone,
  MapPin,
  Palette,
  Bell
} from 'lucide-react'

const Configuracoes = () => {
  const [configuracoes, setConfiguracoes] = useState({
    // Dados da empresa
    nomeEmpresa: 'GBL Corte e Dobra',
    endereco: 'Rua John Speers nº 1370 - Pq. do Carmo - São Paulo/SP',
    telefone: '(11) 2521-2233',
    celular: '(11) 94884-8301',
    email: 'contato@gblcortedobra.com.br',
    cnpj: '12.345.678/0001-90',
    
    // Configurações de cálculo
    margemLucro: 15,
    custoOperacional: 5,
    descontoMaximo: 10,
    
    // Configurações de sistema
    notificacoesPedidos: true,
    notificacoesClientes: true,
    backupAutomatico: true,
    
    // Configurações de e-mail
    emailServidor: 'smtp.gmail.com',
    emailPorta: '587',
    emailUsuario: '',
    emailSenha: '',
    
    // Observações padrão
    observacoesPadrao: 'Prazo de entrega: 5 dias úteis\nForma de pagamento: À vista ou parcelado\nGarantia: 90 dias'
  })

  const [salvando, setSalvando] = useState(false)

  const handleInputChange = (campo, valor) => {
    setConfiguracoes(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const handleSalvar = async () => {
    setSalvando(true)
    
    try {
      // Simular salvamento (em produção, enviar para backend)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Salvar no localStorage para demonstração
      localStorage.setItem('gbl_configuracoes', JSON.stringify(configuracoes))
      
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const resetarConfiguracoes = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
      // Resetar para valores padrão
      setConfiguracoes({
        nomeEmpresa: 'GBL Corte e Dobra',
        endereco: 'Rua John Speers nº 1370 - Pq. do Carmo - São Paulo/SP',
        telefone: '(11) 2521-2233',
        celular: '(11) 94884-8301',
        email: 'contato@gblcortedobra.com.br',
        cnpj: '12.345.678/0001-90',
        margemLucro: 15,
        custoOperacional: 5,
        descontoMaximo: 10,
        notificacoesPedidos: true,
        notificacoesClientes: true,
        backupAutomatico: true,
        emailServidor: 'smtp.gmail.com',
        emailPorta: '587',
        emailUsuario: '',
        emailSenha: '',
        observacoesPadrao: 'Prazo de entrega: 5 dias úteis\nForma de pagamento: À vista ou parcelado\nGarantia: 90 dias'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Configure parâmetros do sistema e dados da empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetarConfiguracoes}>
            Resetar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            <Save className="h-4 w-4 mr-2" />
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informações que aparecerão nos documentos e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={configuracoes.nomeEmpresa}
                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={configuracoes.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={configuracoes.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={configuracoes.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={configuracoes.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={configuracoes.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Cálculo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Configurações de Cálculo
            </CardTitle>
            <CardDescription>
              Parâmetros para cálculo automático de preços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
              <Input
                id="margemLucro"
                type="number"
                min="0"
                max="100"
                value={configuracoes.margemLucro}
                onChange={(e) => handleInputChange('margemLucro', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custoOperacional">Custo Operacional (%)</Label>
              <Input
                id="custoOperacional"
                type="number"
                min="0"
                max="50"
                value={configuracoes.custoOperacional}
                onChange={(e) => handleInputChange('custoOperacional', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descontoMaximo">Desconto Máximo (%)</Label>
              <Input
                id="descontoMaximo"
                type="number"
                min="0"
                max="50"
                value={configuracoes.descontoMaximo}
                onChange={(e) => handleInputChange('descontoMaximo', parseFloat(e.target.value) || 0)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="observacoesPadrao">Observações Padrão</Label>
              <Textarea
                id="observacoesPadrao"
                placeholder="Observações que aparecerão por padrão nos pedidos..."
                value={configuracoes.observacoesPadrao}
                onChange={(e) => handleInputChange('observacoesPadrao', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Sistema
            </CardTitle>
            <CardDescription>
              Preferências gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Pedidos</Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas sobre novos pedidos
                </p>
              </div>
              <Switch
                checked={configuracoes.notificacoesPedidos}
                onCheckedChange={(checked) => handleInputChange('notificacoesPedidos', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Clientes</Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas sobre novos clientes
                </p>
              </div>
              <Switch
                checked={configuracoes.notificacoesClientes}
                onCheckedChange={(checked) => handleInputChange('notificacoesClientes', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Fazer backup dos dados automaticamente
                </p>
              </div>
              <Switch
                checked={configuracoes.backupAutomatico}
                onCheckedChange={(checked) => handleInputChange('backupAutomatico', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de E-mail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de E-mail
            </CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de e-mails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailServidor">Servidor SMTP</Label>
                <Input
                  id="emailServidor"
                  value={configuracoes.emailServidor}
                  onChange={(e) => handleInputChange('emailServidor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPorta">Porta</Label>
                <Input
                  id="emailPorta"
                  value={configuracoes.emailPorta}
                  onChange={(e) => handleInputChange('emailPorta', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailUsuario">Usuário</Label>
              <Input
                id="emailUsuario"
                type="email"
                value={configuracoes.emailUsuario}
                onChange={(e) => handleInputChange('emailUsuario', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailSenha">Senha</Label>
              <Input
                id="emailSenha"
                type="password"
                value={configuracoes.emailSenha}
                onChange={(e) => handleInputChange('emailSenha', e.target.value)}
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Para Gmail, use uma senha de aplicativo específica. 
                Nunca use sua senha principal do Gmail.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes sobre a versão e status do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Versão do Sistema</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Último Backup</p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status do Sistema</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Configuracoes

