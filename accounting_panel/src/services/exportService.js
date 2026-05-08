import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * jsPDF default fonts don't support Turkish characters or ₺.
 * This function converts them to safe equivalents.
 */
const toSafeText = (text) => {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/₺/g, 'TL')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
};

const formatCurrency = (amount) =>
  `TL ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

/**
 * Excel Export - Combined into Single Sheet for better visibility
 */
export const exportToExcel = (stats, filename) => {
  const { totalIncome, totalExpense, categoryData, dailyData } = stats;

  // 1. Prepare Summary Part
  const rows = [
    ['FATURA OZET RAPORU'],
    ['-------------------'],
    ['Detay', 'Tutar'],
    ['Odenen Faturalar', `TL ${totalIncome.toFixed(2)}`],
    ['Bekleyen Faturalar', `TL ${totalExpense.toFixed(2)}`],
    ['Toplam Tutar', `TL ${(totalIncome + totalExpense).toFixed(2)}`],
    ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')],
    [''], // Spacer
    
    // 2. Prepare Categories Part
    ['KATEGORI BAZLI DAGILIM'],
    ['----------------------'],
    ['Kategori Adi', 'Durum', 'Tutar']
  ];

  // Alphabetically sort categories
  const sortedCategories = [...(categoryData || [])].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '', 'tr')
  );

  sortedCategories.forEach(c => {
    rows.push([
      c.name,
      c.type === 'INCOME' ? 'Odenen' : 'Bekleyen',
      `TL ${Number(c.value).toFixed(2)}`
    ]);
  });

  rows.push(['']); // Spacer row
  
  // 3. Prepare Daily Analysis Part
  if (dailyData && dailyData.length > 0) {
    rows.push(['GUNLUK FATURA ANALIZI']);
    rows.push(['-----------------------']);
    rows.push(['Tarih', 'Odenen (TL)', 'Bekleyen (TL)']);
    
    dailyData.forEach(d => {
      rows.push([d.dateStr, d.income.toFixed(2), d.expense.toFixed(2)]);
    });
  }

  // Create Worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Styling: Bold headers (AOA to Sheet doesn't handle styles well without extra plugins, 
  // but we can set generic column widths)
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Finansal Rapor');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * PDF Export
 */
export const exportToPDF = (stats, filename) => {
  const { totalIncome, totalExpense, categoryData } = stats;
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleDateString('tr-TR');

  const primaryColor = [99, 102, 241];
  const successColor = [16, 185, 129];
  const dangerColor  = [239, 68, 68];
  const totalAmount  = totalIncome + totalExpense;

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Beyza Muhasebe AI', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Fatura Ozet Raporu', 14, 27);
  doc.text(`Tarih: ${timestamp}`, 196, 27, { align: 'right' });

  const boxY = 48, boxH = 26;
  const drawBox = (x, w, color, label, value) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.8);
    doc.rect(x, boxY, w, boxH);
    doc.setTextColor(...color);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 4, boxY + 8);
    doc.setFontSize(13);
    doc.text(value, x + 4, boxY + 20);
  };
  drawBox(14,  56, successColor, 'ODENEN FATURALAR', formatCurrency(totalIncome));
  drawBox(77,  56, dangerColor,  'BEKLEYEN FATURALAR', formatCurrency(totalExpense));
  drawBox(140, 56, primaryColor,  'TOPLAM TUTAR',       formatCurrency(totalAmount));

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori Bazli Dagilim', 14, 90);

  const sortedCategories = [...(categoryData || [])].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '', 'tr')
  );

  const tableData = sortedCategories.map(c => [
    toSafeText(c.name),
    c.type === 'INCOME' ? 'Odenen' : 'Bekleyen',
    formatCurrency(c.value)
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Kategori Adi', 'Durum', 'Tutar']],
    body: tableData,
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    theme: 'striped'
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Word (DOC) Export using HTML Blob method
 */
export const exportToWord = (stats, filename) => {
  const { totalIncome, totalExpense, categoryData } = stats;
  const totalAmount = totalIncome + totalExpense;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Fatura Raporu</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
      .header { background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 10px; }
      .summary-container { margin: 20px 0; display: table; width: 100%; border-spacing: 10px; }
      .summary-box { display: table-cell; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: center; }
      .income { color: #10b981; border-color: #10b981; }
      .expense { color: #ef4444; border-color: #ef4444; }
      .profit { color: #6366f1; border-color: #6366f1; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background-color: #6366f1; color: white; padding: 12px; text-align: left; }
      td { padding: 10px; border-bottom: 1px solid #ddd; }
      .footer { margin-top: 50px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
    </head>
    <body>
      <div class="header">
        <h1>Beyza Muhasebe AI</h1>
        <p>Fatura Durum Raporu - ${new Date().toLocaleDateString('tr-TR')}</p>
      </div>

      <div class="summary-container">
        <div class="summary-box income">
          <strong>ÖDENEN FATURALAR</strong><br/>
          <span>${formatCurrency(totalIncome)}</span>
        </div>
        <div class="summary-box expense">
          <strong>BEKLEYEN FATURALAR</strong><br/>
          <span>${formatCurrency(totalExpense)}</span>
        </div>
        <div class="summary-box profit">
          <strong>TOPLAM TUTAR</strong><br/>
          <span>${formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <h3>Kategori Bazlı Dağılım</h3>
      <table>
        <thead>
          <tr>
            <th>Kategori Adı</th>
            <th>Durum</th>
            <th>Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${[...(categoryData || [])]
            .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'))
            .map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.type === 'INCOME' ? 'Ödenen' : 'Bekleyen'}</td>
              <td>${formatCurrency(c.value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Bu rapor sistem tarafından otomatik olarak oluşturulmuştur.</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
