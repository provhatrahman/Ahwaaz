import { supabase } from '../integrations/Core.js';

export class Feedback {
  static async create(feedbackData) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...feedbackData,
          created_date: new Date().toISOString(),
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  static async get(id) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('feedback')
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
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  static async list(orderBy = '-created_date') {
    try {
      let query = supabase.from('feedback').select('*');

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
      console.error('Error listing feedback:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
}