import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Transaction,
  AccountBalance,
  UdhaarEntry,
  ProjectEntry,
  ProjectExpenseItem,
  Language,
} from '@/types';

// Helper to format currency
const formatPKR = (num: number) => `Rs. ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

// Clean and sanitize string so it never produces mojibake in standard Latin-1 jsPDF fonts
export const cleanPdfText = (str: string | undefined | null, fallback: string = '-'): string => {
  if (!str) return fallback;
  // If string contains bilingual slash like "Salary / تنخواہ" or "Other / دیگر", take the English part
  if (str.includes('/')) {
    const parts = str.split('/');
    const firstPart = parts[0].trim();
    if (firstPart && /^[\x20-\x7E\s]+$/.test(firstPart)) {
      return firstPart;
    }
  }
  // Strip non-ASCII characters that cause font encoding corruption in jsPDF
  const sanitized = str.replace(/[^\x20-\x7E]/g, '').trim();
  return sanitized || fallback;
};

// Translate internal account ID (e.g. ACC-1793964828585-MEEZAN) to human friendly name
export const getAccountDisplayName = (
  accountId: string | undefined | null,
  accounts: AccountBalance[] = []
): string => {
  if (!accountId) return 'Cash / Wallet';
  const found = accounts.find((a) => a.id.toLowerCase() === accountId.toLowerCase());
  if (found && found.name) {
    return cleanPdfText(found.name, 'Bank Account');
  }

  const lower = accountId.toLowerCase();
  if (lower.includes('meezan')) return 'Meezan Bank';
  if (lower.includes('hbl')) return 'HBL';
  if (lower.includes('ubl')) return 'UBL';
  if (lower.includes('alfalah')) return 'Bank Alfalah';
  if (lower.includes('mcb')) return 'MCB Bank';
  if (lower.includes('allied') || lower.includes('abl')) return 'Allied Bank';
  if (lower.includes('jazzcash') || lower.includes('jazz')) return 'JazzCash';
  if (lower.includes('easypaisa') || lower.includes('easy')) return 'Easypaisa';
  if (lower.includes('sadapay') || lower.includes('sada')) return 'SadaPay';
  if (lower.includes('nayapay') || lower.includes('naya')) return 'NayaPay';
  if (lower.includes('cash')) return 'Cash in Hand';
  if (lower.includes('scb')) return 'Standard Chartered';
  if (lower.includes('faysal')) return 'Faysal Bank';
  if (lower.includes('askari')) return 'Askari Bank';
  if (lower.includes('bop')) return 'Bank of Punjab';
  if (lower.includes('habibmetro')) return 'HabibMetro';
  if (lower.includes('js')) return 'JS Bank';
  if (lower.includes('soneri')) return 'Soneri Bank';
  if (lower.includes('dib')) return 'Dubai Islamic';

  return 'Primary Wallet';
};

// Format date nicely e.g. 01 Nov 2026
export const formatStatementDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// 1. Executive Bank-Grade Transactions Statement PDF
export const generateTransactionsPDF = (
  transactions: Transaction[],
  accounts: AccountBalance[] = [],
  lang: Language = 'en'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Determine date range for statement
  let periodText = 'All-Time Record';
  if (transactions.length > 0) {
    const dates = transactions.map((t) => new Date(t.date).getTime()).filter((d) => !isNaN(d));
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const minStr = minDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const maxStr = maxDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      periodText = `${minStr} to ${maxStr}`;
    }
  }

  // --- 1. HEADER BANNER ---
  // Deep Navy background
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 34, 'F');

  // Emerald Accent Strip
  doc.setFillColor(4, 120, 87); // Emerald 700
  doc.rect(0, 32, 210, 2, 'F');

  // Left Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PaisaKidhar', 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229); // Emerald 100
  doc.text('SMART PERSONAL FINANCE & LEDGER MANAGEMENT', 14, 21);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.text('OFFICIAL STATEMENT OF ACCOUNT', 14, 28);

  // Right Metadata
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240); // Slate 200
  doc.text(`Statement Period: ${periodText}`, 196, 14, { align: 'right' });
  doc.text(`Generated: ${todayFormatted} ${timeFormatted}`, 196, 19, { align: 'right' });
  doc.text('Currency: PKR (Pakistani Rupee)', 196, 24, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('STATUS: VERIFIED & RECONCILED', 196, 29, { align: 'right' });

  // --- 2. SUMMARY OVERVIEW SECTION (2-Column Bank Card Box) ---
  let currentY = 40;

  // Box Dimensions
  const boxWidth = 89;
  const boxHeight = 28;

  // Left Box: Account Particulars
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('ACCOUNT PARTICULARS', 18, currentY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Account Title:', 18, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Primary Personal Ledger', 45, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Statement Scope:', 18, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('All Wallets, Banks & Cash', 45, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Active Accounts:', 18, currentY + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${accounts.length > 0 ? accounts.length : 1} Accounts Linked`, 45, currentY + 24);

  // Right Box: Financial Activity Summary
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(107, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(107, currentY, boxWidth, boxHeight, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FINANCIAL STATEMENT SUMMARY', 111, currentY + 6);

  // Total Inflow
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Deposits (+):', 111, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // Emerald Green
  doc.text(formatPKR(totalIncome), 192, currentY + 12, { align: 'right' });

  // Total Outflow
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Withdrawals (-):', 111, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38); // Red
  doc.text(formatPKR(totalExpense), 192, currentY + 18, { align: 'right' });

  // Net Balance
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Net Ledger Balance:', 111, currentY + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(netSavings >= 0 ? 4 : 220, netSavings >= 0 ? 120 : 38, netSavings >= 0 ? 87 : 38);
  doc.text(formatPKR(netSavings), 192, currentY + 24, { align: 'right' });

  currentY += boxHeight + 8;

  // --- 3. ACCOUNTS BREAKDOWN TABLE (IF PRESENT) ---
  if (accounts.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Wallets & Accounts Balance Overview', 14, currentY);

    const accountRows = accounts.map((acc, idx) => [
      String(idx + 1),
      cleanPdfText(acc.name, 'Bank Account'),
      cleanPdfText(acc.bankKey?.toUpperCase(), 'BANK'),
      acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : 'Active',
      formatPKR(acc.balance),
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['#', 'Account / Wallet Title', 'Institution', 'Account Number', 'Current Balance']],
      body: accountRows,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 55, fontStyle: 'bold' },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 48, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 4. MAIN TRANSACTION LEDGER (THE AUTHENTIC BANK STATEMENT TABLE) ---
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Statement of Transactions & Chronological Ledger', 14, currentY);

  // Sort transactions chronologically ascending for proper running balance calculation
  const sortedTx = [...transactions].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  let runningBalance = 0;
  const tableRows = sortedTx.map((t, idx) => {
    if (t.type === 'income') {
      runningBalance += t.amount;
    } else {
      runningBalance -= t.amount;
    }

    const narration = cleanPdfText(t.note || t.category, 'Transaction');
    const categoryName = cleanPdfText(t.category, 'General');
    const accountName = getAccountDisplayName(t.account, accounts);
    const debitText = t.type === 'expense' ? formatPKR(t.amount) : '-';
    const creditText = t.type === 'income' ? formatPKR(t.amount) : '-';
    const balanceText = formatPKR(runningBalance);

    return [
      String(idx + 1),
      formatStatementDate(t.date),
      narration,
      accountName,
      categoryName,
      debitText,
      creditText,
      balanceText,
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [
      [
        'Sr.',
        'Date',
        'Particulars / Narration',
        'Account / Channel',
        'Category',
        'Withdrawal (Debit -)',
        'Deposit (Credit +)',
        'Balance (PKR)',
      ],
    ],
    body: tableRows,
    foot: [
      [
        '',
        'TOTALS',
        `Total Count: ${transactions.length} Records`,
        '',
        '',
        formatPKR(totalExpense),
        formatPKR(totalIncome),
        formatPKR(netSavings),
      ],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [6, 78, 59], // Dark Emerald Bank Green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }, // Debit in Red
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }, // Credit in Green
      7: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }, // Balance in Navy
    },
    didParseCell: (data) => {
      // Color debit and credit values accordingly
      if (data.section === 'body') {
        if (data.column.index === 5 && data.cell.raw !== '-') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.column.index === 6 && data.cell.raw !== '-') {
          data.cell.styles.textColor = [4, 120, 87];
        }
      }
      if (data.section === 'foot') {
        if (data.column.index === 5) {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.column.index === 6) {
          data.cell.styles.textColor = [4, 120, 87];
        } else if (data.column.index === 7) {
          data.cell.styles.textColor = [15, 23, 42];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // --- 5. FORMAL BANK FOOTER ON ALL PAGES ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 285, 196, 285);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      'This document is an authenticated computer-generated ledger statement issued by PaisaKidhar. No physical signature is required.',
      14,
      290
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
  }

  doc.save(`PaisaKidhar_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
};

// 2. Generate Single Contact Udhaar Statement (for WhatsApp sharing)
export const generateSingleUdhaarPDF = (entry: UdhaarEntry, lang: Language = 'en') => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const remaining = entry.totalAmount - entry.paidAmount;
  const isSettled = remaining <= 0;
  const isGiven = entry.direction === 'given';

  const cleanContactName = cleanPdfText(entry.contactName, 'Customer');
  const cleanPhone = cleanPdfText(entry.contactPhone, '-');
  const cleanNote = cleanPdfText(entry.note, 'None');

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 34, 'F');

  doc.setFillColor(isGiven ? 217 : 79, isGiven ? 119 : 70, isGiven ? 6 : 229); // Amber or Indigo accent
  doc.rect(0, 32, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PaisaKidhar', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Official Udhaar Statement: ${cleanContactName}`, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text(`Generated: ${today}`, 196, 20, { align: 'right' });

  // Main Info Card
  let currentY = 42;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 30, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PARTY / CONTACT DETAILS', 20, currentY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cleanContactName, 20, currentY + 16);
  if (cleanPhone !== '-') {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Phone / Mobile: ${cleanPhone}`, 20, currentY + 23);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('RECORD TYPE / SETTLEMENT STATUS', 115, currentY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isGiven ? 180 : 67, isGiven ? 83 : 56, isGiven ? 9 : 202);
  doc.text(isGiven ? 'Maine Diya (Lena Hai / Receivable)' : 'Maine Liya (Dena Hai / Payable)', 115, currentY + 16);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(isSettled ? 4 : 180, isSettled ? 120 : 83, isSettled ? 87 : 9);
  doc.text(isSettled ? 'Status: FULLY SETTLED' : 'Status: OUTSTANDING BALANCE', 115, currentY + 23);

  // Financial Figures
  currentY += 36;
  const figWidth = 58;

  // Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, figWidth, 22, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT', 18, currentY + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPKR(entry.totalAmount), 18, currentY + 16);

  // Paid
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14 + figWidth + 4, currentY, figWidth, 22, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text('TOTAL PAID SO FAR', 18 + figWidth + 4, currentY + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(entry.paidAmount), 18 + figWidth + 4, currentY + 16);

  // Remaining
  doc.setFillColor(isGiven ? 254 : 238, isGiven ? 243 : 242, isGiven ? 199 : 255);
  doc.roundedRect(14 + (figWidth + 4) * 2, currentY, figWidth, 22, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(isGiven ? 180 : 67, isGiven ? 83 : 56, isGiven ? 9 : 202);
  doc.text('REMAINING BALANCE', 18 + (figWidth + 4) * 2, currentY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(remaining), 18 + (figWidth + 4) * 2, currentY + 16);

  currentY += 30;

  // Metadata Table
  const metaRows = [
    ['Khata Created Date', formatStatementDate(entry.createdDate)],
    ['Due Date', entry.dueDate ? formatStatementDate(entry.dueDate) : 'No due date specified'],
    ['Reference / Note', cleanNote],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Record Field', 'Particulars']],
    body: metaRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Payment History
  if (entry.payments && entry.payments.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Payment & Installments History', 14, currentY);

    const payRows = entry.payments.map((p, idx) => [
      `#${idx + 1}`,
      formatStatementDate(p.date),
      formatPKR(p.amount),
      cleanPdfText(p.note, 'Payment Cleared'),
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Sr.', 'Payment Date', 'Amount Paid', 'Note']],
      body: payRows,
      theme: 'striped',
      headStyles: {
        fillColor: [4, 120, 87],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: { fontSize: 8, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Formal Polite WhatsApp Note
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Assalam-o-Alaikum! This document is an auto-generated statement of the outstanding ledger balance.',
    18,
    currentY + 7
  );
  doc.text(
    `Kindly review this record. Outstanding balance as of today: ${formatPKR(remaining)}. JazakAllah!`,
    18,
    currentY + 14
  );

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PaisaKidhar • Official Personal Ledger Statement • Powered by PaisaKidhar', 105, 288, { align: 'center' });

  doc.save(`PaisaKidhar_Udhaar_${cleanContactName.replace(/\s+/g, '_')}.pdf`);
};

// 3. Generate Full Udhaar Master Register (All Contacts)
export const generateAllUdhaarPDF = (udhaarList: UdhaarEntry[], lang: Language = 'en') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const totalLena = udhaarList
    .filter((u) => u.direction === 'given')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  const totalDena = udhaarList
    .filter((u) => u.direction === 'taken')
    .reduce((acc, u) => acc + (u.totalAmount - u.paidAmount), 0);

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 34, 'F');

  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(0, 32, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PaisaKidhar', 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  doc.text('COMPLETE UDHAAR & KHATA MASTER REGISTER', 14, 21);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(251, 191, 36);
  doc.text('RECEIVABLES & PAYABLES SUMMARY', 14, 28);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Generated: ${today}`, 196, 18, { align: 'right' });
  doc.text(`Total Parties: ${udhaarList.length}`, 196, 25, { align: 'right' });

  // Summary Cards
  let currentY = 40;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(14, currentY, 88, 22, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('TOTAL RECEIVABLE (LENA HAI)', 18, currentY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(totalLena), 18, currentY + 16);

  doc.setFillColor(238, 242, 255);
  doc.roundedRect(108, currentY, 88, 22, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(67, 56, 202);
  doc.text('TOTAL PAYABLE (DENA HAI)', 112, currentY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(totalDena), 112, currentY + 16);

  currentY += 28;

  const tableRows = udhaarList.map((u, idx) => {
    const rem = u.totalAmount - u.paidAmount;
    return [
      String(idx + 1),
      cleanPdfText(u.contactName, 'Party'),
      cleanPdfText(u.contactPhone, '-'),
      u.direction === 'given' ? 'Receivable (Lena)' : 'Payable (Dena)',
      formatPKR(u.totalAmount),
      formatPKR(u.paidAmount),
      formatPKR(rem),
      u.dueDate ? formatStatementDate(u.dueDate) : '-',
      rem <= 0 ? 'Settled' : 'Pending',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Party Name', 'Phone', 'Type', 'Total Amount', 'Paid', 'Remaining', 'Due Date', 'Status']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 26 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 18 },
      8: { cellWidth: 14, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`PaisaKidhar_All_Udhaar_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
};

// 4. Executive Dedicated Project / Event Statement PDF
export const generateProjectPDF = (
  project: ProjectEntry,
  expenses: ProjectExpenseItem[],
  accounts: AccountBalance[] = [],
  lang: Language = 'en'
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Brand Header Banner (Emerald 700)
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 26, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PAISAKIDHAR', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SPECIAL PROJECT EXPENDITURE & SUB-LEDGER STATEMENT', 14, 20);

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated: ${generatedDate}`, pageWidth - 14, 14, { align: 'right' });
  doc.text(`Status: ${project.status.toUpperCase()}`, pageWidth - 14, 20, { align: 'right' });

  let currentY = 36;

  // Project Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(cleanPdfText(project.title, 'Project Ledger'), 20, currentY + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const typeText =
    project.type === 'construction'
      ? 'Construction & Building / Makaan Tameer'
      : project.type === 'wedding'
      ? 'Wedding / Shadi Event'
      : project.type === 'renovation'
      ? 'Home Renovation & Remodeling'
      : project.type === 'medical'
      ? 'Medical & Health Treatment'
      : project.type === 'business'
      ? 'Business & Startup Venture'
      : 'Special Project';
  doc.text(`Type: ${typeText}`, 20, currentY + 17);
  doc.text(`Started: ${formatStatementDate(project.startDate)}`, 20, currentY + 23);

  // Big Total Spent Banner in card
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(pageWidth - 84, currentY + 4, 68, 22, 2.5, 2.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('TOTAL EXPENDITURE', pageWidth - 80, currentY + 11);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(totalSpent), pageWidth - 80, currentY + 20);

  currentY += 36;

  // Group by Subcategories for Summary Table
  const subCategoryMap: Record<string, { count: number; total: number }> = {};
  expenses.forEach((e) => {
    const cleanSub = cleanPdfText(e.subCategory, 'Other');
    if (!subCategoryMap[cleanSub]) {
      subCategoryMap[cleanSub] = { count: 0, total: 0 };
    }
    subCategoryMap[cleanSub].count += 1;
    subCategoryMap[cleanSub].total += e.amount;
  });

  const summaryRows = Object.entries(subCategoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([subCat, data]) => {
      const pct = totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) + '%' : '0%';
      return [subCat, String(data.count), formatPKR(data.total), pct];
    });

  if (summaryRows.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Sub-Category / Item Breakdown', 14, currentY + 4);
    currentY += 7;

    autoTable(doc, {
      startY: currentY,
      head: [['Category / Mad', 'Entries', 'Total Spent', '% of Project']],
      body: summaryRows,
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: { fontSize: 7.5, cellPadding: 2.2 },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 26, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    const lastAutoTable = (doc as any).lastAutoTable;
    currentY = (lastAutoTable ? lastAutoTable.finalY : currentY) + 10;
  }

  // Detailed Itemized Payments Ledger Table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Payments & Expenses Ledger', 14, currentY + 4);
  currentY += 7;

  const itemRows = expenses.map((e, idx) => {
    return [
      String(idx + 1),
      formatStatementDate(e.date),
      cleanPdfText(e.subCategory, 'Expense'),
      cleanPdfText(e.vendorOrPerson, '-'),
      getAccountDisplayName(e.accountId, accounts),
      cleanPdfText(e.note, '-'),
      formatPKR(e.amount),
    ];
  });

  if (itemRows.length === 0) {
    itemRows.push(['-', '-', 'No expenses recorded yet', '-', '-', '-', 'Rs. 0']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Date', 'Mad / Category', 'Paid To / Vendor', 'Paid Via', 'Note / Bill #', 'Amount']],
    body: itemRows,
    theme: 'grid',
    headStyles: {
      fillColor: [4, 120, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 28 },
      5: { cellWidth: 26 },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `PaisaKidhar - Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    },
  });

  const safeTitle = project.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`PaisaKidhar_${safeTitle}_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
};
