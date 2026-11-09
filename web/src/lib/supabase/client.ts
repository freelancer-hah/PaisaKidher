import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsnqersjgsnlhoeildjz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1tYpX_ptuyFBXonhcHIXyA_v1hVwMdd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
