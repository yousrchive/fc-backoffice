import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const customerService = {

  async getAll(userId) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      conversations(talked_at),
      consultations(current_stage)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
},

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    if (error) throw error

    await conversationService.upsertToday(data.id, customer.user_id)

    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}