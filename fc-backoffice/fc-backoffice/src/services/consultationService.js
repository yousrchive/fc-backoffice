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
  },

  async getByCustomer(customerId) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async create(customerId) {
    // UNIQUE(customer_id) 덕분에 중복 시 기존 행 반환
    const { error } = await supabase
      .from('consultations')
      .insert({ customer_id: customerId, current_stage: '니즈환기' })
    if (error && error.code !== '23505') throw error  // 23505 = unique violation (이미 존재)
    return await this.getByCustomer(customerId)
  },

  async updateStage(id, stage) {
    const { data, error } = await supabase
      .from('consultations')
      .update({ current_stage: stage, updated_at: new Date() })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }
}
