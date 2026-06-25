import { supabase } from '../lib/supabase'

export const underwritingService = {
  async getByCustomer(customerId) {
    const { data, error } = await supabase
      .from('underwritings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(customerId, fields) {
    const { data, error } = await supabase
      .from('underwritings')
      .insert({ customer_id: customerId, ...fields })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('underwritings')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('underwritings')
      .select('*, customers(id, name, emoji)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async delete(id) {
    const { error } = await supabase
      .from('underwritings')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
