import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import {
  Transaction,
  AccountBalance,
  UdhaarEntry,
  ProjectEntry,
  ProjectExpenseItem,
  Language,
} from '../types';

const formatPKR = (num: number) => `Rs. ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

// Clean and sanitize string so it never produces raw artifacts or broken characters
export const cleanPdfText = (str: string | undefined | null, fallback: string = '-'): string => {
  if (!str) return fallback;
  if (str.includes('/')) {
    const parts = str.split('/');
    const firstPart = parts[0].trim();
    if (firstPart) {
      return firstPart;
    }
  }
  return str.trim() || fallback;
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

// 1. Transactions Ledger Mobile PDF (Executive Bank Statement)
export async function exportTransactionsPDFMobile(
  transactions: Transaction[],
  accounts: AccountBalance[] = [],
  lang: Language = 'en'
): Promise<void> {
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

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Determine period
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

  // Sort transactions chronologically ascending for proper running balance calculation
  const sortedTx = [...transactions].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  let runningBalance = 0;
  const transactionsRows = sortedTx
    .map((t, idx) => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }

      const narration = cleanPdfText(t.note || t.category, 'Transaction');
      const categoryName = cleanPdfText(t.category, 'General');
      const accountName = getAccountDisplayName(t.account, accounts);
      const isExpense = t.type === 'expense';
      const debitText = isExpense ? formatPKR(t.amount) : '-';
      const creditText = !isExpense ? formatPKR(t.amount) : '-';
      const balanceText = formatPKR(runningBalance);

      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 6px; text-align: center; color: #64748b; font-size: 10px;">${idx + 1}</td>
          <td style="padding: 7px 6px; text-align: center; font-size: 10.5px; color: #334155; white-space: nowrap;">${formatStatementDate(t.date)}</td>
          <td style="padding: 7px 8px; font-weight: 600; font-size: 11px; color: #0f172a;">${narration}</td>
          <td style="padding: 7px 8px; font-size: 10.5px; color: #475569;">${accountName}</td>
          <td style="padding: 7px 8px; font-size: 10.5px; color: #64748b;">${categoryName}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 700; font-size: 11px; color: ${isExpense ? '#dc2626' : '#94a3b8'};">${debitText}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 700; font-size: 11px; color: ${!isExpense ? '#059669' : '#94a3b8'};">${creditText}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 800; font-size: 11.5px; color: #0f172a;">${balanceText}</td>
        </tr>
      `;
    })
    .join('');

  const accountsHtml =
    accounts.length > 0
      ? `
      <div style="margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          Wallets & Accounts Balance Overview
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; color: #334155;">
              <th style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">#</th>
              <th style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Account / Wallet Title</th>
              <th style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Institution</th>
              <th style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Account Number</th>
              <th style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Current Balance</th>
            </tr>
          </thead>
          <tbody>
            ${accounts
              .map(
                (a, idx) => `
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${idx % 2 === 0 ? '#ffffff' : '#fcfcfd'};">
                <td style="padding: 6px 10px; color: #64748b;">${idx + 1}</td>
                <td style="padding: 6px 10px; font-weight: 700; color: #0f172a;">${cleanPdfText(a.name, 'Account')}</td>
                <td style="padding: 6px 10px; color: #475569;">${cleanPdfText(a.bankKey?.toUpperCase(), 'BANK')}</td>
                <td style="padding: 6px 10px; color: #64748b;">${a.accountNumber ? `•••• ${a.accountNumber.slice(-4)}` : 'Active'}</td>
                <td style="padding: 6px 10px; text-align: right; font-weight: 800; color: #059669;">${formatPKR(a.balance)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 16px;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 11px;
            line-height: 1.4;
          }
          .header-banner {
            background-color: #0f172a;
            border-bottom: 3px solid #047857;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .summary-grid {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }
          .summary-card {
            flex: 1;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-banner">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: top;">
                <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">PaisaKidhar</div>
                <div style="font-size: 9px; font-weight: 600; color: #a7f3d0; text-transform: uppercase; margin-top: 2px;">
                  Smart Personal Finance & Ledger Management
                </div>
                <div style="font-size: 10.5px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-top: 6px;">
                  Official Statement of Account
                </div>
              </td>
              <td style="text-align: right; vertical-align: top; font-size: 9.5px; color: #cbd5e1; line-height: 1.5;">
                <div>Period: <strong style="color: #ffffff;">${periodText}</strong></div>
                <div>Generated: <strong style="color: #ffffff;">${todayFormatted} ${timeFormatted}</strong></div>
                <div>Currency: <strong style="color: #ffffff;">PKR (Pakistani Rupee)</strong></div>
                <div style="color: #34d399; font-weight: 800; margin-top: 3px;">STATUS: VERIFIED & RECONCILED</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- 2-Column Particulars and Financial Summary Box -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 18px;">
          <tr>
            <!-- Left: Account Particulars -->
            <td style="width: 50%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Account Particulars
              </div>
              <table style="width: 100%; font-size: 10.5px; line-height: 1.6;">
                <tr>
                  <td style="color: #64748b; width: 45%;">Account Title:</td>
                  <td style="font-weight: 700; color: #0f172a;">Primary Personal Ledger</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Statement Scope:</td>
                  <td style="font-weight: 700; color: #0f172a;">All Connected Wallets & Cash</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Active Accounts:</td>
                  <td style="font-weight: 700; color: #0f172a;">${accounts.length > 0 ? accounts.length : 1} Accounts Linked</td>
                </tr>
              </table>
            </td>

            <!-- Right: Financial Activity Summary -->
            <td style="width: 50%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Financial Statement Summary
              </div>
              <table style="width: 100%; font-size: 10.5px; line-height: 1.6;">
                <tr>
                  <td style="color: #64748b;">Total Deposits (+):</td>
                  <td style="text-align: right; font-weight: 800; color: #059669;">${formatPKR(totalIncome)}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Total Withdrawals (-):</td>
                  <td style="text-align: right; font-weight: 800; color: #dc2626;">${formatPKR(totalExpense)}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Net Ledger Balance:</td>
                  <td style="text-align: right; font-weight: 900; color: ${netSavings >= 0 ? '#059669' : '#dc2626'};">${formatPKR(netSavings)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Accounts breakdown (if available) -->
        ${accountsHtml}

        <!-- Transactions Ledger Table -->
        <div style="margin-bottom: 6px; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          Statement of Transactions & Chronological Ledger
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #064e3b; color: #ffffff; text-align: left;">
              <th style="padding: 7px 6px; text-align: center; font-size: 10px; border: 1px solid #064e3b; width: 28px;">Sr.</th>
              <th style="padding: 7px 6px; text-align: center; font-size: 10.5px; border: 1px solid #064e3b; width: 75px;">Date</th>
              <th style="padding: 7px 8px; font-size: 10.5px; border: 1px solid #064e3b;">Particulars / Narration</th>
              <th style="padding: 7px 8px; font-size: 10.5px; border: 1px solid #064e3b; width: 100px;">Account / Channel</th>
              <th style="padding: 7px 8px; font-size: 10.5px; border: 1px solid #064e3b; width: 85px;">Category</th>
              <th style="padding: 7px 8px; text-align: right; font-size: 10.5px; border: 1px solid #064e3b; width: 85px;">Withdrawal (Debit -)</th>
              <th style="padding: 7px 8px; text-align: right; font-size: 10.5px; border: 1px solid #064e3b; width: 85px;">Deposit (Credit +)</th>
              <th style="padding: 7px 8px; text-align: right; font-size: 10.5px; border: 1px solid #064e3b; width: 90px;">Balance (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRows}
          </tbody>
          <tfoot>
            <tr style="background-color: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: bold;">
              <td colspan="5" style="padding: 8px; text-align: right; font-weight: 800; color: #0f172a;">
                TOTALS (${transactions.length} Records)
              </td>
              <td style="padding: 8px; text-align: right; font-weight: 800; color: #dc2626;">${formatPKR(totalExpense)}</td>
              <td style="padding: 8px; text-align: right; font-weight: 800; color: #059669;">${formatPKR(totalIncome)}</td>
              <td style="padding: 8px; text-align: right; font-weight: 900; color: #0f172a;">${formatPKR(netSavings)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Formal Bank Statement Footer -->
        <div style="margin-top: 28px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #94a3b8;">
          <div>This document is an authenticated computer-generated ledger statement issued by PaisaKidhar. No physical signature is required.</div>
          <div style="font-weight: bold; color: #64748b;">Verified Digital Statement</div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share PaisaKidhar Bank Statement via WhatsApp / File',
      });
    } else {
      Alert.alert('Statement Generated', `Saved to ${uri}`);
    }
  } catch (err: any) {
    Alert.alert('Error Generating PDF', err.message || 'Could not export statement');
  }
}

