-- ==========================================================
-- PAISA KIDHAR (پیسہ کدھر) - DATABASE CLEANUP / WASHOUT SCRIPT
-- Run this in your Supabase SQL Editor if you ever need to clear all data:
-- https://supabase.com/dashboard/project/gsnqersjgsnlhoeildjz/sql
-- ==========================================================

-- Clear all transactions
DELETE FROM public.transactions;

-- Clear all Udhaar (Khata) records
DELETE FROM public.udhaar_entries;

-- Clear all Kameti (BC) records
DELETE FROM public.kametis;

-- Clear all Account / Wallet balances
DELETE FROM public.accounts;

-- Reset sequences if any exist
VACUUM;
