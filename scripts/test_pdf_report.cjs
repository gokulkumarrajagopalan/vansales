const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { jsPDF } = require(path.resolve(__dirname, '../webapp/node_modules/jspdf'));
const autoTable = require(path.resolve(__dirname, '../webapp/node_modules/jspdf-autotable')).default;

const logoBase64 = fs.readFileSync(path.resolve(__dirname, 'logo_96_base64.txt'), 'utf8').trim();

const company = {
  name: 'Talliffy Distribution & Van Sales Ltd.',
  tradeName: 'Talliffy Direct Van Sales',
  address: 'Plot 42, Peenya Industrial Area, Phase II',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560058',
  country: 'India',
  taxNumber: 'GSTIN29AAACA9021K1ZZ',
  registrationNumber: 'CIN-U51909KA2021PTC148901',
  phone: '+91 98450 10001',
  email: 'admin1@talliffy.com',
  currency: 'INR',
  currencySymbol: '₹',
};

const party = {
  name: 'Metro Hypermarket',
  code: 'CUST-001',
  taxId: 'GSTIN29AAACM1234A1Z1',
  phone: '+91 98860 11223',
  address: '100 Feet Ring Road, Hebbal',
  type: 'customer',
};

const statementData = {
  fromDate: '2026-04-01',
  toDate: '2026-11-13',
  openingBalance: 65000,
  rows: [
    {
      date: '2026-11-13',
      voucherNumber: 'SALE-2026-001',
      voucherType: 'sales',
      narration: 'Van 01 B2B Sales Invoice — Hebbal Belt (30 Days Credit)',
      debit: 9440,
      credit: 0,
      runningBalance: 74440,
    },
    {
      date: '2026-11-13',
      voucherNumber: 'RCT-2026-001',
      voucherType: 'receipt',
      narration: 'On-account collection received from Metro Hypermarket',
      debit: 0,
      credit: 15000,
      runningBalance: 59440,
    },
  ],
  totalDebit: 9440,
  totalCredit: 15000,
  closingBalance: 59440,
};

