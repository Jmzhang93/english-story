import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prkwrkabyvaaautnsgzy.supabase.co';
const supabaseKey = 'sb_publishable_XkwAu161GIpvTpjFmqa2fA_jrWeTpR-';

export const supabase = createClient(supabaseUrl, supabaseKey);