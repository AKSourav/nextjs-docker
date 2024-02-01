import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://awodtprepqwqtnacnfrg.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;