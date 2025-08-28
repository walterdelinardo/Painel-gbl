import jsPDF from 'jspdf'

export const gerarPedidoPDF = (pedido) => {
  const doc = new jsPDF()
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = 30
  
  // Cabeçalho da empresa
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GBL CORTE E DOBRA', margin, yPosition)
  
  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Corte e Dobra de Chapas Metálicas', margin, yPosition)
  
  yPosition += 5
  doc.text('Rua John Speers nº 1370 - Pq. do Carmo - São Paulo/SP', margin, yPosition)
  
  yPosition += 5
  doc.text('Tel: (11) 2521-2233 | (11) 94884-8301', margin, yPosition)
  
  yPosition += 5
  doc.text('contato@gblcortedobra.com.br', margin, yPosition)
  
  // Linha separadora
  yPosition += 15
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  
  // Título do pedido
  yPosition += 15
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`PEDIDO ${pedido.numero}`, margin, yPosition)
  
  // Data
  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const dataFormatada = new Date(pedido.data).toLocaleDateString('pt-BR')
  doc.text(`Data: ${dataFormatada}`, margin, yPosition)
  
  // Dados do cliente
  yPosition += 20
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO CLIENTE:', margin, yPosition)
  
  yPosition += 10
  doc.setFont('helvetica', 'normal')
  doc.text(`Cliente: ${pedido.cliente}`, margin, yPosition)
  
  // Especificações do pedido
  yPosition += 20
  doc.setFont('helvetica', 'bold')
  doc.text('ESPECIFICAÇÕES DO PEDIDO:', margin, yPosition)
  
  yPosition += 15
  doc.setFont('helvetica', 'normal')
  
  // Tabela de especificações
  const especificacoes = [
    ['Material:', pedido.material],
    ['Espessura:', pedido.espessura],
    ['Dimensões:', `${pedido.largura} x ${pedido.comprimento} mm`],
    ['Quantidade:', `${pedido.quantidade} peças`]
  ]
  
  especificacoes.forEach(([label, value]) => {
    doc.text(label, margin, yPosition)
    doc.text(value, margin + 40, yPosition)
    yPosition += 8
  })
  
  // Observações
  if (pedido.observacoes) {
    yPosition += 10
    doc.setFont('helvetica', 'bold')
    doc.text('OBSERVAÇÕES:', margin, yPosition)
    
    yPosition += 10
    doc.setFont('helvetica', 'normal')
    
    // Quebrar texto longo em múltiplas linhas
    const observacoesLines = doc.splitTextToSize(pedido.observacoes, pageWidth - 2 * margin)
    observacoesLines.forEach(line => {
      doc.text(line, margin, yPosition)
      yPosition += 6
    })
  }
  
  // Valor total
  yPosition += 20
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  
  yPosition += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(pedido.valor)
  
  doc.text(`VALOR TOTAL: ${valorFormatado}`, margin, yPosition)
  
  // Status
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Status: ${pedido.status}`, margin, yPosition)
  
  // Rodapé
  yPosition = doc.internal.pageSize.height - 30
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento foi gerado automaticamente pelo sistema GBL.', margin, yPosition)
  
  // Salvar o PDF
  doc.save(`Pedido_${pedido.numero}_${pedido.cliente.replace(/\s+/g, '_')}.pdf`)
}

export const gerarRelatorioClientesPDF = (clientes) => {
  const doc = new jsPDF()
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = 30
  
  // Cabeçalho
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GBL CORTE E DOBRA', margin, yPosition)
  
  yPosition += 15
  doc.setFontSize(16)
  doc.text('RELATÓRIO DE CLIENTES', margin, yPosition)
  
  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  doc.text(`Gerado em: ${dataAtual}`, margin, yPosition)
  
  // Linha separadora
  yPosition += 15
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  
  // Lista de clientes
  yPosition += 15
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL DE CLIENTES: ${clientes.length}`, margin, yPosition)
  
  yPosition += 15
  
  clientes.forEach((cliente, index) => {
    // Verificar se precisa de nova página
    if (yPosition > doc.internal.pageSize.height - 50) {
      doc.addPage()
      yPosition = 30
    }
    
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${cliente.nome}`, margin, yPosition)
    
    yPosition += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Contato: ${cliente.contato}`, margin + 5, yPosition)
    
    if (cliente.telefone) {
      yPosition += 6
      doc.text(`Telefone: ${cliente.telefone}`, margin + 5, yPosition)
    }
    
    if (cliente.email) {
      yPosition += 6
      doc.text(`E-mail: ${cliente.email}`, margin + 5, yPosition)
    }
    
    yPosition += 6
    doc.text(`Status: ${cliente.status}`, margin + 5, yPosition)
    
    yPosition += 6
    const dataCadastro = new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')
    doc.text(`Cadastrado em: ${dataCadastro}`, margin + 5, yPosition)
    
    yPosition += 15
  })
  
  // Salvar o PDF
  doc.save(`Relatorio_Clientes_${new Date().toISOString().split('T')[0]}.pdf`)
}

