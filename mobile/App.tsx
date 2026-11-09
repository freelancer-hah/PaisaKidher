import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Wallet,
  Globe,
  Cloud,
  LogOut,
  User,
} from 'lucide-react-native';

import { supabase } from './src/lib/supabase';
import {
  Transaction,
  AccountBalance,
  UdhaarEntry,
  KametiEntry,
  ProjectEntry,
  ProjectExpenseItem,
  Language,
  ToastNotification,
} from './src/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_UDHAAR,
  INITIAL_KAMETIS,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_EXPENSES,
} from './src/lib/storage';
import { ParsedVoiceResult } from './src/lib/voiceParser';

import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { UdhaarScreen } from './src/screens/UdhaarScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { KametiScreen } from './src/screens/KametiScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AuthScreen } from './src/screens/AuthScreen';

import { AddTransactionModal } from './src/components/modals/AddTransactionModal';
import { AddAccountModal } from './src/components/modals/AddAccountModal';
import { VoiceModal } from './src/components/modals/VoiceModal';
import { UdhaarModal } from './src/components/modals/UdhaarModal';
import { KametiModal } from './src/components/modals/KametiModal';
import { SMSImportModal } from './src/components/modals/SMSImportModal';
import { AuthModal } from './src/components/modals/AuthModal';
import { CreateProjectModal } from './src/components/modals/CreateProjectModal';
import { AddProjectExpenseModal } from './src/components/modals/AddProjectExpenseModal';
import { ToastContainer } from './src/components/Toast';

