import { supabase } from '../integrations/Core.jsx';

export class Report {
  static async create(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          ...reportData,
          created_date: new Date().toISOString(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  static async get(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('reports')
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
      console.error('Error updating report:', error);
      throw error;
    }
  }

  static async list(orderBy = '-created_date') {
    try {
      let query = supabase.from('reports').select('*');

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
      console.error('Error listing reports:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
}