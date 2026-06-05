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
      .eq('consultation_id', consultationId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(consultationId, updates, customerId, userId) {
    if (customerId && userId) {
      try { await conversationService.upsertToday(customerId, userId) } catch (_) {}
    }

    const { data: existing } = await supabase
      .from('solutions')
      .select('id')
      .eq('consultation_id', consultationId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('solutions')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('solutions')
        .insert({ ...updates, consultation_id: consultationId })
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    }
  },

  async addCoverage(solutionId, coverage) {
    const { data, error } = await supabase
      .from('coverages')
      .insert({ ...coverage, solution_id: solutionId })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },

  async deleteCoverage(id) {
    const { error } = await supabase.from('coverages').delete().eq('id', id)
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
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('insurer_results')
        .insert({ ...updates, solution_id: solutionId, insurer_type_id: insurerTypeId })
        .select()
        .maybeSingle()
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
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('final_combos')
        .insert({ ...updates, solution_id: solutionId, rank })
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    }
  },

  async upsertAdjustmentCombo(solutionId, updates) {
    const { data: existing } = await supabase
      .from('final_combos')
      .select('id')
      .eq('solution_id', solutionId)
      .eq('rank', 0)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('final_combos')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('final_combos')
        .insert({ ...updates, solution_id: solutionId, rank: 0 })
        .select()
        .maybeSingle()
      if (error) throw error
      return data
    }
  },

  async getCoverageTags() {
    const { data } = await supabase
      .from('coverage_tags')
      .select('*')
      .order('sort_order')
    return data ?? []
  },

  async uploadPdf(file, solutionId, comboId) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${solutionId}/${comboId}/${Date.now()}_${safeName}`
    const { error } = await supabase.storage.from('solution-pdfs').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('solution-pdfs').getPublicUrl(path)
    return data.publicUrl
  },
}
