import { supabase } from '../lib/supabase'

export const consultationService = {

  async getStages() {
  const { data, error } = await supabase
    .from('consultation_stages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}, // 영업 단계 목록 조회 (가변성 높은 부분)

  async getByCustomer(customerId) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('customer_id', customerId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async create(customerId) {
    const { data, error } = await supabase
      .from('consultations')
      .insert({ customer_id: customerId, current_stage: '니즈환기' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateStage(id, stage) {
    const { data, error } = await supabase
      .from('consultations')
      .update({ current_stage: stage, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}