import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const needsService = {
  async getByConsultation(consultationId) {
    const { data, error } = await supabase
      .from('needs')
      .select('*')
      .eq('consultation_id', consultationId)
      .maybeSingle()
    if (error) {
      console.error('[needsService] getByConsultation:', error)
      throw error
    }
    return data
  },

  async upsert(consultationId, updates, customerId, userId) {
    try { await conversationService.upsertToday(customerId, userId) } catch (_) {}

    const existing = await this.getByConsultation(consultationId)
    if (existing) {
      const { data, error } = await supabase
        .from('needs')
        .update(updates)
        .eq('id', existing.id)
        .select('*')
        .maybeSingle()
      if (error) {
        console.error('[needsService] update:', error)
        throw error
      }
      return data
    } else {
      const { data, error } = await supabase
        .from('needs')
        .insert({ ...updates, consultation_id: consultationId })
        .select('*')
        .maybeSingle()
      if (error) {
        console.error('[needsService] insert:', error)
        throw error
      }
      return data
    }
  }
}