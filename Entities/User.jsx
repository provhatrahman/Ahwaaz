import { supabase } from '../integrations/Core.js';

export class User {
  static async me() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('Not authenticated');

      // Get additional user data from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        role: profile?.role || 'user',
        liked_artists: profile?.liked_artists || [],
        ...profile
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  static async login() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/map`
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  static async updateMyUserData(updates) {
    try {
      const user = await this.me();
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}