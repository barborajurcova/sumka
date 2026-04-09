import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ulnnizilqzhqcmnojrni.supabase.co' // To z horního políčka
const supabaseAnonKey = 'sb_publishable_W0YUE8VLHeW_dNyfq5zY4g_jNuYFnTZ'           // To z dolního políčka

export const supabase = createClient(supabaseUrl, supabaseAnonKey)