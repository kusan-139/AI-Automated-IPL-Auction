import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://occofxsdzlnvfsqpkvok.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jY29meHNkemxudmZzcXBrdm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTMwMTQsImV4cCI6MjEwNDI2OTAxNH0.lyxtGVf13NyuH4a99DoNOudWHKrxXlIzoJznJikB1TY';

export const supabase = createClient(supabaseUrl, supabaseKey);
