import { supabase } from './supabaseClient';

/**
 * Check if the current authenticated user has the 'admin' role
 * by querying the user_roles table in Supabase.
 * 
 * Security: The user_roles table has RLS enabled — users can only
 * read their own roles. Admin role assignment is done via SQL only.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    console.error('[adminConfig] Role check failed:', error.message);
    return false;
  }

  return !!data;
}
