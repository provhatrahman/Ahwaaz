import { supabase } from '../integrations/Core.js';

export class Artist {
  static async create(artistData) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .insert([{
          ...artistData,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating artist:', error);
      throw error;
    }
  }

  static async get(id) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting artist:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .update({
          ...updates,
          updated_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  }

  static async list(orderBy = '-created_date') {
    try {
      let query = supabase
        .from('artists')
        .select('*')
        .eq('is_published', true);

      // Handle ordering
      if (orderBy.startsWith('-')) {
        const field = orderBy.substring(1);
        query = query.order(field, { ascending: false });
      } else {
        query = query.order(orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing artists:', error);
      throw error;
    }
  }

  static async getMyArtists() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting my artists:', error);
      throw error;
    }
  }

  static async publish(id) {
    try {
      return await this.update(id, { is_published: true });
    } catch (error) {
      console.error('Error publishing artist:', error);
      throw error;
    }
  }

  static async unpublish(id) {
    try {
      return await this.update(id, { is_published: false });
    } catch (error) {
      console.error('Error unpublishing artist:', error);
      throw error;
    }
  }
}