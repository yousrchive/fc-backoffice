import { supabase } from '../lib/supabase'
import { conversationService } from './conversationService'

export const solutionService = {
  async getByConsultation(consultationId) {
    const { data, error } = await supabase
      .from('solutions')
      .select(`
        *,
        coverages(*),
        insurer_results(*, insurer_types(*)),
        final_combos(*)
      `)
      .eq('conversation_id', consultationId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(consultationId, updates, customerId, userId) {
    await conversationService.upsertToday(customerId, userId)

    const { data: existing } = await supabase
      .from('solutions')
      .select('id')
      .eq('conversation_id', consultationId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('solutions')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('solutions')
        .insert({ ...updates, conversation_id: consultationId })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  async addCoverage(solutionId, coverage) {
    const { data, error } = await supabase
      .from('coverages')
      .insert({ ...coverage, solution_id: solutionId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteCoverage(id) {
    const { error } = await supabase
      .from('coverages')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async upsertInsurerResult(solutionId, insurerTypeId, updates) {
    const { data: existing } = await supabase
      .from('insurer_results')
      .select('id')
      .eq('solution_id', solutionId)
      .eq('insurer_type_id', insurerTypeId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('insurer_results')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('insurer_results')
        .insert({ ...updates, solution_id: solutionId, insurer_type_id: insurerTypeId })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  async upsertFinalCombo(solutionId, rank, updates) {
    const { data: existing } = await supabase
      .from('final_combos')
      .select('id')
      .eq('solution_id', solutionId)
      .eq('rank', rank)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('final_combos')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('final_combos')
        .insert({ ...updates, solution_id: solutionId, rank })
        .select()
        .single()
      if (error) throw error
      return data
    }
  }
}