import { createClient } from '@supabase/supabase-js';

// Placeholder for future Supabase integration
// When ready, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock helper to simulate database interactions if needed
export const mockDb = {
    from: (_table: string) => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: <T>(data: T) => Promise.resolve({ data, error: null }),
        update: <T>(data: T) => Promise.resolve({ data, error: null }),
        delete: () => Promise.resolve({ error: null }),
    })
};
