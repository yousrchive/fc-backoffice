import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const problemsService = {
  async getByConsultation(consultationId) {
    const { data, error } = await supabase
      .from('problems')
      .select('*, problem_types(*)')
      .eq('consultation_id', consultationId)
    if (error) throw error
    return data ?? []
  },

  async toggle(consultationId, problemTypeId, customerId, userId) {
    await conversationService.upsertToday(customerId, userId)

    const { data: existing } = await supabase
      .from('problems')
      .select('*')
      .eq('consultation_id', consultationId)
      .eq('problem_type_id', problemTypeId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('problems').delete().eq('id', existing.id)
      if (error) throw error
      return false
    } else {
      const { error } = await supabase
        .from('problems')
        .insert({ consultation_id: consultationId, problem_type_id: problemTypeId })
      if (error) throw error
      return true
    }
  },

  async getSummary(consultationId) {
    const { data } = await supabase
      .from('problem_summaries')
      .select('*')
      .eq('consultation_id', consultationId)
      .maybeSingle()
    return data
  },

  async upsertSummary(consultationId, updates) {
    const { data: existing } = await supabase
      .from('problem_summaries')
      .select('id')
      .eq('consultation_id', consultationId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('problem_summaries')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('problem_summaries')
        .insert({ ...updates, consultation_id: consultationId })
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    }
  },

  async getProblemInsurances(consultationId) {
    const { data } = await supabase
      .from('problem_insurances')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at')
    return data ?? []
  },

  async addProblemInsurance(consultationId, name) {
    const { data, error } = await supabase
      .from('problem_insurances')
      .insert({ consultation_id: consultationId, name })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },

  async deleteProblemInsurance(id) {
    const { error } = await supabase.from('problem_insurances').delete().eq('id', id)
    if (error) throw error
  },

  async updateProblemInsurance(id, updates) {
    const { data, error } = await supabase
      .from('problem_insurances')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },
}
