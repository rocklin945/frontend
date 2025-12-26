import { createClient } from '@supabase/supabase-js';

// 在实际应用中，这些值应该来自环境变量
const supabaseUrl = 'https://goclhpjgviyhppasdlfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2xocGpndml5aHBwYXNkbGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDEzNjgsImV4cCI6MjA4MTk3NzM2OH0.l3Ev7rnwq_ZSfFNYYAvj2NkrMSNx2hAVwKwuUf8X85k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);