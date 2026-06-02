import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const problemsService = {
  async getByConsultation(consultationId) {
    const { data, error } = await supabase
      .from('problems')
      .select('*, problem_types(*)')
      .eq('conversation_id', consultationId)
    if (error) throw error
    return data ?? []
  },

  async toggle(consultationId, problemTypeId, customerId, userId) {
    await conversationService.upsertToday(customerId, userId)

    const { data: existing } = await supabase
      .from('problems')
      .select('*')
      .eq('conversation_id', consultationId)
      .eq('problem_type_id', problemTypeId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', existing.id)
      if (error) throw error
      return false
    } else {
      const { error } = await supabase
        .from('problems')
        .insert({ conversation_id: consultationId, problem_type_id: problemTypeId })
      if (error) throw error
      return true
    }
  }
}