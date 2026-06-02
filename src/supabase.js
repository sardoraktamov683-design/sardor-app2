import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kbnkujcnbbarlpqvhjuz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtibmt1amNuYmJhcmxwcXZoanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDY2NzksImV4cCI6MjA5NTg4MjY3OX0.He-2_zu-zo-awNcRExxtzCJDfsLHHB0gsEKEMuqfRy0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
