import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hfunnjobceqhcztoffka.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdW5uam9iY2VxaGN6dG9mZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTc2NzEsImV4cCI6MjA2ODIzMzY3MX0.Xs7YnnxVCb0RNKiTAGn3dve2Mxvu8DNdweHzSMe9_W4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)