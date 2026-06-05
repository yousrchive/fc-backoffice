import { supabase } from '../lib/supabase'

export const alertService = {
  async getByCustomer(customerId) {
    const { data, error } = await supabase
      .from('customer_alerts')
      .select('*')
      .eq('customer_id', customerId)
      .order('alert_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(alert) {
    const { data, error } = await supabase
      .from('customer_alerts')
      .insert(alert)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async toggleDone(id, isDone) {
    const { data, error } = await supabase
      .from('customer_alerts')
      .update({ is_done: isDone })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('customer_alerts')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // 오늘 이후 알림 (홈 화면용)
  async getUpcoming(userId) {
    const today = new Date().toISOString()
    const { data, error } = await supabase
      .from('customer_alerts')
      .select('*, customers(name, emoji)')
      .eq('user_id', userId)
      .eq('is_done', false)
      .gte('alert_at', today)
      .order('alert_at', { ascending: true })
      .limit(10)
    if (error) throw error
    return data ?? []
  }
}