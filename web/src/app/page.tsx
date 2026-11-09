'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { ToastContainer } from '@/components/Toast';
import { DashboardTab } from '@/components/DashboardTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { UdhaarTab } from '@/components/UdhaarTab';
import { KametiTab } from '@/components/KametiTab';
import { AnalyticsTab } from '@/components/AnalyticsTab';
import { ProjectsTab } from '@/components/ProjectsTab';
import { Wallet } from 'lucide-react';

import { AddTransactionModal } from '@/components/AddTransactionModal';
import { VoiceModal } from '@/components/VoiceModal';
import { UdhaarModal } from '@/components/UdhaarModal';
import { KametiModal } from '@/components/KametiModal';
import { SMSImportModal } from '@/components/SMSImportModal';
import { AuthModal } from '@/components/AuthModal';
import { AddAccountModal } from '@/components/AddAccountModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { AddProjectExpenseModal } from '@/components/AddProjectExpenseModal';

import { supabase } from '@/lib/supabase/client';
import {
  Transaction,
  AccountBalance,
  UdhaarEntry,
  KametiEntry,
  ProjectEntry,
  ProjectExpenseItem,
  Language,
  ToastNotification,
} from '@/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_UDHAAR,
  INITIAL_KAMETIS,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_EXPENSES,
} from '@/lib/storage';
import { ParsedVoiceResult } from '@/lib/voiceParser';

