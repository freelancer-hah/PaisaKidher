import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://gsnqersjgsnlhoeildjz.supabase.co';
const supabaseAnonKey = 'sb_publishable_1tYpX_ptuyFBXonhcHIXyA_v1hVwMdd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

