import { supabase } from '../lib/supabase'

export const conversationService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('talked_at', { ascending: false })
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  },

  async upsertToday(customerId, userId) {
    const today = new Date().toISOString().slice(0, 10)

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', userId)
      .eq('talked_at', today)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ customer_id: customerId, user_id: userId, talked_at: today })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}