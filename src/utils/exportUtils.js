import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- VEÍCULOS ---
/**
 * EXPORTAÇÃO DE VEÍCULOS PARA PDF (MODO HORIZONTAL / LANDSCAPE)
 */
export const exportarVeiculosPDF = (dados) => {
  try {
    if (!dados || dados.length === 0) {
      alert('Nenhum veículo disponível para exportar.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Título e subcabeçalho
    doc.setFontSize(16);
    doc.text('Relatório Completo de Veículos', 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    const dataEmissao = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataEmissao}`, 14, 21);

    // Mapeamento de todas as colunas
    const colunas = [
      { header: 'Placa', dataKey: 'placa' },
      { header: 'Modelo', dataKey: 'modelo' },
      { header: 'Marca', dataKey: 'marca' },
      { header: 'Tipo', dataKey: 'tipo' },
      { header: 'Ano/Cor', dataKey: 'anoCor' },
      { header: 'Status', dataKey: 'status' },
      { header: 'CRLV', dataKey: 'crlv' },
      { header: 'KM Atual', dataKey: 'km' },
      { header: 'Combustível', dataKey: 'combustivel' },
      { header: 'Renavam', dataKey: 'renavam' },
      { header: 'Chassi', dataKey: 'chassi' },
    ];

    // Formatação dos dados
    const linhas = dados.map((v) => {
      const anoCor = [v.ano, v.cor].filter(Boolean).join(' / ') || '-';
      const km = v.km_atual
        ? `${Number(v.km_atual).toLocaleString('pt-BR')} km`
        : '-';

      return {
        placa: v.placa || '-',
        modelo: v.modelo || '-',
        marca: v.marca || '-',
        tipo: v.tipo_veiculo || 'Carro',
        anoCor: anoCor,
        status: (v.status || 'DISPONIVEL').toString().toUpperCase(),
        crlv: v.ano_crlv || '-',
        km: km,
        combustivel: v.tipo_combustivel || 'FLEX',
        renavam: v.renavam || '-',
        chassi: v.chassi || '-',
      };
    });

    autoTable(doc, {
      columns: colunas,
      body: linhas,
      startY: 26,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59], // Cor de fundo (#1e293b)
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        placa: { fontStyle: 'bold', halign: 'center' },
        crlv: { halign: 'center' },
        status: { halign: 'center' },
        km: { halign: 'right' },
      },
      margin: { top: 25, left: 10, right: 10, bottom: 10 },
    });

    doc.save(`Relatorio_Veiculos_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error('Erro na geração do PDF de veículos:', err);
    alert(`Erro ao gerar PDF: ${err.message}`);
  }
};

/**
 * EXPORTAÇÃO DE VEÍCULOS PARA EXCEL (COM TODAS AS PROPRIEDADES)
 */
export const exportarVeiculosExcel = (dados) => {
  try {
    if (!dados || dados.length === 0) {
      alert('Nenhum veículo disponível para exportar.');
      return;
    }

    // Mapeamento de todos os atributos
    const dadosFormatados = dados.map((v) => ({
      Placa: v.placa || '-',
      Modelo: v.modelo || '-',
      Marca: v.marca || '-',
      'Tipo de Veículo': v.tipo_veiculo || 'Carro',
      'Ano Fabricação': v.ano ? Number(v.ano) : '-',
      Cor: v.cor || '-',
      Numeração: v.numeracao || '-',
      Status: (v.status || 'DISPONIVEL').toString().toUpperCase(),
      'Ano CRLV': v.ano_crlv ? Number(v.ano_crlv) : '-',
      'KM Atual': v.km_atual ? Number(v.km_atual) : 0,
      'Tipo Combustível': v.tipo_combustivel || 'FLEX',
      Renavam: v.renavam || '-',
      Chassi: v.chassi || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajuste das larguras das colunas
    worksheet['!cols'] = [
      { wch: 12 }, // Placa
      { wch: 20 }, // Modelo
      { wch: 15 }, // Marca
      { wch: 16 }, // Tipo de Veículo
      { wch: 15 }, // Ano Fabricação
      { wch: 12 }, // Cor
      { wch: 12 }, // Numeração
      { wch: 15 }, // Status
      { wch: 12 }, // Ano CRLV
      { wch: 14 }, // KM Atual
      { wch: 18 }, // Tipo Combustível
      { wch: 18 }, // Renavam
      { wch: 22 }, // Chassi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Veiculos');

    XLSX.writeFile(workbook, `Relatorio_Veiculos_${new Date().getTime()}.xlsx`);
  } catch (err) {
    console.error('Erro na geração do Excel de veículos:', err);
    alert(`Erro ao exportar Excel: ${err.message}`);
  }
};

// --- MOTORISTAS ---
export const exportarMotoristasExcel = (motoristas) => {
  const dadosFormatados = motoristas.map((m) => ({
    Nome: m.nome || '-',
    CPF: m.cpf || '-',
    CNH: m.cnh || '-',
    Categoria: m.categoria_cnh || '-',
    'Vencimento CNH': m.vencimento_cnh
      ? new Date(m.vencimento_cnh).toLocaleDateString('pt-BR')
      : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Motoristas');
  XLSX.writeFile(
    workbook,
    `relatorio_motoristas_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

export const exportarMotoristasPDF = (motoristas) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Motoristas Cadastrados', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      14,
      22,
    );

    const colunas = ['Nome', 'CPF', 'CNH', 'Categoria', 'Vencimento CNH'];
    const linhas = motoristas.map((m) => [
      m.nome || '-',
      m.cpf || '-',
      m.cnh || '-',
      m.categoria_cnh || '-',
      m.vencimento_cnh
        ? new Date(m.vencimento_cnh).toLocaleDateString('pt-BR')
        : '-',
    ]);

    autoTable(doc, {
      startY: 28,
      head: [colunas],
      body: linhas,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
    });

    doc.save(
      `relatorio_motoristas_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  } catch (error) {
    alert(`Erro ao gerar PDF: ${error.message}`);
  }
};

// --- ABASTECIMENTOS ---
export const exportarAbastecimentosExcel = (dados) => {
  try {
    if (!dados || dados.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      return;
    }

    // 1. Mapeamento completo dos campos para o Excel
    const dadosFormatados = dados.map((a) => {
      // Tratamento da Data
      const rawData = a.data_abastecimento || a.data;
      let dataFormatada = '-';
      if (rawData) {
        const apenasData = rawData.toString().split('T')[0];
        const partes = apenasData.split('-');
        if (partes.length === 3) {
          dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
      }

      // Tratamento do KM
      const rawKm = a.km_abastecimento ?? a.km_atual ?? a.km;
      const kmValor =
        rawKm !== null && rawKm !== undefined && rawKm !== ''
          ? Number(rawKm)
          : '-';

      return {
        Data: dataFormatada,
        'Placa / Veículo': a.placa || a.veiculo_placa || a.veiculo_id || '-',
        Motorista: a.motorista_nome || a.motorista || '-',
        'Posto / Local': a.posto_nome || a.posto || '-',
        Combustível: a.tipo_combustivel || a.combustivel || '-',
        'Litros (L)': Number(a.litros || 0),
        'Valor Unitário (R$)': Number(a.valor_unitario || a.preco_litro || 0),
        'Valor Total (R$)': Number(a.valor_total || a.valor || 0),
        'Quilometragem (KM)': kmValor,
      };
    });

    // 2. Converte os dados em uma planilha (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // 3. Define larguras para as colunas não ficarem espremidas
    worksheet['!cols'] = [
      { wch: 12 }, // Data
      { wch: 16 }, // Placa / Veículo
      { wch: 25 }, // Motorista
      { wch: 25 }, // Posto / Local
      { wch: 15 }, // Combustível
      { wch: 12 }, // Litros
      { wch: 18 }, // Valor Unitário
      { wch: 16 }, // Valor Total
      { wch: 18 }, // Quilometragem
    ];

    // 4. Cria a pasta de trabalho (workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Abastecimentos');

    // 5. Gera o download da planilha
    XLSX.writeFile(
      workbook,
      `Relatorio_Abastecimentos_${new Date().getTime()}.xlsx`,
    );
  } catch (err) {
    console.error('Erro na geração do Excel:', err);
    alert(`Erro ao exportar para o Excel: ${err.message}`);
  }
};

export const exportarAbastecimentosPDF = (dados) => {
  try {
    // 1. Instancia o PDF no modo horizontal (landscape)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // 2. Título e subcabeçalho
    doc.setFontSize(16);
    doc.text('Relatório Completo de Abastecimentos', 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    const dataEmissao = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataEmissao}`, 14, 21);

    // 3. Definição das Colunas
    const colunas = [
      { header: 'Data', dataKey: 'data' },
      { header: 'Veículo', dataKey: 'veiculo' },
      { header: 'Motorista', dataKey: 'motorista' },
      { header: 'Posto / Local', dataKey: 'posto' },
      { header: 'Combustível', dataKey: 'combustivel' },
      { header: 'Litros', dataKey: 'litros' },
      { header: 'Valor/L (R$)', dataKey: 'valorUnitario' },
      { header: 'Total (R$)', dataKey: 'valorTotal' },
      { header: 'KM Atual', dataKey: 'km' },
    ];

    // 4. Mapeamento dos Dados
    const linhas = (dados || []).map((a) => {
      // Data
      const rawData = a.data_abastecimento || a.data;
      let dataFormatada = '-';
      if (rawData) {
        const apenasData = rawData.toString().split('T')[0];
        const partes = apenasData.split('-');
        if (partes.length === 3) {
          dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
      }

      // KM
      const rawKm = a.km_abastecimento ?? a.km_atual ?? a.km;
      const kmFormatado =
        rawKm !== null && rawKm !== undefined && rawKm !== ''
          ? `${Number(rawKm).toLocaleString('pt-BR')} km`
          : '-';

      // Valores
      const litrosVal = Number(a.litros || 0).toFixed(2);
      const unitarioVal = Number(
        a.valor_unitario || a.preco_litro || 0,
      ).toFixed(2);
      const totalVal = Number(a.valor_total || a.valor || 0).toFixed(2);

      return {
        data: dataFormatada,
        veiculo: a.placa || a.veiculo_placa || a.veiculo_id || '-',
        motorista: a.motorista_nome || a.motorista || '-',
        posto: a.posto_nome || a.posto || '-',
        combustivel: a.tipo_combustivel || a.combustivel || '-',
        litros: `${litrosVal} L`,
        valorUnitario: `R$ ${unitarioVal}`,
        valorTotal: `R$ ${totalVal}`,
        km: kmFormatado,
      };
    });

    // 5. Chamada direta do autoTable enviando o doc como primeiro argumento
    autoTable(doc, {
      columns: colunas,
      body: linhas,
      startY: 26,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        data: { halign: 'center' },
        veiculo: { fontStyle: 'bold', halign: 'center' },
        combustivel: { halign: 'center' },
        litros: { halign: 'right' },
        valorUnitario: { halign: 'right' },
        valorTotal: { halign: 'right', fontStyle: 'bold' },
        km: { halign: 'right' },
      },
      margin: { top: 25, left: 10, right: 10, bottom: 10 },
    });

    // 6. Download do PDF
    doc.save(`Relatorio_Abastecimentos_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error('Erro detalhado na geração do PDF:', err);
    alert(`Ocorreu um erro ao gerar o PDF: ${err.message}`);
  }
};

 
// ----------------------------------------------------
// EXPORTAÇÃO EXCEL
// ----------------------------------------------------

// Helper para formatar todos os itens inspecionados do checklist em texto contínuo
const formatarItensInspecionados = (c) => {
  const itens = [];

  // Documentação e Emergência
  if (c.documento_crlv) itens.push(`CRLV: ${c.documento_crlv}`);
  if (c.triangulo && c.triangulo !== 'N_A')
    itens.push(`Triângulo: ${c.triangulo}`);
  if (c.chave_roda && c.chave_roda !== 'N_A')
    itens.push(`Chave Roda: ${c.chave_roda}`);
  if (c.macaco && c.macaco !== 'N_A') itens.push(`Macaco: ${c.macaco}`);
  if (c.extintor && c.extintor !== 'N_A') itens.push(`Extintor: ${c.extintor}`);
  if (c.tacografos_faixas && c.tacografos_faixas !== 'N_A')
    itens.push(`Tacógrafo/Faixas: ${c.tacografos_faixas}`);
  if (c.epis_capacete && c.epis_capacete !== 'N_A')
    itens.push(`EPIs/Capacete: ${c.epis_capacete}`);

  // Níveis e Mecânica
  if (c.nivel_oleo) itens.push(`Óleo Motor: ${c.nivel_oleo}`);
  if (c.liquido_arrefecimento && c.liquido_arrefecimento !== 'N_A')
    itens.push(`Arrefecimento: ${c.liquido_arrefecimento}`);
  if (c.sistema_freio) itens.push(`Freios: ${c.sistema_freio}`);
  if (c.suspensao_transmissao)
    itens.push(`Suspensão: ${c.suspensao_transmissao}`);
  if (c.hidraulico_munck && c.hidraulico_munck !== 'N_A')
    itens.push(`Hidráulico/Munck: ${c.hidraulico_munck}`);

  // Pneus e Rodagem
  if (c.pneu_dd) itens.push(`Pneu DD: ${c.pneu_dd}`);
  if (c.pneu_de && c.pneu_de !== 'N_A') itens.push(`Pneu DE: ${c.pneu_de}`);
  if (c.pneu_td) itens.push(`Pneu TD: ${c.pneu_td}`);
  if (c.pneu_te && c.pneu_te !== 'N_A') itens.push(`Pneu TE: ${c.pneu_te}`);
  if (c.estepe && c.estepe !== 'N_A') itens.push(`Estepe: ${c.estepe}`);

  // Iluminação e Visibilidade
  if (c.eletrica_farois) itens.push(`Faróis/Elétrica: ${c.eletrica_farois}`);
  if (c.parabrisa_limpadores && c.parabrisa_limpadores !== 'N_A')
    itens.push(`Para-brisa: ${c.parabrisa_limpadores}`);

  return itens.join(' | ');
};

const fmt = (v) => (v !== undefined && v !== null && v !== '' ? v : '-');
// ----------------------------------------------------
// EXPORTAÇÃO EXCEL
// ----------------------------------------------------
export const exportarChecklistsExcel = (listaChecklists) => {
  try {
    if (!listaChecklists || listaChecklists.length === 0) {
      alert('Nenhum checklist para exportar.');
      return;
    }

    const dadosMapeados = listaChecklists.map((c) => ({
      ID: c.id,
      Tipo: fmt(c.tipo_checklist) || 'ABERTURA',
      Data: c.data_checklist ? new Date(c.data_checklist).toLocaleString('pt-BR') : '-',
      Veículo: fmt(c.placa || c.veiculo_placa || c.veiculo_id),
      Motorista: fmt(c.motorista_nome || c.motorista),
      'KM Atual': c.km_atual || 0,
      Combustível: fmt(c.nivel_combustivel),
      'Cartão Combustível': fmt(c.cartao_combustivel),
      Status: c.status_geral === 'COM_PENDENCIA' ? 'COM PENDÊNCIA' : 'APROVADO',
      
      // Documentação e Emergência
      'Doc CRLV': fmt(c.documento_crlv),
      'Triângulo': fmt(c.triangulo),
      'Chave Roda': fmt(c.chave_roda),
      'Macaco': fmt(c.macaco),
      'Extintor': fmt(c.extintor),
      'Tacógrafo/Faixas': fmt(c.tacografos_faixas),
      'EPIs/Capacete': fmt(c.epis_capacete),

      // Níveis e Mecânica
      'Nível Óleo': fmt(c.nivel_oleo),
      'Arrefecimento': fmt(c.liquido_arrefecimento),
      'Freios': fmt(c.sistema_freio),
      'Suspensão/Transm.': fmt(c.suspensao_transmissao),
      'Hidráulico/Munck': fmt(c.hidraulico_munck),

      // Pneus e Rodagem
      'Pneu DD': fmt(c.pneu_dd),
      'Pneu DE': fmt(c.pneu_de),
      'Pneu TD': fmt(c.pneu_td),
      'Pneu TE': fmt(c.pneu_te),
      'Estepe': fmt(c.estepe),

      // Iluminação e Visibilidade
      'Faróis/Elétrica': fmt(c.eletrica_farois),
      'Para-brisa/Limpadores': fmt(c.parabrisa_limpadores),

      Observações: fmt(c.observacoes),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosMapeados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklists');

    XLSX.writeFile(
      workbook,
      `Relatorio_Checklists_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  } catch (err) {
    console.error('Erro ao exportar Excel:', err);
    alert('Erro ao gerar arquivo Excel.');
  }
};

// ----------------------------------------------------
// EXPORTAÇÃO PDF (Colunas separadas para cada item)
// ----------------------------------------------------
export const exportarChecklistsPDF = (listaChecklists) => {
  try {
    if (!listaChecklists || listaChecklists.length === 0) {
      alert('Nenhum checklist para exportar.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' }); // Formato A3 Paisagem para acomodar todas as colunas

    doc.setFontSize(14);
    doc.text('Relatório Completo de Checklists de Inspeção (Todas as Colunas)', 14, 15);

    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 21);

    const colunas = [
      'ID',
      'Tipo',
      'Data',
      'Veículo',
      'Motorista',
      'KM',
      'Comb.',
      'Cartão',
      'Status',
      'CRLV',
      'Triân.',
      'Chave',
      'Macaco',
      'Extint.',
      'Tacóg.',
      'EPIs',
      'Óleo',
      'Arref.',
      'Freios',
      'Susp.',
      'Munck',
      'Pneu DD',
      'Pneu DE',
      'Pneu TD',
      'Pneu TE',
      'Estepe',
      'Faróis',
      'Limp.',
      'Obs',
    ];

    const linhas = listaChecklists.map((c) => [
      c.id,
      fmt(c.tipo_checklist),
      c.data_checklist ? new Date(c.data_checklist).toLocaleDateString('pt-BR') : '-',
      fmt(c.placa || c.veiculo_placa || c.veiculo_id),
      fmt(c.motorista_nome || c.motorista),
      c.km_atual ? Number(c.km_atual).toLocaleString('pt-BR') : '-',
      fmt(c.nivel_combustivel),
      fmt(c.cartao_combustivel),
      c.status_geral === 'COM_PENDENCIA' ? 'PEND.' : 'OK',
      fmt(c.documento_crlv),
      fmt(c.triangulo),
      fmt(c.chave_roda),
      fmt(c.macaco),
      fmt(c.extintor),
      fmt(c.tacografos_faixas),
      fmt(c.epis_capacete),
      fmt(c.nivel_oleo),
      fmt(c.liquido_arrefecimento),
      fmt(c.sistema_freio),
      fmt(c.suspensao_transmissao),
      fmt(c.hidraulico_munck),
      fmt(c.pneu_dd),
      fmt(c.pneu_de),
      fmt(c.pneu_td),
      fmt(c.pneu_te),
      fmt(c.estepe),
      fmt(c.eletrica_farois),
      fmt(c.parabrisa_limpadores),
      fmt(c.observacoes),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [colunas],
      body: linhas,
      styles: { fontSize: 6, cellPadding: 1, overflow: 'linebreak' },
      headStyles: { fillColor: [30, 41, 59] },
      margin: { left: 8, right: 8 },
    });

    doc.save(`Relatorio_Checklists_Completo_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Erro ao exportar PDF:', err);
    alert('Erro ao gerar arquivo PDF.');
  }
};