function MainApp() {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight);

  const [lang, setLang] = useState<Language>('en');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Core Data
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<AccountBalance[]>(INITIAL_ACCOUNTS);
  const [udhaarList, setUdhaarList] = useState<UdhaarEntry[]>(INITIAL_UDHAAR);
  const [kametis, setKametis] = useState<KametiEntry[]>(INITIAL_KAMETIS);
  const [projects, setProjects] = useState<ProjectEntry[]>(INITIAL_PROJECTS);
  const [projectExpenses, setProjectExpenses] = useState<ProjectExpenseItem[]>(INITIAL_PROJECT_EXPENSES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals Visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isUdhaarOpen, setIsUdhaarOpen] = useState(false);
  const [isKametiOpen, setIsKametiOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddProjectExpenseOpen, setIsAddProjectExpenseOpen] = useState(false);
  const [selectedProjectIdForExpense, setSelectedProjectIdForExpense] = useState<string | undefined>(undefined);

  // Toast Helper
  const showToast = (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load local storage and restore offline session
  useEffect(() => {
    const initApp = async () => {
      try {
        const [savedAcc, savedTx, savedUdh, savedKam, savedProj, savedProjExp, savedLang, savedEmail] =
          await Promise.all([
            AsyncStorage.getItem('paisa_accounts'),
            AsyncStorage.getItem('paisa_transactions'),
            AsyncStorage.getItem('paisa_udhaar'),
            AsyncStorage.getItem('paisa_kametis'),
            AsyncStorage.getItem('paisa_projects'),
            AsyncStorage.getItem('paisa_project_expenses'),
            AsyncStorage.getItem('paisa_lang'),
            AsyncStorage.getItem('paisa_user_email'),
          ]);

        if (savedAcc) setAccounts(JSON.parse(savedAcc));
        if (savedTx) setTransactions(JSON.parse(savedTx));
        if (savedUdh) setUdhaarList(JSON.parse(savedUdh));
        if (savedKam) setKametis(JSON.parse(savedKam));
        if (savedProj) setProjects(JSON.parse(savedProj));
        if (savedProjExp) setProjectExpenses(JSON.parse(savedProjExp));
        if (savedLang) setLang(savedLang as Language);
        if (savedEmail) setUserEmail(savedEmail);

        // Check active Supabase session in background if network is available
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            setUserEmail(session.user.email);
            await AsyncStorage.setItem('paisa_user_email', session.user.email);
            if (session.user.id) await AsyncStorage.setItem('paisa_user_id', session.user.id);
          }
        } catch (e) {
          // Offline mode - keep savedEmail
        }
      } catch (e) {
        console.log('Error initializing local data', e);
      } finally {
        setIsLoaded(true);
        setAuthChecking(false);
      }
    };

    initApp();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        AsyncStorage.setItem('paisa_user_email', session.user.email);
        if (session.user.id) AsyncStorage.setItem('paisa_user_id', session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save changes to AsyncStorage for offline persistence
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_accounts', JSON.stringify(accounts));
  }, [accounts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_transactions', JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_udhaar', JSON.stringify(udhaarList));
  }, [udhaarList, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_kametis', JSON.stringify(kametis));
  }, [kametis, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_projects', JSON.stringify(projects));
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('paisa_project_expenses', JSON.stringify(projectExpenses));
  }, [projectExpenses, isLoaded]);

  useEffect(() => {
    AsyncStorage.setItem('paisa_lang', lang);
  }, [lang]);

  // Sync Supabase Data
  useEffect(() => {
    if (!userEmail) return;

    const fetchSupabaseData = async () => {
      try {
        // Accounts
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));

        const { data: dbAccounts } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: true });

        if (dbAccounts && dbAccounts.length > 0) {
          setAccounts(
            dbAccounts.map((dbAcc) => ({
              id: dbAcc.id,
              name: dbAcc.name,
              nameUrdu: dbAcc.name_urdu || '',
              bankKey: dbAcc.type || 'bank',
              balance: Number(dbAcc.balance) || 0,
              color: dbAcc.color || 'from-emerald-700 to-emerald-900',
              icon: 'Building2',
            }))
          );
        } else if (userId && accounts.length > 0) {
          for (const acc of accounts) {
            await supabase.from('accounts').upsert({
              id: acc.id,
              user_id: userId,
              name: acc.name,
              name_urdu: acc.nameUrdu,
              type: acc.bankKey || 'bank',
              balance: acc.balance,
              color: acc.color,
            });
          }
        }

        // Transactions
        const { data: dbTransactions } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbTransactions) {
          setTransactions(
            dbTransactions.map((tx) => ({
              id: tx.id,
              type: tx.type,
              amount: Number(tx.amount) || 0,
              category: tx.category,
              account: tx.account,
              date: tx.date,
              note: tx.note || '',
              source: tx.source || 'manual',
              externalRef: tx.external_ref,
            }))
          );
        }

        // Udhaar
        const { data: dbUdhaar } = await supabase
          .from('udhaar_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbUdhaar) {
          setUdhaarList(
            dbUdhaar.map((u) => ({
              id: u.id,
              contactName: u.contact_name,
              contactPhone: u.contact_phone || '',
              direction: u.direction,
              totalAmount: Number(u.total_amount) || 0,
              paidAmount: Number(u.paid_amount) || 0,
              dueDate: u.due_date,
              createdDate: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              note: u.note,
              status: u.status,
              payments: [],
            }))
          );
        }

        // Kametis
        const { data: dbKametis } = await supabase
          .from('kametis')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbKametis) {
          setKametis(
            dbKametis.map((k) => ({
              id: k.id,
              title: k.title,
              monthlyAmount: Number(k.monthly_amount) || 0,
              totalMembers: Number(k.total_members) || 1,
              currentMonth: Number(k.current_month) || 1,
              myTurnMonth: Number(k.my_turn_month) || 1,
              startDate: k.start_date,
              paidMonthsCount: Number(k.paid_months_count) || 1,
              isPayoutReceived: Boolean(k.is_payout_received),
              notes: k.notes,
              status: k.status || 'active',
            }))
          );
        }

        // Projects & Project Expenses
        try {
          const { data: dbProjects } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
          if (dbProjects && dbProjects.length > 0) {
            setProjects(
              dbProjects.map((p) => ({
                id: p.id,
                title: p.title,
                type: p.type,
                startDate: p.start_date || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: p.status || 'active',
                totalSpent: Number(p.total_spent) || 0,
                notes: p.notes,
              }))
            );
          }

          const { data: dbExpenses } = await supabase
            .from('project_expenses')
            .select('*')
            .order('date', { ascending: false });
          if (dbExpenses && dbExpenses.length > 0) {
            setProjectExpenses(
              dbExpenses.map((e) => ({
                id: e.id,
                projectId: e.project_id,
                subCategory: e.sub_category,
                amount: Number(e.amount) || 0,
                accountId: e.account_id,
                vendorOrPerson: e.vendor_or_person,
                date: e.date,
                note: e.note,
                linkedTransactionId: e.linked_transaction_id,
              }))
            );
          }
        } catch (e) {}
      } catch (err) {
        console.log('Failed to sync from Supabase', err);
      }
    };

    fetchSupabaseData();
  }, [userEmail]);

  // Auth logout confirmation
  const handleAuthPress = () => {
    if (userEmail) {
      Alert.alert(
        lang === 'ur' ? 'اکاؤنٹ' : 'Cloud Account',
        lang === 'ur'
          ? `آپ اس اکاؤنٹ سے لاگ ان ہیں:\n${userEmail}\n\nکیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟`
          : `Logged in as:\n${userEmail}\n\nDo you want to sign out?`,
        [
          { text: lang === 'ur' ? 'منسوخ' : 'Cancel', style: 'cancel' },
          {
            text: lang === 'ur' ? 'لاگ آؤٹ' : 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await supabase.auth.signOut();
              } catch (e) {}
              await AsyncStorage.removeItem('paisa_user_email');
              await AsyncStorage.removeItem('paisa_user_id');
              setUserEmail(null);
              showToast(
                'info',
                lang === 'ur' ? 'لاگ آؤٹ ہو گیا' : 'Signed Out',
                lang === 'ur' ? 'آپ لاگ آؤٹ ہو چکے ہیں' : 'You have been signed out.'
              );
            },
          },
        ]
      );
    }
  };

  // Add Transaction
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };

    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    const targetAcc = accounts.find((a) => a.id === tx.account);
    const newBalance = targetAcc ? targetAcc.balance + delta : delta;

    setTransactions((prev) => [newTx, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account) {
          return { ...acc, balance: newBalance };
        }
        return acc;
      })
    );

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('transactions').insert([
          {
            id: newTx.id,
            user_id: userId,
            type: newTx.type,
            amount: newTx.amount,
            category: newTx.category,
            account: newTx.account,
            date: newTx.date,
            note: newTx.note,
            source: newTx.source,
          },
        ]);

        if (targetAcc) {
          await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', tx.account);
        }
      } catch (e) {
        console.error('Failed to sync transaction to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'اندراج مکمل ہو گیا' : 'Transaction Added',
      `${tx.type === 'expense' ? 'Kharch' : 'Income'} of Rs. ${tx.amount.toLocaleString()} logged.`
    );
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const reverseDelta = tx.type === 'income' ? -tx.amount : tx.amount;
    const targetAcc = accounts.find((a) => a.id === tx.account);
    const newBalance = targetAcc ? targetAcc.balance + reverseDelta : 0;

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account) {
          return { ...acc, balance: newBalance };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (userEmail) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
        if (targetAcc) {
          await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', tx.account);
        }
      } catch (e) {
        console.error('Failed to delete transaction from Supabase', e);
      }
    }

    showToast('info', 'Deleted', 'Transaction removed.');
  };

  // Add Account
  const handleAddAccount = async (newAcc: AccountBalance) => {
    setAccounts((prev) => [...prev, newAcc]);

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('accounts').insert([
          {
            id: newAcc.id,
            user_id: userId,
            name: newAcc.name,
            name_urdu: newAcc.nameUrdu,
            type: newAcc.bankKey || 'bank',
            balance: newAcc.balance,
            color: newAcc.color,
          },
        ]);
      } catch (e) {
        console.error('Failed to insert account to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'نیا اکاؤنٹ شامل ہو گیا' : 'Account Added!',
      `${newAcc.name} added to your wallets.`
    );
  };

  // Delete Account
  const handleDeleteAccount = async (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (userEmail) {
      try {
        await supabase.from('accounts').delete().eq('id', id);
        await supabase.from('transactions').delete().eq('account', id);
      } catch (e) {
        console.error('Failed to delete account from Supabase', e);
      }
    }
    showToast('info', 'Removed', 'Account removed from active wallets.');
  };

  // Voice Entry with Full Wallet Sync
  const handleConfirmVoiceEntry = async (parsed: ParsedVoiceResult) => {
    if (parsed.type === 'udhaar') {
      const udhaarId = `udh-${Date.now()}`;
      const defaultAcc = accounts[0]?.id || 'cash';
      const txId = `tx-${Date.now()}`;
      const direction: 'given' | 'taken' = parsed.udhaarDirection || 'given';
      const txType: 'expense' | 'income' = direction === 'given' ? 'expense' : 'income';
      const txCategory =
        direction === 'given' ? 'Udhaar Given / ادھار دیا' : 'Udhaar Borrowed / ادھار لیا';

      const newUdhaar: UdhaarEntry = {
        id: udhaarId,
        contactName: parsed.contactName || 'Contact',
        contactPhone: '',
        direction,
        totalAmount: parsed.amount,
        paidAmount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        note: parsed.note,
        status: 'pending',
        payments: [],
        accountId: defaultAcc,
        syncWallet: true,
        linkedTransactionId: txId,
      };

      const newTx: Transaction = {
        id: txId,
        type: txType,
        amount: parsed.amount,
        category: txCategory,
        account: defaultAcc,
        date: new Date().toISOString().split('T')[0],
        note: parsed.note || `Voice Udhaar: ${parsed.contactName || 'Party'}`,
        source: 'voice',
        udhaarId: udhaarId,
      };

      const delta = txType === 'income' ? parsed.amount : -parsed.amount;
      const targetAcc = accounts.find((a) => a.id === defaultAcc);
      const newBalance = targetAcc ? targetAcc.balance + delta : delta;

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === defaultAcc ? { ...acc, balance: newBalance } : acc))
      );
      setTransactions((prev) => [newTx, ...prev]);
      setUdhaarList((prev) => [newUdhaar, ...prev]);

      showToast(
        'success',
        lang === 'ur' ? 'ادھار کھاتہ بن گیا (والیٹ اپڈیٹ)' : 'Udhaar Added via Voice!',
        `Recorded Rs. ${parsed.amount.toLocaleString()} for ${parsed.contactName}`
      );
    } else {
      handleAddTransaction({
        type: parsed.type,
        amount: parsed.amount,
        category: parsed.category,
        account: parsed.account,
        date: new Date().toISOString().split('T')[0],
        note: parsed.note,
        source: 'voice',
      });
    }
  };

  // Add Udhaar with Live Wallet Sync
  const handleAddUdhaar = async (
    entry: Omit<UdhaarEntry, 'id' | 'paidAmount' | 'payments' | 'status'>
  ) => {
    const udhaarId = `udh-${Date.now()}`;
    const chosenAcc = entry.accountId || accounts[0]?.id || 'cash';
    let linkedTxId: string | undefined = undefined;

    const newEntry: UdhaarEntry = {
      ...entry,
      id: udhaarId,
      paidAmount: 0,
      status: 'pending',
      payments: [],
      accountId: chosenAcc,
      syncWallet: entry.syncWallet ?? true,
    };

    if (entry.syncWallet) {
      linkedTxId = `tx-${Date.now()}`;
      newEntry.linkedTransactionId = linkedTxId;

      const txType: 'expense' | 'income' = entry.direction === 'given' ? 'expense' : 'income';
      const txCategory =
        entry.direction === 'given' ? 'Udhaar Given / ادھار دیا' : 'Udhaar Borrowed / ادھار لیا';
      const txNote = entry.note
        ? `${entry.note} (${entry.contactName})`
        : entry.direction === 'given'
        ? `Udhaar lent to ${entry.contactName} / ادھار دیا گیا`
        : `Udhaar borrowed from ${entry.contactName} / ادھار لیا گیا`;

      const newTx: Transaction = {
        id: linkedTxId,
        type: txType,
        amount: entry.totalAmount,
        category: txCategory,
        account: chosenAcc,
        date: entry.createdDate || new Date().toISOString().split('T')[0],
        note: txNote,
        source: 'manual',
        udhaarId: udhaarId,
      };

      const delta = txType === 'income' ? entry.totalAmount : -entry.totalAmount;
      const targetAcc = accounts.find((a) => a.id === chosenAcc);
      const newBalance = targetAcc ? targetAcc.balance + delta : delta;

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === chosenAcc ? { ...acc, balance: newBalance } : acc))
      );
      setTransactions((prev) => [newTx, ...prev]);

      if (userEmail) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
          await supabase.from('transactions').insert([
            {
              id: newTx.id,
              user_id: userId,
              type: newTx.type,
              amount: newTx.amount,
              category: newTx.category,
              account: newTx.account,
              date: newTx.date,
              note: newTx.note,
              source: newTx.source,
            },
          ]);
          if (targetAcc) {
            await supabase.from('accounts').update({ balance: newBalance }).eq('id', chosenAcc);
          }
        } catch (e) {
          console.error('Failed to sync udhaar tx to Supabase', e);
        }
      }
    }

    setUdhaarList((prev) => [newEntry, ...prev]);

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('udhaar_entries').insert([
          {
            id: newEntry.id,
            user_id: userId,
            contact_name: newEntry.contactName,
            contact_phone: newEntry.contactPhone,
            direction: newEntry.direction,
            total_amount: newEntry.totalAmount,
            paid_amount: 0,
            due_date: newEntry.dueDate,
            note: newEntry.note,
            status: 'pending',
          },
        ]);
      } catch (e) {
        console.error('Failed to sync udhaar to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'ادھار محفوظ ہوا' : 'Udhaar Created!',
      `${entry.direction === 'given' ? 'Lent to' : 'Borrowed from'} ${entry.contactName}: Rs. ${entry.totalAmount.toLocaleString()}${entry.syncWallet ? ' (Wallet Synced)' : ''}`
    );
  };

  // Udhaar Payment with Live Wallet Integration
  const handleRecordUdhaarPayment = async (id: string, amount: number, accountId?: string) => {
    let updatedEntry: UdhaarEntry | null = null;
    const targetEntry = udhaarList.find((u) => u.id === id);
    if (!targetEntry) return;

    const chosenAcc = accountId || targetEntry.accountId || accounts[0]?.id || 'cash';
    const txId = `tx-${Date.now()}`;

    const txType: 'expense' | 'income' = targetEntry.direction === 'given' ? 'income' : 'expense';
    const txCategory =
      targetEntry.direction === 'given'
        ? 'Udhaar Recovery / ادھار وصولی'
        : 'Udhaar Repaid / ادھار ادائیگی';
    const txNote =
      targetEntry.direction === 'given'
        ? `Udhaar recovery from ${targetEntry.contactName} / ادھار وصولی`
        : `Udhaar repayment to ${targetEntry.contactName} / ادھار ادائیگی`;

    const newTx: Transaction = {
      id: txId,
      type: txType,
      amount,
      category: txCategory,
      account: chosenAcc,
      date: new Date().toISOString().split('T')[0],
      note: txNote,
      source: 'manual',
      udhaarId: id,
    };

    const delta = txType === 'income' ? amount : -amount;
    const targetAcc = accounts.find((a) => a.id === chosenAcc);
    const newBalance = targetAcc ? targetAcc.balance + delta : delta;

    setAccounts((prev) =>
      prev.map((acc) => (acc.id === chosenAcc ? { ...acc, balance: newBalance } : acc))
    );
    setTransactions((prev) => [newTx, ...prev]);

    setUdhaarList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newPaid = u.paidAmount + amount;
          const status = newPaid >= u.totalAmount ? 'settled' : 'partially_paid';
          updatedEntry = {
            ...u,
            paidAmount: newPaid,
            status,
            payments: [
              ...u.payments,
              {
                id: `up-${Date.now()}`,
                amount,
                date: new Date().toISOString().split('T')[0],
                accountId: chosenAcc,
                linkedTransactionId: txId,
              },
            ],
          };
          return updatedEntry;
        }
        return u;
      })
    );

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('transactions').insert([
          {
            id: newTx.id,
            user_id: userId,
            type: newTx.type,
            amount: newTx.amount,
            category: newTx.category,
            account: newTx.account,
            date: newTx.date,
            note: newTx.note,
            source: newTx.source,
          },
        ]);
        if (targetAcc) {
          await supabase.from('accounts').update({ balance: newBalance }).eq('id', chosenAcc);
        }
        if (updatedEntry) {
          await supabase
            .from('udhaar_entries')
            .update({
              paid_amount: (updatedEntry as UdhaarEntry).paidAmount,
              status: (updatedEntry as UdhaarEntry).status,
            })
            .eq('id', id);
        }
      } catch (e) {
        console.error('Failed to update udhaar payment in Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'ادائیگی درج ہو گئی' : 'Payment Recorded!',
      `${targetEntry.direction === 'given' ? 'Received' : 'Paid'} Rs. ${amount.toLocaleString()} via ${targetAcc?.name || 'Wallet'}`
    );
  };

  const handleDeleteUdhaar = async (id: string) => {
    const linkedTxs = transactions.filter((t) => t.udhaarId === id);
    if (linkedTxs.length > 0) {
      setAccounts((prev) => {
        let updated = [...prev];
        linkedTxs.forEach((tx) => {
          const revDelta = tx.type === 'income' ? -tx.amount : tx.amount;
          updated = updated.map((a) => (a.id === tx.account ? { ...a, balance: a.balance + revDelta } : a));
        });
        return updated;
      });
      setTransactions((prev) => prev.filter((t) => t.udhaarId !== id));
    }

    setUdhaarList((prev) => prev.filter((u) => u.id !== id));
    if (userEmail) {
      try {
        await supabase.from('udhaar_entries').delete().eq('id', id);
        for (const tx of linkedTxs) {
          await supabase.from('transactions').delete().eq('id', tx.id);
        }
      } catch (e) {
        console.error('Failed to delete udhaar from Supabase', e);
      }
    }
    showToast('info', 'Deleted', 'Udhaar record and linked balance entries removed.');
  };

  // Projects Handlers
  const handleCreateProject = async (
    project: Omit<ProjectEntry, 'id' | 'totalSpent' | 'status'>
  ) => {
    const newProj: ProjectEntry = {
      ...project,
      id: `proj-${Date.now()}`,
      status: 'active',
      totalSpent: 0,
    };

    setProjects((prev) => [newProj, ...prev]);

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('projects').insert([
          {
            id: newProj.id,
            user_id: userId,
            title: newProj.title,
            type: newProj.type,
            start_date: newProj.startDate,
            status: 'active',
            total_spent: 0,
            notes: newProj.notes,
          },
        ]);
      } catch (e) {}
    }

    showToast(
      'success',
      lang === 'ur' ? 'پراجیکٹ بن گیا' : 'Project Created!',
      `${newProj.title} is ready for itemized expenses.`
    );
  };

  const handleToggleProjectStatus = async (id: string) => {
    let updatedProj: ProjectEntry | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'active' ? 'completed' : 'active';
          updatedProj = { ...p, status: newStatus };
          return updatedProj;
        }
        return p;
      })
    );

    if (userEmail && updatedProj) {
      try {
        await supabase
          .from('projects')
          .update({ status: (updatedProj as ProjectEntry).status })
          .eq('id', id);
      } catch (e) {}
    }
  };

  const handleDeleteProject = async (id: string) => {
    const expensesToDelete = projectExpenses.filter((e) => e.projectId === id);
    if (expensesToDelete.length > 0) {
      setAccounts((prev) => {
        let updated = [...prev];
        expensesToDelete.forEach((exp) => {
          updated = updated.map((a) =>
            a.id === exp.accountId ? { ...a, balance: a.balance + exp.amount } : a
          );
        });
        return updated;
      });
      setTransactions((prev) => prev.filter((t) => t.projectId !== id));
      setProjectExpenses((prev) => prev.filter((e) => e.projectId !== id));
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));

    if (userEmail) {
      try {
        await supabase.from('projects').delete().eq('id', id);
        await supabase.from('project_expenses').delete().eq('project_id', id);
        await supabase.from('transactions').delete().eq('project_id', id);
      } catch (e) {}
    }

    showToast('info', 'Deleted', 'Project and its expenses have been removed.');
  };

  const handleAddProjectExpense = async (
    item: Omit<ProjectExpenseItem, 'id' | 'linkedTransactionId'>
  ) => {
    const expenseId = `pexp-${Date.now()}`;
    const txId = `tx-${Date.now()}`;
    const targetProject = projects.find((p) => p.id === item.projectId);
    const projTitle = targetProject?.title || 'Project';

    const newExpense: ProjectExpenseItem = {
      ...item,
      id: expenseId,
      linkedTransactionId: txId,
    };

    const txNote = `[${projTitle}] ${item.vendorOrPerson ? `${item.vendorOrPerson} - ` : ''}${item.subCategory}${item.note ? ` (${item.note})` : ''}`;

    const newTx: Transaction = {
      id: txId,
      type: 'expense',
      amount: item.amount,
      category: `Project: ${projTitle}`,
      projectId: item.projectId,
      projectSubCategory: item.subCategory,
      account: item.accountId,
      date: item.date,
      note: txNote,
      source: 'manual',
    };

    const targetAcc = accounts.find((a) => a.id === item.accountId);
    const newBalance = targetAcc ? targetAcc.balance - item.amount : -item.amount;

    setAccounts((prev) =>
      prev.map((a) => (a.id === item.accountId ? { ...a, balance: newBalance } : a))
    );
    setTransactions((prev) => [newTx, ...prev]);
    setProjectExpenses((prev) => [newExpense, ...prev]);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === item.projectId ? { ...p, totalSpent: p.totalSpent + item.amount } : p
      )
    );

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('project_expenses').insert([
          {
            id: newExpense.id,
            user_id: userId,
            project_id: newExpense.projectId,
            sub_category: newExpense.subCategory,
            amount: newExpense.amount,
            account_id: newExpense.accountId,
            vendor_or_person: newExpense.vendorOrPerson,
            date: newExpense.date,
            note: newExpense.note,
            linked_transaction_id: txId,
          },
        ]);
        await supabase.from('transactions').insert([
          {
            id: newTx.id,
            user_id: userId,
            type: newTx.type,
            amount: newTx.amount,
            category: newTx.category,
            account: newTx.account,
            date: newTx.date,
            note: newTx.note,
            source: newTx.source,
          },
        ]);
        if (targetAcc) {
          await supabase.from('accounts').update({ balance: newBalance }).eq('id', item.accountId);
        }
        if (targetProject) {
          await supabase
            .from('projects')
            .update({ total_spent: targetProject.totalSpent + item.amount })
            .eq('id', targetProject.id);
        }
      } catch (e) {}
    }

    showToast(
      'success',
      lang === 'ur' ? 'پراجیکٹ خرچہ درج ہوا' : 'Expense Logged!',
      `Rs. ${item.amount.toLocaleString()} for ${item.subCategory} deducted from ${targetAcc?.name || 'Wallet'}`
    );
  };

  const handleDeleteProjectExpenseItem = async (id: string) => {
    const item = projectExpenses.find((e) => e.id === id);
    if (!item) return;

    setAccounts((prev) =>
      prev.map((a) => (a.id === item.accountId ? { ...a, balance: a.balance + item.amount } : a))
    );

    if (item.linkedTransactionId) {
      setTransactions((prev) => prev.filter((t) => t.id !== item.linkedTransactionId));
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === item.projectId
          ? { ...p, totalSpent: Math.max(0, p.totalSpent - item.amount) }
          : p
      )
    );

    setProjectExpenses((prev) => prev.filter((e) => e.id !== id));

    if (userEmail) {
      try {
        await supabase.from('project_expenses').delete().eq('id', id);
        if (item.linkedTransactionId) {
          await supabase.from('transactions').delete().eq('id', item.linkedTransactionId);
        }
      } catch (e) {}
    }

    showToast('info', 'Removed', 'Project expense removed and wallet balance restored.');
  };

  // Add Kameti
  const handleAddKameti = async (
    entry: Omit<KametiEntry, 'id' | 'paidMonthsCount' | 'isPayoutReceived' | 'status'>
  ) => {
    const newKam: KametiEntry = {
      ...entry,
      id: `kam-${Date.now()}`,
      paidMonthsCount: 1,
      isPayoutReceived: false,
      status: 'active',
    };

    setKametis((prev) => [newKam, ...prev]);

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (await AsyncStorage.getItem('paisa_user_id'));
        await supabase.from('kametis').insert([
          {
            id: newKam.id,
            user_id: userId,
            title: newKam.title,
            monthly_amount: newKam.monthlyAmount,
            total_members: newKam.totalMembers,
            current_month: 1,
            my_turn_month: newKam.myTurnMonth,
            start_date: newKam.startDate,
            notes: newKam.notes,
          },
        ]);
      } catch (e) {
        console.error('Failed to sync kameti to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'نئی کمیٹی شروع ہو گئی' : 'Kameti Created!',
      `${entry.title} created with Rs. ${entry.monthlyAmount.toLocaleString()} monthly installment.`
    );
  };

  // Pay Kameti Installment
  const handlePayKametiInstallment = async (id: string) => {
    const kam = kametis.find((k) => k.id === id);
    if (!kam) return;

    const newPaidCount = Math.min(kam.totalMembers, kam.paidMonthsCount + 1);
    const newCurrentMonth = Math.min(kam.totalMembers, kam.currentMonth + 1);

    setKametis((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              paidMonthsCount: newPaidCount,
              currentMonth: newCurrentMonth,
            }
          : k
      )
    );

    if (userEmail) {
      try {
        await supabase
          .from('kametis')
          .update({
            paid_months_count: newPaidCount,
            current_month: newCurrentMonth,
          })
          .eq('id', id);
      } catch (e) {
        console.error('Failed to update kameti installment in Supabase', e);
      }
    }

    handleAddTransaction({
      type: 'expense',
      amount: kam.monthlyAmount,
      category: 'Kameti Payment / کمیٹی',
      account: accounts[0]?.id || 'cash',
      date: new Date().toISOString().split('T')[0],
      note: `Monthly BC installment for ${kam.title}`,
      source: 'manual',
    });

    showToast(
      'success',
      lang === 'ur' ? 'قسط ادا ہو گئی' : 'Installment Paid!',
      `Paid Rs. ${kam.monthlyAmount.toLocaleString()} for ${kam.title}`
    );
  };

  // Claim Kameti Payout
  const handleClaimKametiPayout = async (id: string) => {
    const kam = kametis.find((k) => k.id === id);
    if (!kam) return;

    const pool = kam.monthlyAmount * kam.totalMembers;

    setKametis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isPayoutReceived: true } : k))
    );

    if (userEmail) {
      try {
        await supabase
          .from('kametis')
          .update({ is_payout_received: true })
          .eq('id', id);
      } catch (e) {
        console.error('Failed to update kameti payout in Supabase', e);
      }
    }

    handleAddTransaction({
      type: 'income',
      amount: pool,
      category: 'Kameti Payout / کمیٹی وصولی',
      account: accounts[0]?.id || 'cash',
      date: new Date().toISOString().split('T')[0],
      note: `Full Payout Pool received for ${kam.title}`,
      source: 'manual',
    });

    showToast(
      'success',
      lang === 'ur' ? 'مبارک ہو! کمیٹی وصول ہو گئی' : 'Congratulations! Payout Claimed!',
      'Kameti payout received successfully.'
    );
  };

  const handleDeleteKameti = async (id: string) => {
    setKametis((prev) => prev.filter((k) => k.id !== id));
    if (userEmail) {
      try {
        await supabase.from('kametis').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete kameti from Supabase', e);
      }
    }
    showToast('info', 'Deleted', 'Kameti removed.');
  };

  // SMS Import Confirmed
  const handleSMSImport = (txData: Omit<Transaction, 'id'>) => {
    handleAddTransaction(txData);
  };

  if (authChecking) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <View style={styles.splashLogo}>
          <Wallet size={36} color="#ffffff" />
        </View>
        <Text style={styles.splashTitle}>PaisaKidhar</Text>
        <Text style={styles.splashSubtitle}>
          {lang === 'ur' ? 'آپ کا سمارٹ لیجر لوڈ ہو رہا ہے...' : 'Starting your smart finance ledger...'}
        </Text>
        <ActivityIndicator size="small" color="#047857" style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.safeArea}>
        <StatusBar style="dark" />
        <AuthScreen
          lang={lang}
          setLang={setLang}
          onAuthSuccess={(email) => {
            setUserEmail(email);
            showToast(
              'success',
              lang === 'ur' ? 'خوش آمدید!' : 'Welcome!',
              lang === 'ur' ? `کامیابی سے لاگ ان ہو گئے: ${email}` : `Logged in as ${email}`
            );
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={[styles.topHeader, { paddingTop: topPadding + 8 }]}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Wallet size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>PaisaKidhar</Text>
            <Text style={styles.brandSubtitle}>
              {lang === 'ur' ? 'پاکستان کا اپنا بجٹ ایپ' : 'Smart Finance & BC'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setLang(lang === 'en' ? 'ur' : 'en')}
          >
            <Globe size={14} color="#047857" />
            <Text style={styles.headerBtnText}>{lang === 'en' ? 'اردو' : 'EN'}</Text>
          </TouchableOpacity>

          {/* Cloud Auth Button */}
          <TouchableOpacity
            style={[styles.headerBtn, userEmail && styles.headerBtnAuth]}
            onPress={handleAuthPress}
          >
            <Cloud size={14} color={userEmail ? '#047857' : '#64748b'} />
            <Text style={[styles.headerBtnText, userEmail && { color: '#047857' }]}>
              {userEmail ? userEmail.split('@')[0] : 'Cloud Sync'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

        {/* Navigation Container & Bottom Tabs */}
        <NavigationContainer>
          <BottomTabNavigator
            lang={lang}
            DashboardComponent={({ navigation }: any) => (
              <DashboardScreen
                transactions={transactions}
                accounts={accounts}
                udhaarList={udhaarList}
                kametis={kametis}
                lang={lang}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onOpenAddModal={() => setIsAddOpen(true)}
                onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
                onOpenSMSModal={() => setIsSMSOpen(true)}
                onDeleteAccount={handleDeleteAccount}
                onDeleteTransaction={handleDeleteTransaction}
                navigation={navigation}
              />
            )}
            TransactionsComponent={() => (
              <TransactionsScreen
                transactions={transactions}
                accounts={accounts}
                onDeleteTransaction={handleDeleteTransaction}
                lang={lang}
              />
            )}
            UdhaarComponent={() => (
              <UdhaarScreen
                udhaarList={udhaarList}
                accounts={accounts}
                onOpenUdhaarModal={() => setIsUdhaarOpen(true)}
                onRecordPayment={handleRecordUdhaarPayment}
                onDeleteUdhaar={handleDeleteUdhaar}
                lang={lang}
              />
            )}
            ProjectsComponent={() => (
              <ProjectsScreen
                projects={projects}
                projectExpenses={projectExpenses}
                accounts={accounts}
                onOpenCreateModal={() => setIsCreateProjectOpen(true)}
                onOpenAddExpenseModal={(projId) => {
                  setSelectedProjectIdForExpense(projId);
                  setIsAddProjectExpenseOpen(true);
                }}
                onToggleProjectStatus={handleToggleProjectStatus}
                onDeleteProject={handleDeleteProject}
                onDeleteExpenseItem={handleDeleteProjectExpenseItem}
                lang={lang}
              />
            )}
            KametiComponent={() => (
              <KametiScreen
                kametis={kametis}
                onOpenKametiModal={() => setIsKametiOpen(true)}
                onPayInstallment={handlePayKametiInstallment}
                onClaimPayout={handleClaimKametiPayout}
                onDeleteKameti={handleDeleteKameti}
                lang={lang}
              />
            )}
            AnalyticsComponent={() => (
              <AnalyticsScreen transactions={transactions} lang={lang} />
            )}
          />
        </NavigationContainer>

        {/* Modals */}
        <AddTransactionModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddTransaction={handleAddTransaction}
          accounts={accounts}
          lang={lang}
          onOpenAddAccountModal={() => {
            setIsAddOpen(false);
            setIsAddAccountOpen(true);
          }}
        />

        <AddAccountModal
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onAddAccount={handleAddAccount}
          lang={lang}
        />

        <VoiceModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onConfirmVoiceEntry={handleConfirmVoiceEntry}
          lang={lang}
        />

        <UdhaarModal
          isOpen={isUdhaarOpen}
          onClose={() => setIsUdhaarOpen(false)}
          onAddUdhaar={handleAddUdhaar}
          accounts={accounts}
          onOpenAddAccountModal={() => {
            setIsUdhaarOpen(false);
            setIsAddAccountOpen(true);
          }}
          lang={lang}
        />

        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreateProject={handleCreateProject}
          lang={lang}
        />

        <AddProjectExpenseModal
          isOpen={isAddProjectExpenseOpen}
          onClose={() => {
            setIsAddProjectExpenseOpen(false);
            setSelectedProjectIdForExpense(undefined);
          }}
          projects={projects}
          accounts={accounts}
          initialProjectId={selectedProjectIdForExpense}
          onAddExpense={handleAddProjectExpense}
          onOpenAddAccountModal={() => {
            setIsAddProjectExpenseOpen(false);
            setIsAddAccountOpen(true);
          }}
          lang={lang}
        />

        <KametiModal
          isOpen={isKametiOpen}
          onClose={() => setIsKametiOpen(false)}
          onAddKameti={handleAddKameti}
          lang={lang}
        />

        <SMSImportModal
          isOpen={isSMSOpen}
          onClose={() => setIsSMSOpen(false)}
          onImportTransaction={handleSMSImport}
          lang={lang}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(email) => {
            setUserEmail(email);
            showToast('success', 'Logged In!', `Syncing data with ${email}`);
          }}
          lang={lang}
        />

        {/* In-App Toast Overlay */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerBtnAuth: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashLogo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  splashSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});