function generateTestPdf(outputPath) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top decorative corporate band (Primary Navy #0E2E91)
  doc.setFillColor(14, 46, 145);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Secondary accent thin band (Cyan #38BDF8)
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  let currentY = 13;

  // Company Logo Badge - use official logo
  doc.addImage(logoBase64, 'PNG', 14, currentY, 15, 15);

  // Company Legal Header
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(company.name.toUpperCase(), 33, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(company.tradeName || 'Wholesale Distribution & Fleet Sales Management ERP', 33, currentY + 8);

  const postal = company.postalCode || '560058';
  const addressLine = `${company.address}, ${company.city}, ${company.state} - ${postal}, ${company.country}`;
  doc.text(addressLine, 33, currentY + 11.5);

  const regNum = company.registrationNumber || 'CIN-U51909KA2021PTC148901';
  const contactLine = `Tax ID / GSTIN: ${company.taxNumber}  |  CIN/Reg: ${regNum}  |  Tel: ${company.phone}  |  Email: ${company.email}`;
  doc.text(contactLine, 33, currentY + 15);

  // Right Side: Document Type Badge & Identification
  const rightX = pageWidth - 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(14, 46, 145);
  doc.text('CUSTOMER STATEMENT', rightX, currentY + 4, { align: 'right' });

  // Badge label
  const badgeLabel = 'ACCOUNT STATEMENT';
  doc.setFillColor(14, 46, 145);
  const badgeWidth = doc.getTextWidth(badgeLabel) + 6;
  doc.roundedRect(rightX - badgeWidth, currentY + 6, badgeWidth, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(badgeLabel, rightX - (badgeWidth / 2), currentY + 9.5, { align: 'center' });

  currentY += 19;

  // Corporate divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 4;

  // Metadata Panel
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 1.5, 1.5, 'S');

  // Left Box: Party details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STATEMENT ISSUED TO / ACCOUNT:', 18, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${party.name} (${party.code})`, 18, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const details = [
    party.taxId ? `Tax ID: ${party.taxId}` : '',
    party.phone ? `Ph: ${party.phone}` : '',
    party.address ? party.address : '',
  ].filter(Boolean).join('  |  ');
  doc.text(details, 18, currentY + 12.5);

  // Right Box: Accounting Period & Safe Currency
  const periodRightX = pageWidth - 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNTING PERIOD / AS OF:', periodRightX, currentY + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 46, 145);
  doc.text(`${statementData.fromDate} to ${statementData.toDate}`, periodRightX, currentY + 8.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  // Safe currency text - NEVER outputs '¹'!
  doc.text(`Base Currency: INR (Rs.)`, periodRightX, currentY + 12.5, { align: 'right' });

  currentY += 20;

  // Currency label for table: Rs.
  const curr = 'Rs.';
  const fmt = (num) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tableBody = [
    // Opening balance row
    [
      statementData.fromDate,
      '-',
      'OPENING BALANCE B/F',
      'Balance brought forward from previous period',
      statementData.openingBalance >= 0 ? fmt(Math.abs(statementData.openingBalance)) : '-',
      statementData.openingBalance < 0 ? fmt(Math.abs(statementData.openingBalance)) : '-',
      `${fmt(Math.abs(statementData.openingBalance))} ${statementData.openingBalance >= 0 ? 'Dr' : 'Cr'}`,
    ],
    // Vouchers
    ...statementData.rows.map(r => [
      r.date,
      r.voucherNumber,
      r.voucherType.toUpperCase().replace('_', ' '),
      r.narration || '-',
      r.debit > 0 ? fmt(r.debit) : '-',
      r.credit > 0 ? fmt(r.credit) : '-',
      `${fmt(Math.abs(r.runningBalance))} ${r.runningBalance >= 0 ? 'Dr' : 'Cr'}`,
    ]),
    // Period Totals
    [
      { content: '', colSpan: 3, styles: { fillColor: [238, 242, 255] } },
      { content: 'PERIOD TOTALS', styles: { fontStyle: 'bold', fillColor: [238, 242, 255], halign: 'right' } },
      { content: fmt(statementData.totalDebit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
      { content: fmt(statementData.totalCredit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
      { content: '', styles: { fillColor: [238, 242, 255] } },
    ],
    // Net Closing Balance
    [
      { content: statementData.toDate, styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: 'CLOSING', styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: 'NET CLOSING BALANCE', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: '', colSpan: 2, styles: { fillColor: [224, 231, 255] } },
      {
        content: `Rs. ${fmt(Math.abs(statementData.closingBalance))} ${statementData.closingBalance >= 0 ? 'Dr' : 'Cr'}`,
        styles: { fontStyle: 'bold', halign: 'right', fillColor: [224, 231, 255], textColor: [14, 46, 145] },
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY + 2,
    head: [
      ['Date', 'Voucher #', 'Type', 'Description / Narration', 'Debit (Rs.)', 'Credit (Rs.)', 'Balance (Rs.)'],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145], // Brand Royal Blue #0E2E91
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 19 },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 47 },
      4: { cellWidth: 23, halign: 'right' },
      5: { cellWidth: 23, halign: 'right' },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Right-align the header for financial columns 4, 5, 6
      if (data.section === 'head' && (data.column.index === 4 || data.column.index === 5 || data.column.index === 6)) {
        data.cell.styles.halign = 'right';
      }
    },
  });

  // Footer
  const footerY = pageHeight - 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`${company.name}  *  Talliffy Van Sales Suite  *  Generated: ${new Date().toLocaleString()}`, 14, footerY + 1.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 1 of 1', pageWidth - 14, footerY + 1.5, { align: 'right' });

  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
  console.log('Saved PDF to', outputPath);
}

generateTestPdf('scripts/test_statement.pdf');
