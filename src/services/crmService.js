import { supabase } from '../lib/supabase'

export const crmService = {
  async getByConsultation(consultationId) {
    const { data } = await supabase
      .from('crm_meta')
      .select('*')
      .eq('consultation_id', consultationId)
      .maybeSingle()
    return data
  },

  async upsert(consultationId, updates) {
    const { data: existing } = await supabase
      .from('crm_meta')
      .select('id')
      .eq('consultation_id', consultationId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('crm_meta')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', existing.id)
        .select().maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('crm_meta')
        .insert({ ...updates, consultation_id: consultationId })
        .select().maybeSingle()
      if (error) throw error
      return data
    }
  },
}
