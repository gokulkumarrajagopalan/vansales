import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyProfile, Voucher, Customer, Supplier, LedgerAccount, Item } from '../types/erp';
import { TALLIFFY_LOGO_BASE64 } from './logoBase64';

interface LetterheadOptions {
  title: string;
  subtitle?: string;
  docNumber?: string;
  docDate?: string;
  periodLabel?: string;
  partyName?: string;
  partyAddress?: string;
  partyTaxId?: string;
  partyPhone?: string;
  partyCode?: string;
  badgeLabel?: string;
  badgeColor?: [number, number, number]; // RGB
}

/**
 * Normalizes currency symbol for standard jsPDF 8-bit fonts.
 * In jsPDF default WinAnsi encoding, the Indian Rupee symbol '₹' (\u20B9) overflows to '\u00B9' ('¹').
 * Using 'Rs.' or currency code ensures 100% clean, standard, professional rendering without broken glyphs.
 */
export const getPdfCurrencySymbol = (symbol?: string, code?: string): string => {
  if (!symbol || symbol === '₹' || symbol.includes('₹')) {
    return 'Rs.';
  }
  return symbol;
};

/**
 * Draws the high-res corporate letterhead at the top of the PDF page
 * Returns the Y position where the document body should begin.
 */
export const drawCompanyLetterhead = (
  doc: jsPDF,
  company: CompanyProfile,
  options: LetterheadOptions
): number => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top decorative corporate band (Primary Navy #0E2E91)
  doc.setFillColor(14, 46, 145);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Secondary accent thin band (Cyan #38BDF8)
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  let currentY = 13;

  // Company Logo Badge - Official Talliffy Brand Logo
  try {
    doc.addImage(TALLIFFY_LOGO_BASE64, 'PNG', 14, currentY, 15, 15);
  } catch {
    doc.setFillColor(14, 46, 145);
    doc.roundedRect(14, currentY, 15, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TL', 21.5, currentY + 9, { align: 'center' });
  }

  // Company Legal Header
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(company.name.toUpperCase(), 33, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(company.tradeName || 'Wholesale Distribution & Fleet Sales Management ERP', 33, currentY + 8);

  // Address & Tax Registration info
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
  doc.text(options.title.toUpperCase(), rightX, currentY + 4, { align: 'right' });

  if (options.badgeLabel) {
    const badgeColor = options.badgeColor || [14, 46, 145];
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    const badgeWidth = doc.getTextWidth(options.badgeLabel.toUpperCase()) + 6;
    doc.roundedRect(rightX - badgeWidth, currentY + 6, badgeWidth, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(options.badgeLabel.toUpperCase(), rightX - (badgeWidth / 2), currentY + 9.5, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  if (options.docNumber) {
    doc.text(`Doc Ref: ${options.docNumber}`, rightX, currentY + 14, { align: 'right' });
  }
  if (options.docDate) {
    doc.text(`Date: ${options.docDate}`, rightX, currentY + 17.5, { align: 'right' });
  }

  currentY += 19;

  // Solid corporate divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 4;

  // Metadata Panel (Party / Account details & Statement period)
  if (options.partyName || options.periodLabel) {
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, currentY, pageWidth - 28, 16, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, currentY, pageWidth - 28, 16, 1.5, 1.5, 'S');

    // Left Box: Party details
    if (options.partyName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('STATEMENT ISSUED TO / ACCOUNT:', 18, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const partyStr = options.partyCode ? `${options.partyName} (${options.partyCode})` : options.partyName;
      doc.text(partyStr, 18, currentY + 8.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const details = [
        options.partyTaxId ? `Tax ID: ${options.partyTaxId}` : '',
        options.partyPhone ? `Ph: ${options.partyPhone}` : '',
        options.partyAddress ? options.partyAddress : '',
      ].filter(Boolean).join('  |  ');
      if (details) {
        doc.text(details, 18, currentY + 12.5);
      }
    }

    // Right Box: Accounting Period & Safe Currency Display
    const periodRightX = pageWidth - 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('ACCOUNTING PERIOD / AS OF:', periodRightX, currentY + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(14, 46, 145);
    doc.text(options.periodLabel || new Date().toLocaleDateString('en-GB'), periodRightX, currentY + 8.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const safeCurrency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
    doc.text(`Base Currency: ${company.currency || 'INR'} (${safeCurrency})`, periodRightX, currentY + 12.5, { align: 'right' });

    currentY += 20;
  }

  return currentY;
};

/**
 * Attaches multi-page official corporate footer with signatures and pagination
 */
export const drawCompanyFooter = (
  doc: jsPDF,
  company: CompanyProfile,
  signatoryTitle = 'Authorised Signatory'
) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // If last page, draw the formal authorized signature block
    if (i === pageCount) {
      const sigY = pageHeight - 34;

      // Legal declaration note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Declaration: This is an official computer-generated statement from the single-tenant ERP instance.',
        14,
        sigY + 5
      );
      doc.text(
        'All entries are validated according to double-entry accounting standards.',
        14,
        sigY + 9
      );
      doc.text(
        'E. & O.E. Subject to company jurisdiction.',
        14,
        sigY + 13
      );

      // Signatory Box
      const sigBoxRight = pageWidth - 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(14, 46, 145);
      doc.text(`For ${company.name.toUpperCase()}`, sigBoxRight, sigY + 5, { align: 'right' });

      // Signature line
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.line(sigBoxRight - 45, sigY + 17, sigBoxRight, sigY + 17);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(signatoryTitle, sigBoxRight - 22.5, sigY + 21, { align: 'center' });
    }

    // Bottom decorative bar
    const footerY = pageHeight - 8;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${company.name}  •  Talliffy Van Sales Suite  •  Generated: ${new Date().toLocaleString()}`,
      14,
      footerY + 1.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      footerY + 1.5,
      { align: 'right' }
    );
  }
};

/**
 * 1. Export Balance Sheet as Professional PDF
 */
export const exportBalanceSheetPdf = (
  company: CompanyProfile,
  data: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    assetRows: Array<{ name: string; amount: number }>;
    liabilityRows: Array<{ name: string; amount: number }>;
    equityRows: Array<{ name: string; amount: number }>;
    netProfit: number;
  },
  asOfDate = '26 October 2026'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = drawCompanyLetterhead(doc, company, {
    title: 'Balance Sheet',
    periodLabel: `As of ${asOfDate}`,
    badgeLabel: 'Financial Position',
    badgeColor: [16, 185, 129],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => `${currency} ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Prepare two-column balance sheet data (Assets on Left, Liabilities & Equity on Right)
  const leftCol: any[][] = [
    [{ content: 'ASSETS & RESOURCES', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ...data.assetRows.map(r => [r.name, fmt(r.amount)]),
    [{ content: 'TOTAL ASSETS', styles: { fontStyle: 'bold', fillColor: [238, 242, 255] } },
     { content: fmt(data.totalAssets), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } }]
  ];

  const totalLiabAndEquity = data.totalLiabilities + data.totalEquity;
  const rightCol: any[][] = [
    [{ content: 'LIABILITIES & OBLIGATIONS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ...data.liabilityRows.map(r => [r.name, fmt(r.amount)]),
    [{ content: 'CAPITAL & EQUITY', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ...data.equityRows.map(r => [r.name, fmt(r.amount)]),
    [{ content: 'Net Profit / (Loss) for Period', styles: { fontStyle: 'italic' } }, fmt(data.netProfit)],
    [{ content: 'TOTAL LIABILITIES & EQUITY', styles: { fontStyle: 'bold', fillColor: [238, 242, 255] } },
     { content: fmt(totalLiabAndEquity), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } }]
  ];

  // Combined Rows for AutoTable
  const maxRows = Math.max(leftCol.length, rightCol.length);
  const tableBody: any[] = [];

  for (let i = 0; i < maxRows; i++) {
    const lItem = leftCol[i] || ['', ''];
    const rItem = rightCol[i] || ['', ''];

    tableBody.push([
      lItem[0] || '',
      lItem[1] || '',
      rItem[0] || '',
      rItem[1] || '',
    ]);
  }

  autoTable(doc, {
    startY: startY + 2,
    head: [
      [
        { content: 'Particulars (Assets)', styles: { halign: 'left' } },
        { content: `Amount (${currency})`, styles: { halign: 'right' } },
        { content: 'Particulars (Liabilities & Equity)', styles: { halign: 'left' } },
        { content: `Amount (${currency})`, styles: { halign: 'right' } },
      ],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 55 },
      3: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (cellData) => {
      if (cellData.section === 'head' && (cellData.column.index === 1 || cellData.column.index === 3)) {
        cellData.cell.styles.halign = 'right';
      }
    },
  });

  drawCompanyFooter(doc, company, 'Finance Director / Signatory');
  doc.save(`Balance_Sheet_${company.name.replace(/\s+/g, '_')}_${asOfDate.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 2. Export Trial Balance as Professional PDF
 */
export const exportTrialBalancePdf = (
  company: CompanyProfile,
  data: {
    rows: Array<{ ledger: LedgerAccount; debit: number; credit: number }>;
    totalDebit: number;
    totalCredit: number;
  },
  asOfDate = '26 October 2026'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const diff = Math.abs(data.totalDebit - data.totalCredit);
  const isBalanced = diff < 0.05;

  const startY = drawCompanyLetterhead(doc, company, {
    title: 'Trial Balance',
    periodLabel: `Closing as of ${asOfDate}`,
    badgeLabel: isBalanced ? 'Mathematically Balanced' : 'Out of Balance',
    badgeColor: isBalanced ? [16, 185, 129] : [225, 29, 72],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tableBody: any[] = data.rows.map((r, idx) => [
    idx + 1,
    r.ledger.code,
    r.ledger.name,
    r.ledger.type.toUpperCase(),
    r.debit > 0 ? fmt(r.debit) : '-',
    r.credit > 0 ? fmt(r.credit) : '-',
  ]);

  // Grand total row
  tableBody.push([
    { content: '', colSpan: 3, styles: { fillColor: [238, 242, 255] } },
    { content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [238, 242, 255], halign: 'right' } },
    { content: `${currency} ${fmt(data.totalDebit)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
    { content: `${currency} ${fmt(data.totalCredit)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
  ]);

  autoTable(doc, {
    startY: startY + 2,
    head: [
      ['#', 'Code', 'Ledger Account Particulars', 'Account Type', `Debit Balance (${currency})`, `Credit Balance (${currency})`],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
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
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18, fontStyle: 'bold' },
      2: { cellWidth: 74, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (cellData) => {
      if (cellData.section === 'head' && (cellData.column.index === 4 || cellData.column.index === 5)) {
        cellData.cell.styles.halign = 'right';
      }
    },
  });

  drawCompanyFooter(doc, company, 'Chief Accountant');
  doc.save(`Trial_Balance_${company.name.replace(/\s+/g, '_')}_${asOfDate.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 3. Export Profit & Loss Statement as Professional PDF
 */
export const exportProfitLossPdf = (
  company: CompanyProfile,
  data: {
    tradingIncome: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    expenseDetails: Array<{ name: string; amount: number }>;
  },
  periodLabel = 'FY 2026-27 (1 Apr 2026 - 26 Oct 2026)'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = drawCompanyLetterhead(doc, company, {
    title: 'Profit & Loss Statement',
    periodLabel,
    badgeLabel: 'Trading & Operating Report',
    badgeColor: [14, 46, 145],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => `${currency} ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tableBody: any[] = [
    // Revenue Section
    [{ content: 'I. TRADING REVENUE (SALES TURNOVER)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ['Gross Invoiced Sales & Van Field Collections', fmt(data.tradingIncome)],
    [{ content: 'TOTAL TRADING REVENUE (A)', styles: { fontStyle: 'bold' } }, fmt(data.tradingIncome)],

    // COGS Section
    [{ content: 'II. DIRECT COST OF GOODS SOLD (COGS)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ['Purchase Inward & Inventory Procurement', fmt(data.costOfGoodsSold)],
    [{ content: 'TOTAL COST OF GOODS SOLD (B)', styles: { fontStyle: 'bold' } }, `(${fmt(data.costOfGoodsSold)})`],

    // Gross Profit
    [{ content: 'GROSS PROFIT (A - B)', styles: { fontStyle: 'bold', fillColor: [238, 242, 255] } },
     { content: fmt(data.grossProfit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } }],

    // Operating Expenses
    [{ content: 'III. OPERATING, FLEET & INDIRECT EXPENSES', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
    ...data.expenseDetails.map(e => [e.name, fmt(e.amount)]),
    [{ content: 'TOTAL OPERATING EXPENSES (C)', styles: { fontStyle: 'bold' } }, `(${fmt(data.operatingExpenses)})`],

    // Net Profit
    [{ content: 'NET PROFIT FOR THE PERIOD (Gross Profit - C)', styles: { fontStyle: 'bold', fillColor: [209, 250, 229] } },
     { content: fmt(data.netProfit), styles: { fontStyle: 'bold', halign: 'right', textColor: [6, 95, 70], fillColor: [209, 250, 229] } }],
  ];

  autoTable(doc, {
    startY: startY + 2,
    head: [
      ['Financial Performance Item / Particulars', `Amount (${currency})`],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 135 },
      1: { cellWidth: 47, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (cellData) => {
      if (cellData.section === 'head' && cellData.column.index === 1) {
        cellData.cell.styles.halign = 'right';
      }
    },
  });

  drawCompanyFooter(doc, company, 'Finance Director');
  doc.save(`Profit_and_Loss_${company.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 4. Export Ledger Statement (Customer, Supplier, General Ledger) as Professional PDF
 */
export const exportLedgerStatementPdf = (
  company: CompanyProfile,
  party: {
    name: string;
    code?: string;
    address?: string;
    taxId?: string;
    phone?: string;
    type: 'customer' | 'supplier' | 'general_ledger';
  },
  statementData: {
    fromDate: string;
    toDate: string;
    openingBalance: number;
    rows: Array<{
      date: string;
      voucherNumber: string;
      voucherType: string;
      narration: string;
      debit: number;
      credit: number;
      runningBalance: number;
    }>;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
  }
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const typeLabel = party.type === 'customer'
    ? 'Customer Statement'
    : party.type === 'supplier'
    ? 'Supplier Statement'
    : 'General Ledger Statement';

  const startY = drawCompanyLetterhead(doc, company, {
    title: typeLabel,
    periodLabel: `${statementData.fromDate} to ${statementData.toDate}`,
    partyName: party.name,
    partyCode: party.code,
    partyAddress: party.address,
    partyTaxId: party.taxId,
    partyPhone: party.phone,
    badgeLabel: 'Account Statement',
    badgeColor: [14, 46, 145],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tableBody: any[] = [
    // Opening Balance Row
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
    // Total Row
    [
      { content: '', colSpan: 3, styles: { fillColor: [238, 242, 255] } },
      { content: 'PERIOD TOTALS', styles: { fontStyle: 'bold', fillColor: [238, 242, 255], halign: 'right' } },
      { content: fmt(statementData.totalDebit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
      { content: fmt(statementData.totalCredit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
      { content: '', styles: { fillColor: [238, 242, 255] } },
    ],
    // Closing Balance Row
    [
      { content: statementData.toDate, styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: 'CLOSING', styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: 'NET CLOSING BALANCE', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [224, 231, 255] } },
      { content: '', colSpan: 2, styles: { fillColor: [224, 231, 255] } },
      {
        content: `${currency} ${fmt(Math.abs(statementData.closingBalance))} ${statementData.closingBalance >= 0 ? 'Dr' : 'Cr'}`,
        styles: { fontStyle: 'bold', halign: 'right', fillColor: [224, 231, 255], textColor: [14, 46, 145] },
      },
    ],
  ];

  autoTable(doc, {
    startY: startY + 2,
    head: [
      ['Date', 'Voucher #', 'Type', 'Description / Narration', `Debit (${currency})`, `Credit (${currency})`, `Balance (${currency})`],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145],
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
    didParseCell: (cellData) => {
      if (cellData.section === 'head' && (cellData.column.index === 4 || cellData.column.index === 5 || cellData.column.index === 6)) {
        cellData.cell.styles.halign = 'right';
      }
    },
  });

  drawCompanyFooter(doc, company, 'Accounts Manager');
  doc.save(`${typeLabel.replace(/\s+/g, '_')}_${party.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 5. Export Any Individual Voucher (Sales Invoice, Purchase Bill, Receipt, Payment, Contra, Journal, etc.) as Professional PDF
 */
export const exportVoucherPdf = (
  company: CompanyProfile,
  voucher: Voucher,
  party?: Customer | Supplier | null,
  vehicleName?: string,
  allItems?: Item[]
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const typeTitle = voucher.voucherType === 'sales'
    ? 'Tax Invoice'
    : voucher.voucherType === 'purchase'
    ? 'Purchase Bill'
    : voucher.voucherType === 'receipt'
    ? 'Official Payment Receipt'
    : voucher.voucherType === 'payment'
    ? 'Payment Disbursement Voucher'
    : voucher.voucherType === 'credit_note'
    ? 'Credit Note (Sales Return)'
    : voucher.voucherType === 'debit_note'
    ? 'Debit Note (Purchase Return)'
    : voucher.voucherType === 'contra'
    ? 'Contra Voucher'
    : 'Journal Entry Voucher';

  const startY = drawCompanyLetterhead(doc, company, {
    title: typeTitle,
    docNumber: voucher.voucherNumber,
    docDate: voucher.date,
    partyName: party?.name || voucher.partyName,
    partyCode: (party as any)?.code,
    partyAddress: party?.address,
    partyTaxId: party?.taxNumber,
    partyPhone: party?.phone,
    badgeLabel: voucher.voucherType.toUpperCase().replace('_', ' '),
    badgeColor: voucher.voucherType === 'sales' ? [16, 185, 129] : [14, 46, 145],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => `${currency} ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // If voucher has line items (sales, purchase, sales order, purchase order)
  if (voucher.items && voucher.items.length > 0) {
    const tableBody: any[] = voucher.items.map((line, idx) => {
      const itemDetail = allItems?.find(it => it.id === line.itemId);
      const itemName = line.itemName || itemDetail?.name || 'Item';
      const itemCode = itemDetail?.sku || itemDetail?.barcode || '-';

      return [
        idx + 1,
        itemCode,
        itemName,
        `${line.quantity} ${line.unitId || 'PCS'}`,
        fmt(line.rate),
        line.discountPercent ? `${line.discountPercent}%` : '0%',
        `${line.taxRate}%`,
        fmt(line.amount),
      ];
    });

    const subtotal = voucher.subtotal || (voucher.totalAmount - (voucher.taxTotal || 0));
    const taxTotal = voucher.taxTotal || 0;

    // Subtotal, Tax and Net Total Rows
    tableBody.push([
      { content: '', colSpan: 5, styles: { fillColor: [248, 250, 252] } },
      { content: 'Sub Total', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
      { content: fmt(subtotal), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252] } },
    ]);

    tableBody.push([
      { content: '', colSpan: 5, styles: { fillColor: [248, 250, 252] } },
      { content: 'Taxes (GST/VAT)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
      { content: fmt(taxTotal), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252] } },
    ]);

    tableBody.push([
      { content: '', colSpan: 5, styles: { fillColor: [238, 242, 255] } },
      { content: 'TOTAL INVOICE AMOUNT', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [238, 242, 255] } },
      { content: fmt(voucher.totalAmount), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255], textColor: [14, 46, 145] } },
    ]);

    autoTable(doc, {
      startY: startY + 2,
      head: [
        ['#', 'Item Code', 'Item Description', 'Qty', `Rate (${currency})`, 'Disc', 'Tax %', `Total Amount (${currency})`],
      ],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 46, 145],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2,
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
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { cellWidth: 64, fontStyle: 'bold' },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 14, halign: 'right' },
        6: { cellWidth: 14, halign: 'right' },
        7: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (cellData) => {
        if (cellData.section === 'head' && (cellData.column.index === 3 || cellData.column.index === 4 || cellData.column.index === 5 || cellData.column.index === 6 || cellData.column.index === 7)) {
          cellData.cell.styles.halign = 'right';
        }
      },
    });
  } else {
    // Financial journal voucher (Receipt, Payment, Contra, Journal)
    const tableBody: any[] = voucher.journalEntries.map((line, idx) => [
      idx + 1,
      line.ledgerName || line.ledgerId,
      line.narration || voucher.narration || '-',
      line.debit > 0 ? fmt(line.debit) : '-',
      line.credit > 0 ? fmt(line.credit) : '-',
    ]);

    const totalDebit = voucher.journalEntries.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = voucher.journalEntries.reduce((s, l) => s + (l.credit || 0), 0);

    tableBody.push([
      { content: '', colSpan: 2, styles: { fillColor: [238, 242, 255] } },
      { content: 'VOUCHER TOTAL', styles: { fontStyle: 'bold', fillColor: [238, 242, 255], halign: 'right' } },
      { content: fmt(totalDebit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
      { content: fmt(totalCredit), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
    ]);

    autoTable(doc, {
      startY: startY + 2,
      head: [
        ['#', 'Ledger Account', 'Particulars / Sub-ledger Notes', `Debit (${currency})`, `Credit (${currency})`],
      ],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 46, 145],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.2,
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 60, fontStyle: 'bold' },
        2: { cellWidth: 54 },
        3: { cellWidth: 29, halign: 'right' },
        4: { cellWidth: 29, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (cellData) => {
        if (cellData.section === 'head' && (cellData.column.index === 3 || cellData.column.index === 4)) {
          cellData.cell.styles.halign = 'right';
        }
      },
    });
  }

  // Narration and Field Van details
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VOUCHER NARRATION & REMARKS:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(voucher.narration || 'Being transactional accounting record booked into general ledger.', 14, finalY + 4);

  if (vehicleName) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Mobile Van Dispatch Location: ${vehicleName}`, 14, finalY + 8);
  }

  drawCompanyFooter(doc, company, 'Authorised Signatory');
  doc.save(`${voucher.voucherNumber}_${typeTitle.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 6. Export Daybook as Professional PDF
 */
export const exportDaybookPdf = (
  company: CompanyProfile,
  vouchers: Voucher[],
  periodLabel: string
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = drawCompanyLetterhead(doc, company, {
    title: 'Daybook Register',
    periodLabel,
    badgeLabel: 'Audit Journal',
    badgeColor: [14, 46, 145],
  });

  const currency = getPdfCurrencySymbol(company.currencySymbol, company.currency);
  const fmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tableBody: any[] = vouchers.map((v, idx) => {
    const debitTotal = v.journalEntries.reduce((s, j) => s + (j.debit || 0), 0);
    const creditTotal = v.journalEntries.reduce((s, j) => s + (j.credit || 0), 0);
    return [
      idx + 1,
      v.date,
      v.voucherNumber,
      v.voucherType.toUpperCase().replace('_', ' '),
      v.partyName || (v.journalEntries[0]?.ledgerName || '-'),
      v.narration || '-',
      debitTotal > 0 ? fmt(debitTotal) : '-',
      creditTotal > 0 ? fmt(creditTotal) : '-',
    ];
  });

  const grandDebit = vouchers.reduce((sum, v) => sum + v.journalEntries.reduce((s, j) => s + (j.debit || 0), 0), 0);
  const grandCredit = vouchers.reduce((sum, v) => sum + v.journalEntries.reduce((s, j) => s + (j.credit || 0), 0), 0);

  tableBody.push([
    { content: '', colSpan: 5, styles: { fillColor: [238, 242, 255] } },
    { content: 'DAYBOOK GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [238, 242, 255], halign: 'right' } },
    { content: `${currency} ${fmt(grandDebit)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
    { content: `${currency} ${fmt(grandCredit)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
  ]);

  autoTable(doc, {
    startY: startY + 2,
    head: [
      ['#', 'Date', 'Voucher #', 'Type', 'Party / Account', 'Narration', `Debit (${currency})`, `Credit (${currency})`],
    ],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 46, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 17 },
      2: { cellWidth: 22, fontStyle: 'bold' },
      3: { cellWidth: 20 },
      4: { cellWidth: 36, fontStyle: 'bold' },
      5: { cellWidth: 35 },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (cellData) => {
      if (cellData.section === 'head' && (cellData.column.index === 6 || cellData.column.index === 7)) {
        cellData.cell.styles.halign = 'right';
      }
    },
  });

  drawCompanyFooter(doc, company, 'Chief Auditor');
  doc.save(`Daybook_Register_${company.name.replace(/\s+/g, '_')}.pdf`);
};
