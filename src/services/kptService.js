import { supabase } from '../lib/supabase'

export const kptService = {
  async getByCustomer(customerId) {
    const { data, error } = await supabase
      .from('customer_kpts')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getToday(userId) {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('customer_kpts')
      .select('*, customers(name, emoji)')
      .eq('user_id', userId)
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getAll(userId) {
    const { data, error } = await supabase
      .from('customer_kpts')
      .select('*, customers(name, emoji)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async add(customerId, userId, type, content) {
    const { data, error } = await supabase
      .from('customer_kpts')
      .insert({ customer_id: customerId, user_id: userId, type, content })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('customer_kpts').delete().eq('id', id)
    if (error) throw error
  },
}
