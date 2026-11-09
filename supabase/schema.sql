-- ==========================================================
-- PAISA KIDHAR (پیسہ کدھر) - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gsnqersjgsnlhoeildjz/sql
-- ==========================================================

-- 1. PROFILES / USERS TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  language text default 'en',
  currency text default 'PKR',
  month_start_day integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view and update own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- 2. ACCOUNTS / WALLETS TABLE (Cash, JazzCash, Easypaisa, Banks)
create table if not exists public.accounts (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  name_urdu text,
  type text not null, -- 'cash', 'jazzcash', 'easypaisa', 'bank', 'sadapay'
  balance numeric not null default 0,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.accounts enable row level security;

create policy "Users can manage own accounts"
  on public.accounts for all
  using (auth.uid() = user_id or user_id is null);

-- 3. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  type text not null check (type in ('expense', 'income')),
  amount numeric not null,
  category text not null,
  account text not null, -- 'cash', 'jazzcash', 'easypaisa', 'bank', etc.
  note text,
  date date not null default current_date,
  source text default 'manual', -- 'manual', 'voice', 'sms'
  external_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id or user_id is null);

-- 4. UDHAAR (KHATA) TABLE (Lend & Borrow)
create table if not exists public.udhaar_entries (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  contact_name text not null,
  contact_phone text,
  direction text not null check (direction in ('given', 'taken')), -- 'given' = Lena hai, 'taken' = Dena hai
  total_amount numeric not null,
  paid_amount numeric not null default 0,
  due_date date,
  note text,
  status text not null default 'pending' check (status in ('pending', 'partially_paid', 'settled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.udhaar_entries enable row level security;

create policy "Users can manage own udhaar records"
  on public.udhaar_entries for all
  using (auth.uid() = user_id or user_id is null);

-- 5. KAMETI (BC / ROSCA) TABLE
create table if not exists public.kametis (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  monthly_amount numeric not null,
  total_members integer not null,
  current_month integer not null default 1,
  my_turn_month integer not null,
  start_date date not null default current_date,
  paid_months_count integer not null default 1,
  is_payout_received boolean not null default false,
  status text not null default 'active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.kametis enable row level security;

create policy "Users can manage own kametis"
  on public.kametis for all
  using (auth.uid() = user_id or user_id is null);
