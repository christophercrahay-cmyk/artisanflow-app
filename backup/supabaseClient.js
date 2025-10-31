import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://upihalivqstavxijlwaj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