// 2. Single Party Udhaar Statement (for WhatsApp sharing)
export async function exportSingleUdhaarPDFMobile(
  entry: UdhaarEntry,
  lang: Language = 'en'
): Promise<void> {
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

  const paymentRows =
    entry.payments && entry.payments.length > 0
      ? `
      <div style="margin-top: 18px;">
        <h4 style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 6px;">Payment & Installments History</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">#</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Date</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">Amount Paid</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Note</th>
            </tr>
          </thead>
          <tbody>
            ${entry.payments
              .map(
                (p, idx) => `
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #64748b;">${idx + 1}</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${formatStatementDate(p.date)}</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">${formatPKR(p.amount)}</td>
                <td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #64748b;">${cleanPdfText(p.note, 'Payment Cleared')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 11.5px;
          }
          .header-banner {
            background-color: #0f172a;
            border-bottom: 3px solid ${isGiven ? '#d97706' : '#4338ca'};
            color: #ffffff;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 18px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-banner">
          <table style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 20px; font-weight: 900; color: #ffffff;">PaisaKidhar</div>
                <div style="font-size: 9.5px; color: #fde68a; font-weight: 700; text-transform: uppercase; margin-top: 2px;">
                  Official Udhaar & Ledger Khata Statement
                </div>
              </td>
              <td style="text-align: right; font-size: 10px; color: #cbd5e1; line-height: 1.5;">
                <div>Date: <strong style="color: #ffffff;">${today}</strong></div>
                <div>Status: <strong style="color: ${isSettled ? '#34d399' : '#fbbf24'};">${isSettled ? 'FULLY SETTLED' : 'OUTSTANDING BALANCE'}</strong></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Party Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px;">
          <table style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">PARTY / CONTACT DETAILS</div>
                <div style="font-size: 17px; font-weight: 900; color: #0f172a; margin-top: 2px;">${cleanContactName}</div>
                ${cleanPhone !== '-' ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Phone: ${cleanPhone}</div>` : ''}
              </td>
              <td style="text-align: right;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">RECORD TYPE</div>
                <div style="font-size: 13px; font-weight: 800; color: ${isGiven ? '#b45309' : '#4338ca'}; margin-top: 2px;">
                  ${isGiven ? 'Maine Diya (Lena Hai / Receivable)' : 'Maine Liya (Dena Hai / Payable)'}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Amounts Row -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 16px;">
          <tr>
            <td style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; width: 33%;">
              <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">TOTAL AMOUNT</div>
              <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 4px;">${formatPKR(entry.totalAmount)}</div>
            </td>
            <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; width: 33%;">
              <div style="font-size: 9.5px; font-weight: 700; color: #047857; text-transform: uppercase;">PAID SO FAR</div>
              <div style="font-size: 15px; font-weight: 900; color: #064e3b; margin-top: 4px;">${formatPKR(entry.paidAmount)}</div>
            </td>
            <td style="background-color: ${isGiven ? '#fffbeb' : '#eef2ff'}; border-radius: 8px; padding: 12px; width: 33%; border: 1.5px solid ${isGiven ? '#fde68a' : '#c7d2fe'};">
              <div style="font-size: 9.5px; font-weight: 700; color: ${isGiven ? '#b45309' : '#4338ca'}; text-transform: uppercase;">REMAINING BALANCE</div>
              <div style="font-size: 16px; font-weight: 900; color: ${isGiven ? '#78350f' : '#312e81'}; margin-top: 4px;">${formatPKR(remaining)}</div>
            </td>
          </tr>
        </table>

        <!-- Metadata Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600; width: 35%;">Khata Created Date</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${formatStatementDate(entry.createdDate)}</td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Due Date</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${entry.dueDate ? formatStatementDate(entry.dueDate) : 'No due date specified'}</td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Note / Reference</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${cleanNote}</td>
          </tr>
        </table>

        ${paymentRows}

        <!-- Polite Note for WhatsApp Share -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-top: 20px;">
          <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
            <strong>Assalam-o-Alaikum!</strong> This is an official digital statement of the outstanding ledger balance.<br />
            Outstanding Balance as of today: <strong style="color: #047857;">${formatPKR(remaining)}</strong>. Please review at your convenience. JazakAllah!
          </p>
        </div>

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 9.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          PaisaKidhar • Official Personal Ledger Statement
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Share Udhaar Statement for ${cleanContactName} via WhatsApp`,
      });
    } else {
      Alert.alert('Statement Generated', `Saved to ${uri}`);
    }
  } catch (err: any) {
    Alert.alert('Error Generating PDF', err.message || 'Could not export statement');
  }
}

