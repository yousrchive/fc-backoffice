import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const needsService = {
  async getByConsultation(consultationId) {
    const { data, error } = await supabase
      .from('needs')
      .select('*, need_types(*)')
      .eq('conversation_id', consultationId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(consultationId, updates, customerId, userId) {
    await conversationService.upsertToday(customerId, userId)

    const existing = await this.getByConsultation(consultationId)
    if (existing) {
      const { data, error } = await supabase
        .from('needs')
        .update(updates)
        .eq('id', existing.id)
        .select('*, need_types(*)')
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('needs')
        .insert({ ...updates, conversation_id: consultationId })
        .select('*, need_types(*)')
        .single()
      if (error) throw error
      return data
    }
  }
}