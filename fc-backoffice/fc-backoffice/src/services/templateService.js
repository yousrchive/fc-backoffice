import { supabase } from '../lib/supabase'

export const templateService = {
  // 템플릿 목록
  async getAll(userId) {
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      template_reactions(reacted),
      template_histories(id, changed_at)
    `)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })
  if (error) throw error

  // 프로필 별도 조회
  const userIds = [...new Set(data?.map(t => t.user_id) ?? [])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds)

  return data?.map(t => ({
    ...t,
    profiles: profiles?.find(p => p.id === t.user_id) ?? null
  })) ?? []
},

async getByStage(userId, stage) {
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      template_reactions(reacted)
    `)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .eq('stage', stage)
    .order('use_count', { ascending: false })
  if (error) throw error

  const userIds = [...new Set(data?.map(t => t.user_id) ?? [])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds)

  return data?.map(t => ({
    ...t,
    profiles: profiles?.find(p => p.id === t.user_id) ?? null
  })) ?? []
},

  // 템플릿 생성
  async create(userId, template) {
    const { data, error } = await supabase
      .from('templates')
      .insert({ ...template, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 템플릿 수정 (이력 쌓기)
  async update(id, updates, oldContent) {
    // 수정 이력 저장
    await supabase
      .from('template_histories')
      .insert({ template_id: id, content: oldContent })

    const { data, error } = await supabase
      .from('templates')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 템플릿 삭제
  async delete(id) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // 수정 이력
  async getHistories(templateId) {
    const { data, error } = await supabase
      .from('template_histories')
      .select('*')
      .eq('template_id', templateId)
      .order('changed_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // 고객별 커스터마이징 가져오기
  async getCustomerTemplate(customerId, templateId) {
    const { data } = await supabase
      .from('customer_templates')
      .select('*')
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .maybeSingle()
    return data
  },

  // 고객별 커스터마이징 저장
  async upsertCustomerTemplate(customerId, templateId, consultationId, stage, updates) {
    const existing = await this.getCustomerTemplate(customerId, templateId)

    if (existing) {
      const { data, error } = await supabase
        .from('customer_templates')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('customer_templates')
        .insert({
          customer_id: customerId,
          template_id: templateId,
          consultation_id: consultationId,
          stage,
          ...updates
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // 반응 기록
  async recordReaction(templateId, conversationId, stage, reacted) {
    const { data, error } = await supabase
      .from('template_reactions')
      .insert({ template_id: templateId, consultation_id: conversationId, stage, reacted })
      .select()
      .single()
    if (error) throw error

    // use_count 업데이트
    await supabase.rpc('increment_use_count', { template_id: templateId })

    return data
  }
}