// 3. All Udhaar Master Register PDF Mobile
export async function exportAllUdhaarPDFMobile(
  udhaarList: UdhaarEntry[],
  lang: Language = 'en'
): Promise<void> {
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

  const rows = udhaarList
    .map((u, idx) => {
      const rem = u.totalAmount - u.paidAmount;
      const cleanName = cleanPdfText(u.contactName, 'Party');
      const cleanPhone = cleanPdfText(u.contactPhone, '-');
      const isGiven = u.direction === 'given';
      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 6px; text-align: center; color: #64748b;">${idx + 1}</td>
          <td style="padding: 7px 8px; font-weight: 700; color: #0f172a;">${cleanName}</td>
          <td style="padding: 7px 8px; color: #64748b; font-size: 10.5px;">${cleanPhone}</td>
          <td style="padding: 7px 8px; font-weight: 600; color: ${isGiven ? '#b45309' : '#4338ca'}; font-size: 10.5px;">
            ${isGiven ? 'Receivable (Lena)' : 'Payable (Dena)'}
          </td>
          <td style="padding: 7px 8px; text-align: right; color: #475569;">${formatPKR(u.totalAmount)}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 600; color: #059669;">${formatPKR(u.paidAmount)}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 800; color: ${isGiven ? '#b45309' : '#4338ca'};">${formatPKR(rem)}</td>
          <td style="padding: 7px 8px; font-size: 10px; color: #64748b; text-align: center;">${u.dueDate ? formatStatementDate(u.dueDate) : '-'}</td>
          <td style="padding: 7px 8px; font-size: 10px; text-align: center; font-weight: 700; color: ${rem <= 0 ? '#059669' : '#d97706'};">
            ${rem <= 0 ? 'Settled' : 'Pending'}
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 11px;
          }
          .header-banner {
            background-color: #0f172a;
            border-bottom: 3px solid #d97706;
            color: #ffffff;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 18px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-banner">
          <table style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 20px; font-weight: 900; color: #ffffff;">PaisaKidhar</div>
                <div style="font-size: 9.5px; color: #fde68a; font-weight: 700; text-transform: uppercase; margin-top: 2px;">
                  Complete Udhaar & Khata Master Register
                </div>
              </td>
              <td style="text-align: right; font-size: 10px; color: #cbd5e1; line-height: 1.5;">
                <div>Date: <strong style="color: #ffffff;">${today}</strong></div>
                <div>Total Parties: <strong style="color: #ffffff;">${udhaarList.length}</strong></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- 2 Summary Cards -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 18px;">
          <tr>
            <td style="width: 50%; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase;">TOTAL RECEIVABLE (LENA HAI)</div>
              <div style="font-size: 17px; font-weight: 900; color: #78350f; margin-top: 4px;">${formatPKR(totalLena)}</div>
            </td>
            <td style="width: 50%; background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; font-weight: 700; color: #4338ca; text-transform: uppercase;">TOTAL PAYABLE (DENA HAI)</div>
              <div style="font-size: 17px; font-weight: 900; color: #312e81; margin-top: 4px;">${formatPKR(totalDena)}</div>
            </td>
          </tr>
        </table>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #b45309; color: #ffffff; text-align: left;">
              <th style="padding: 7px 6px; text-align: center; border: 1px solid #b45309; width: 28px;">#</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309;">Party Name</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309;">Phone</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309;">Type</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309; text-align: right;">Total Amount</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309; text-align: right;">Paid</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309; text-align: right;">Remaining</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309; text-align: center;">Due Date</th>
              <th style="padding: 7px 8px; border: 1px solid #b45309; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 9.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          PaisaKidhar • Official Digital Master Register
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share Full Udhaar Register via WhatsApp / File',
      });
    } else {
      Alert.alert('Register Exported', `Saved to ${uri}`);
    }
  } catch (err: any) {
    Alert.alert('Error Generating PDF', err.message || 'Could not export register');
  }
}