export default function Home() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [lang, setLang] = useState<Language>('en');

  // Supabase Auth State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Core Data State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<AccountBalance[]>(INITIAL_ACCOUNTS);
  const [udhaarList, setUdhaarList] = useState<UdhaarEntry[]>(INITIAL_UDHAAR);
  const [kametis, setKametis] = useState<KametiEntry[]>(INITIAL_KAMETIS);
  const [projects, setProjects] = useState<ProjectEntry[]>(INITIAL_PROJECTS);
  const [projectExpenses, setProjectExpenses] = useState<ProjectExpenseItem[]>(INITIAL_PROJECT_EXPENSES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Pop-up Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals Visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isUdhaarOpen, setIsUdhaarOpen] = useState(false);
  const [isKametiOpen, setIsKametiOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddProjectExpenseOpen, setIsAddProjectExpenseOpen] = useState(false);
  const [selectedProjectIdForExpense, setSelectedProjectIdForExpense] = useState<string | undefined>(undefined);

  // Load offline data from localStorage on client mount
  useEffect(() => {
    try {
      const savedAccounts = localStorage.getItem('paisa_accounts');
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

      const savedTx = localStorage.getItem('paisa_transactions');
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedUdh = localStorage.getItem('paisa_udhaar');
      if (savedUdh) setUdhaarList(JSON.parse(savedUdh));

      const savedKam = localStorage.getItem('paisa_kametis');
      if (savedKam) setKametis(JSON.parse(savedKam));

      const savedProj = localStorage.getItem('paisa_projects');
      if (savedProj) setProjects(JSON.parse(savedProj));

      const savedProjExp = localStorage.getItem('paisa_project_expenses');
      if (savedProjExp) setProjectExpenses(JSON.parse(savedProjExp));
    } catch (e) {
      // fallback
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage when changed (Ensures 100% offline persistence)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('paisa_accounts', JSON.stringify(accounts));
        localStorage.setItem('paisa_transactions', JSON.stringify(transactions));
        localStorage.setItem('paisa_udhaar', JSON.stringify(udhaarList));
        localStorage.setItem('paisa_kametis', JSON.stringify(kametis));
        localStorage.setItem('paisa_projects', JSON.stringify(projects));
        localStorage.setItem('paisa_project_expenses', JSON.stringify(projectExpenses));
      } catch (e) {
        // fallback
      }
    }
  }, [accounts, transactions, udhaarList, kametis, projects, projectExpenses, isLoaded]);

  // Mandatory Auth Check with Offline Support
  useEffect(() => {
    // 1. Check local storage first (instant, allows 100% offline usage if already logged in)
    const cachedEmail = localStorage.getItem('paisa_user_email');
    const cachedName = localStorage.getItem('paisa_user_name');
    if (cachedEmail) {
      setUserEmail(cachedEmail);
      if (cachedName) setUserName(cachedName);
      setAuthChecking(false);
    }

    // 2. Validate with Supabase if online
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
          if (fullName) {
            setUserName(fullName);
            localStorage.setItem('paisa_user_name', fullName);
          }
          localStorage.setItem('paisa_user_email', session.user.email);
          if (session.user.id) localStorage.setItem('paisa_user_id', session.user.id);
          setAuthChecking(false);
        } else if (!cachedEmail) {
          setAuthChecking(false);
          router.push('/login');
        }
      })
      .catch(() => {
        // Offline / network failure
        if (!cachedEmail) {
          setAuthChecking(false);
          router.push('/login');
        } else {
          setAuthChecking(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
        if (fullName) {
          setUserName(fullName);
          localStorage.setItem('paisa_user_name', fullName);
        }
        localStorage.setItem('paisa_user_email', session.user.email);
      } else if (!localStorage.getItem('paisa_user_email')) {
        setUserEmail(null);
        setUserName(null);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Sync data from Supabase when user is authenticated
  useEffect(() => {
    if (!userEmail) return;

    const fetchSupabaseData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);

        // 1. Fetch Accounts
        const { data: dbAccounts, error: accError } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: true });

        if (!accError && dbAccounts && dbAccounts.length > 0) {
          const mappedAccounts: AccountBalance[] = dbAccounts.map((dbAcc) => ({
            id: dbAcc.id,
            name: dbAcc.name,
            nameUrdu: dbAcc.name_urdu || '',
            bankKey: dbAcc.type || 'bank',
            balance: Number(dbAcc.balance) || 0,
            color: dbAcc.color || 'from-emerald-700 to-emerald-900',
            icon: 'Building2',
          }));
          setAccounts(mappedAccounts);
        } else if (userId && accounts.length > 0) {
          // If Supabase accounts table is empty for this user, seed current accounts into Supabase
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

        // 2. Fetch Transactions
        const { data: dbTransactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!txError && dbTransactions) {
          const mappedTx: Transaction[] = dbTransactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amount) || 0,
            category: tx.category,
            account: tx.account,
            date: tx.date,
            note: tx.note || '',
            source: tx.source || 'manual',
            externalRef: tx.external_ref,
          }));
          setTransactions(mappedTx);
        }

        // 3. Fetch Udhaar
        const { data: dbUdhaar, error: udhError } = await supabase
          .from('udhaar_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!udhError && dbUdhaar) {
          const mappedUdhaar: UdhaarEntry[] = dbUdhaar.map((u) => ({
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
          }));
          setUdhaarList(mappedUdhaar);
        }

        // 4. Fetch Kametis
        const { data: dbKametis, error: kamError } = await supabase
          .from('kametis')
          .select('*')
          .order('created_at', { ascending: false });

        if (!kamError && dbKametis) {
          const mappedKametis: KametiEntry[] = dbKametis.map((k) => ({
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
          }));
          setKametis(mappedKametis);
        }

        // 5. Fetch Projects & Project Expenses
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
        } catch (e) {
          // Graceful offline fallback
        }
      } catch (err) {
        console.error('Failed to sync from Supabase', err);
      }
    };

    fetchSupabaseData();
  }, [userEmail]);

  // Toast Trigger Helper
  const showToast = (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('paisa_user_email');
    localStorage.removeItem('paisa_user_id');
    localStorage.removeItem('paisa_user_name');
    setUserEmail(null);
    setUserName(null);
    router.push('/login');
  };

  // Add Transaction Handler
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };

    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    const targetAcc = accounts.find((a) => a.id === tx.account);
    const newBalance = targetAcc ? targetAcc.balance + delta : delta;

    // 1. Update local state immediately
    setTransactions((prev) => [newTx, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account) {
          return { ...acc, balance: newBalance };
        }
        return acc;
      })
    );

    // 2. Persist to Supabase if authenticated
    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);

        // Insert transaction with authenticated user_id
        const { error: txErr } = await supabase.from('transactions').insert([
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
            external_ref: newTx.externalRef,
          },
        ]);

        if (txErr) {
          console.error('Supabase transaction insert error:', txErr);
        }

        // Update target account balance in Supabase
        if (targetAcc) {
          const { error: accErr } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', tx.account);

          if (accErr) {
            console.error('Supabase account update error:', accErr);
          }
        }
      } catch (e) {
        console.error('Failed to sync transaction to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'اندراج مکمل ہو گیا' : 'Transaction Recorded!',
      `${tx.type === 'expense' ? 'Kharch' : 'Aamdan'} of Rs. ${tx.amount.toLocaleString()} recorded.`
    );
  };

  // Add Bank Account Handler
  const handleAddAccount = async (newAcc: AccountBalance) => {
    setAccounts((prev) => [...prev, newAcc]);

    if (userEmail) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
      `${newAcc.name} (Rs. ${newAcc.balance.toLocaleString()}) added to your active wallets.`
    );
  };

  // Delete Bank Account Handler
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
    showToast(
      'info',
      lang === 'ur' ? 'اکاؤنٹ حذف ہو گیا' : 'Account Removed',
      'Account removed from your active accounts.'
    );
  };

  // Handle Voice Confirmed Entry with Full Wallet Sync
  const handleConfirmVoiceEntry = (parsed: ParsedVoiceResult) => {
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

  // Add Udhaar Handler with Unified Accounting & Wallet Sync
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

    // If syncWallet is true, automatically affect selected wallet & log transaction!
    if (entry.syncWallet) {
      linkedTxId = `tx-${Date.now()}`;
      newEntry.linkedTransactionId = linkedTxId;

      const txType: 'expense' | 'income' = entry.direction === 'given' ? 'expense' : 'income';
      const txCategory =
        entry.direction === 'given'
          ? 'Udhaar Given / ادھار دیا'
          : 'Udhaar Borrowed / ادھار لیا';
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

      // 1. Update wallet balance
      const delta = txType === 'income' ? entry.totalAmount : -entry.totalAmount;
      const targetAcc = accounts.find((a) => a.id === chosenAcc);
      const newBalance = targetAcc ? targetAcc.balance + delta : delta;

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === chosenAcc ? { ...acc, balance: newBalance } : acc))
      );

      // 2. Add transaction to ledger
      setTransactions((prev) => [newTx, ...prev]);

      // 3. Supabase update for transaction and account
      if (userEmail) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const userId =
            session?.user?.id ||
            (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId =
          session?.user?.id ||
          (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
      lang === 'ur' ? 'ادھار کھاتہ محفوظ ہوا' : 'Udhaar Record Created!',
      `${entry.direction === 'given' ? 'Lent to' : 'Borrowed from'} ${entry.contactName}: Rs. ${entry.totalAmount.toLocaleString()}${entry.syncWallet ? ' (Wallet Synced)' : ''}`
    );
  };

  // Udhaar Partial Payment with Live Wallet Integration
  const handleRecordUdhaarPayment = async (id: string, amount: number, accountId?: string) => {
    let updatedEntry: UdhaarEntry | null = null;
    const targetEntry = udhaarList.find((u) => u.id === id);
    if (!targetEntry) return;

    const chosenAcc = accountId || targetEntry.accountId || accounts[0]?.id || 'cash';
    const txId = `tx-${Date.now()}`;

    // If Maine Diya (given), receiving repayment is Income to our wallet!
    // If Maine Liya (taken), paying back debt is Expense from our wallet!
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

    // Update wallet balance
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId =
          session?.user?.id ||
          (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
        console.error('Failed to sync udhaar payment to Supabase', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'ادھار ادائیگی درج ہوئی' : 'Payment Recorded!',
      `${targetEntry.direction === 'given' ? 'Received' : 'Paid'} Rs. ${amount.toLocaleString()} via ${targetAcc?.name || 'Wallet'}`
    );
  };

  // Delete Udhaar Handler with Reversal of linked transactions
  const handleDeleteUdhaar = async (id: string) => {
    // Revert transactions tied to this udhaar
    const linkedTxs = transactions.filter((t) => t.udhaarId === id);
    if (linkedTxs.length > 0) {
      setAccounts((prev) => {
        let updated = [...prev];
        linkedTxs.forEach((tx) => {
          const revDelta = tx.type === 'income' ? -tx.amount : tx.amount;
          updated = updated.map((a) =>
            a.id === tx.account ? { ...a, balance: a.balance + revDelta } : a
          );
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

  // Projects Management Handlers
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId =
          session?.user?.id ||
          (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
      } catch (e) {
        console.error('Supabase projects insert error (offline fallback active):', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'نیا پراجیکٹ شروع ہوا' : 'Project Created!',
      `${newProj.title} sub-ledger is ready for itemized expenses.`
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
    // Also revert and remove associated project expenses & transactions
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

    showToast('info', 'Project Deleted', 'Project and its expenses have been removed.');
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

    // Master Ledger transaction
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

    // Deduct from chosen account
    const targetAcc = accounts.find((a) => a.id === item.accountId);
    const newBalance = targetAcc ? targetAcc.balance - item.amount : -item.amount;

    setAccounts((prev) =>
      prev.map((a) => (a.id === item.accountId ? { ...a, balance: newBalance } : a))
    );
    setTransactions((prev) => [newTx, ...prev]);
    setProjectExpenses((prev) => [newExpense, ...prev]);

    // Update project total spent
    setProjects((prev) =>
      prev.map((p) =>
        p.id === item.projectId ? { ...p, totalSpent: p.totalSpent + item.amount } : p
      )
    );

    if (userEmail) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId =
          session?.user?.id ||
          (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
      } catch (e) {
        console.error('Supabase project expense insert error (offline fallback active):', e);
      }
    }

    showToast(
      'success',
      lang === 'ur' ? 'پراجیکٹ خرچہ درج ہوا' : 'Project Expense Logged!',
      `Rs. ${item.amount.toLocaleString()} for ${item.subCategory} deducted from ${targetAcc?.name || 'Wallet'}`
    );
  };

  const handleDeleteProjectExpenseItem = async (id: string) => {
    const item = projectExpenses.find((e) => e.id === id);
    if (!item) return;

    // Revert account balance
    setAccounts((prev) =>
      prev.map((a) => (a.id === item.accountId ? { ...a, balance: a.balance + item.amount } : a))
    );

    // Remove linked transaction
    if (item.linkedTransactionId) {
      setTransactions((prev) => prev.filter((t) => t.id !== item.linkedTransactionId));
    }

    // Revert project total spent
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

    showToast('info', 'Expense Removed', 'Project expense removed and wallet balance restored.');
  };

  // Add Kameti
  const handleAddKameti = async (entry: Omit<KametiEntry, 'id' | 'paidMonthsCount' | 'isPayoutReceived' | 'status'>) => {
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
        const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('paisa_user_id') : null);
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
      `${entry.title} with Rs. ${entry.monthlyAmount.toLocaleString()} monthly installment`
    );
  };

  // Pay Kameti Installment
  const handlePayInstallment = async (id: string) => {
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
  };

  // Claim Kameti Payout
  const handleClaimPayout = async (id: string) => {
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
      lang === 'ur' ? 'مبارک ہو! کمیٹی وصول ہو گئی' : 'Mubarak! Kameti Payout Claimed!',
      `Rs. ${pool.toLocaleString()} received and added to your Bank Account.`
    );
  };

  // Delete Kameti Handler
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

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const delta = tx.type === 'income' ? -tx.amount : tx.amount;
    const targetAcc = accounts.find((a) => a.id === tx.account);
    const newBalance = targetAcc ? targetAcc.balance + delta : 0;

    // 1. Update local state
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account) {
          return { ...acc, balance: newBalance };
        }
        return acc;
      })
    );

    // 2. Delete from Supabase & update account balance
    if (userEmail) {
      try {
        const { error: delErr } = await supabase.from('transactions').delete().eq('id', id);
        if (delErr) {
          console.error('Supabase transaction delete error:', delErr);
        }

        if (targetAcc) {
          const { error: accErr } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', tx.account);
          if (accErr) {
            console.error('Supabase account balance update error:', accErr);
          }
        }
      } catch (e) {
        console.error('Failed to delete transaction from Supabase', e);
      }
    }

    showToast(
      'info',
      lang === 'ur' ? 'اندراج حذف ہو گیا' : 'Transaction Deleted',
      `Removed ${tx.category} (Rs. ${tx.amount.toLocaleString()})`
    );
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 animate-bounce mb-3">
          <Wallet className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">PaisaKidhar</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Checking secure login...</p>
      </div>
    );
  }

  if (!userEmail) {
    return null;
  }

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#f8fafc] text-slate-900 ${
        lang === 'ur' ? 'font-urdu' : 'font-sans'
      }`}
    >
      {/* Pop-up Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenSMSImport={() => setIsSMSOpen(true)}
        userEmail={userEmail}
        userName={userName}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardTab
            transactions={transactions}
            accounts={accounts}
            udhaarList={udhaarList}
            kametis={kametis}
            lang={lang}
            userEmail={userEmail}
            userName={userName}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenAddModal={() => setIsAddOpen(true)}
            onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
            onDeleteAccount={handleDeleteAccount}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            accounts={accounts}
            onDeleteTransaction={handleDeleteTransaction}
            lang={lang}
          />
        )}

        {currentTab === 'udhaar' && (
          <UdhaarTab
            udhaarList={udhaarList}
            accounts={accounts}
            onOpenUdhaarModal={() => setIsUdhaarOpen(true)}
            onRecordPayment={handleRecordUdhaarPayment}
            onDeleteUdhaar={handleDeleteUdhaar}
            lang={lang}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsTab
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

        {currentTab === 'kameti' && (
          <KametiTab
            kametis={kametis}
            onOpenKametiModal={() => setIsKametiOpen(true)}
            onPayInstallment={handlePayInstallment}
            onClaimPayout={handleClaimPayout}
            lang={lang}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsTab transactions={transactions} lang={lang} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Interactive Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
        lang={lang}
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
        onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
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
        onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
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
        onImportTransaction={handleAddTransaction}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(email) => {
          setUserEmail(email);
          showToast('success', 'Connected to Supabase', `Logged in as ${email}`);
        }}
        lang={lang}
      />
    </div>
  );
}
