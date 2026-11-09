import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import {
  Search,
  Share2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  FileText,
} from 'lucide-react-native';
import { Transaction, AccountBalance, Language } from '../types';
import { exportTransactionsPDFMobile } from '../lib/pdfGenerator';

interface TransactionsScreenProps {
  transactions: Transaction[];
  accounts: AccountBalance[];
  onDeleteTransaction: (id: string) => void;
  lang: Language;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || t.account === accountFilter;
    return matchesSearch && matchesType && matchesAccount;
  });

  const handleShareCSV = async () => {
    try {
      const headers = 'Date,Type,Category,Account,Amount (PKR),Note\n';
      const rows = filtered
        .map(
          (t) =>
            `"${t.date}","${t.type}","${t.category}","${t.account}",${t.amount},"${(t.note || '').replace(/"/g, '""')}"`
        )
        .join('\n');
      const csvData = headers + rows;

      await Share.share({
        title: 'PaisaKidhar Ledger Export',
        message: csvData,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const confirmDelete = (tx: Transaction) => {
    Alert.alert(
      lang === 'ur' ? 'اندراج حذف کریں' : 'Delete Transaction',
      lang === 'ur'
        ? `کیا آپ واقعی اس اندراج کو حذف کرنا چاہتے ہیں؟ (Rs. ${tx.amount})`
        : `Delete transaction: ${tx.note || tx.category} (Rs. ${tx.amount})?`,
      [
        { text: lang === 'ur' ? 'منسوخ' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ur' ? 'حذف کریں' : 'Delete',
          style: 'destructive',
          onPress: () => onDeleteTransaction(tx.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Search & Export */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'ur' ? 'تلاش کریں (کھرچہ، زمرہ)...' : 'Search note or category...'}
            placeholderTextColor="#94a3b8"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <TouchableOpacity
          style={styles.pdfBtn}
          onPress={() => exportTransactionsPDFMobile(filtered, accounts, lang)}
        >
          <FileText size={15} color="#ffffff" />
          <Text style={styles.pdfBtnText}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShareCSV}>
          <Share2 size={16} color="#047857" />
        </TouchableOpacity>
      </View>

      {/* Type Filter Pills */}
      <View style={styles.filterRow}>
        <View style={styles.typePills}>
          <TouchableOpacity
            style={[styles.typePill, typeFilter === 'all' && styles.typePillActive]}
            onPress={() => setTypeFilter('all')}
          >
            <Text
              style={[
                styles.typePillText,
                typeFilter === 'all' && styles.typePillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typePill, typeFilter === 'expense' && styles.typePillExpenseActive]}
            onPress={() => setTypeFilter('expense')}
          >
            <Text
              style={[
                styles.typePillText,
                typeFilter === 'expense' && styles.typePillExpenseTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typePill, typeFilter === 'income' && styles.typePillIncomeActive]}
            onPress={() => setTypeFilter('income')}
          >
            <Text
              style={[
                styles.typePillText,
                typeFilter === 'income' && styles.typePillIncomeTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Horizontal Chips */}
      {accounts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsRow}
          contentContainerStyle={styles.accountsContent}
        >
          <TouchableOpacity
            style={[
              styles.accChip,
              accountFilter === 'all' && styles.accChipActive,
            ]}
            onPress={() => setAccountFilter('all')}
          >
            <Text
              style={[
                styles.accChipText,
                accountFilter === 'all' && styles.accChipTextActive,
              ]}
            >
              {lang === 'ur' ? 'تمام اکاؤنٹس' : 'All Accounts'}
            </Text>
          </TouchableOpacity>

          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.accChip,
                accountFilter === acc.id && styles.accChipActive,
              ]}
              onPress={() => setAccountFilter(acc.id)}
            >
              <Text
                style={[
                  styles.accChipText,
                  accountFilter === acc.id && styles.accChipTextActive,
                ]}
              >
                {acc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: Transaction) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {lang === 'ur' ? 'کوئی اندراج نہیں ملا' : 'No transactions found'}
            </Text>
            <Text style={styles.emptySub}>
              {lang === 'ur' ? 'فلٹر تبدیل کریں یا نیا خرچہ شامل کریں۔' : 'Try clearing filters or add a transaction.'}
            </Text>
          </View>
        }
        renderItem={({ item }: { item: Transaction }) => (
          <View style={styles.txCard}>
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconBox,
                  item.type === 'income' ? styles.incomeIconBox : styles.expenseIconBox,
                ]}
              >
                {item.type === 'income' ? (
                  <ArrowDownLeft size={18} color="#047857" />
                ) : (
                  <ArrowUpRight size={18} color="#e11d48" />
                )}
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.note || item.category}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaBadge}>{item.category}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaAccount}>{item.account}</Text>
                </View>
                <View style={styles.dateRow}>
                  <Calendar size={11} color="#94a3b8" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text
                style={[
                  styles.amountText,
                  item.type === 'income' ? styles.incomeText : styles.expenseText,
                ]}
              >
                {item.type === 'income' ? '+' : '-'}Rs. {item.amount.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => confirmDelete(item)}
                style={styles.deleteBtn}
              >
                <Trash2 size={15} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#047857',
    justifyContent: 'center',
  },
  pdfBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typePills: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 3,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  typePillActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typePillExpenseActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typePillIncomeActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  typePillTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  typePillExpenseTextActive: {
    color: '#e11d48',
    fontWeight: '700',
  },
  typePillIncomeTextActive: {
    color: '#047857',
    fontWeight: '700',
  },
  accountsRow: {
    maxHeight: 44,
    marginBottom: 6,
  },
  accountsContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  accChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accChipActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  accChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  accChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeIconBox: {
    backgroundColor: '#ecfdf5',
  },
  expenseIconBox: {
    backgroundColor: '#fff1f2',
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  metaBadge: {
    fontSize: 11,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  metaDot: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  metaAccount: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  incomeText: {
    color: '#047857',
  },
  expenseText: {
    color: '#e11d48',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