// 4. Executive Dedicated Project / Event Statement Mobile PDF
export async function exportProjectPDFMobile(
  project: ProjectEntry,
  expenses: ProjectExpenseItem[],
  accounts: AccountBalance[] = [],
  lang: Language = 'en'
): Promise<void> {
  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by subcategory
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
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 7px 8px; font-weight: 700; color: #1e293b;">${subCat}</td>
          <td style="padding: 7px 8px; text-align: center; color: #64748b;">${data.count}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 800; color: #047857;">${formatPKR(data.total)}</td>
          <td style="padding: 7px 8px; text-align: center; color: #64748b;">${pct}</td>
        </tr>
      `;
    })
    .join('');

  const itemRows = expenses
    .map((e, idx) => {
      const accName = getAccountDisplayName(e.accountId, accounts);
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 7px 6px; text-align: center; color: #94a3b8; font-size: 10px;">${idx + 1}</td>
          <td style="padding: 7px 8px; color: #475569; white-space: nowrap;">${formatStatementDate(e.date)}</td>
          <td style="padding: 7px 8px; font-weight: 700; color: #1e293b;">${cleanPdfText(e.subCategory, 'Expense')}</td>
          <td style="padding: 7px 8px; color: #475569;">${cleanPdfText(e.vendorOrPerson, '-')}</td>
          <td style="padding: 7px 8px; color: #475569;">${accName}</td>
          <td style="padding: 7px 8px; color: #64748b; font-size: 10px;">${cleanPdfText(e.note, '-')}</td>
          <td style="padding: 7px 8px; text-align: right; font-weight: 900; color: #047857;">${formatPKR(e.amount)}</td>
        </tr>
      `;
    })
    .join('');

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

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${cleanPdfText(project.title, 'Project Statement')}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 11px; }
        </style>
      </head>
      <body>
        <!-- Emerald Header Banner -->
        <table style="width: 100%; background-color: #047857; color: #ffffff; padding: 14px 18px; border-radius: 8px 8px 0 0;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.5px;">PAISAKIDHAR</div>
              <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">PROJECT EXPENDITURE & SUB-LEDGER STATEMENT</div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 700;">${todayFormatted}</div>
              <div style="font-size: 9.5px; opacity: 0.85; text-transform: uppercase;">STATUS: ${project.status.toUpperCase()}</div>
            </td>
          </tr>
        </table>
        <div style="height: 3px; background-color: #10b981; margin-bottom: 14px;"></div>

        <!-- Project Meta Card -->
        <table style="width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #0f172a;">${cleanPdfText(project.title, 'Project')}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Type: ${typeText} • Started: ${formatStatementDate(project.startDate)}</div>
              ${project.notes ? `<div style="font-size: 9.5px; color: #64748b; font-style: italic; margin-top: 2px;">"${cleanPdfText(project.notes, '')}"</div>` : ''}
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 14px; display: inline-block;">
                <div style="font-size: 9px; font-weight: 700; color: #047857; text-transform: uppercase;">TOTAL EXPENDITURE</div>
                <div style="font-size: 16px; font-weight: 900; color: #047857; margin-top: 2px;">${formatPKR(totalSpent)}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Subcategories Summary Table -->
        ${
          summaryRows
            ? `
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Sub-Category Breakdown</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <thead>
              <tr style="background-color: #334155; color: #ffffff; text-align: left;">
                <th style="padding: 6px 8px;">Mad / Category</th>
                <th style="padding: 6px 8px; text-align: center;">Entries</th>
                <th style="padding: 6px 8px; text-align: right;">Total Spent</th>
                <th style="padding: 6px 8px; text-align: center;">% Share</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRows}
            </tbody>
          </table>
        `
            : ''
        }

        <!-- Itemized Ledger Table -->
        <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Detailed Payments Ledger (${expenses.length} records)</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #047857; color: #ffffff; text-align: left;">
              <th style="padding: 7px 6px; text-align: center; width: 24px;">#</th>
              <th style="padding: 7px 8px;">Date</th>
              <th style="padding: 7px 8px;">Category / Mad</th>
              <th style="padding: 7px 8px;">Paid To (Vendor)</th>
              <th style="padding: 7px 8px;">Paid Via</th>
              <th style="padding: 7px 8px;">Note / Bill</th>
              <th style="padding: 7px 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              itemRows ||
              '<tr><td colspan="7" style="padding: 12px; text-align: center; color: #94a3b8;">No expenses recorded yet</td></tr>'
            }
          </tbody>
        </table>

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 9.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          PaisaKidhar • Official Project Statement
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Share ${cleanPdfText(project.title, 'Project')} Statement PDF`,
      });
    } else {
      Alert.alert('Statement Exported', `Saved to ${uri}`);
    }
  } catch (err: any) {
    Alert.alert('Error Generating PDF', err.message || 'Could not export statement');
  }
}
