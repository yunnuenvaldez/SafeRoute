import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrfidjpnoaoqbshcbfhu.supabase.co'
const supabaseKey = 'sb_publishable_YqGjEH4dCJyh7yUWu51Tfw_Ddar5L3d'

export const supabase = createClient(supabaseUrl, supabaseKey)