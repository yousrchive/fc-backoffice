import { supabase } from '../lib/supabase'

export const dashboardService = {
  // 스크럼
  async getScrum(userId, date) {
    const { data } = await supabase
      .from('daily_scrums')
      .select('*')
      .eq('user_id', userId)
      .eq('scrum_date', date)
      .maybeSingle()
    return data
  },

  async upsertScrum(userId, date, updates) {
    const { data, error } = await supabase
      .from('daily_scrums')
      .upsert(
        { ...updates, user_id: userId, scrum_date: date, updated_at: new Date() },
        { onConflict: 'user_id,scrum_date' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 리뷰
  async getReview(userId, date) {
    const { data } = await supabase
      .from('daily_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('review_date', date)
      .maybeSingle()
    return data
  },

  async upsertReview(userId, date, updates) {
    const { data, error } = await supabase
      .from('daily_reviews')
      .upsert(
        { ...updates, user_id: userId, review_date: date, updated_at: new Date() },
        { onConflict: 'user_id,review_date' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 오늘 통계
  async getTodayStats(userId, date) {
    const { data: convs } = await supabase
      .from('conversations')
      .select('*, customers(started_at, is_closed)')
      .eq('user_id', userId)
      .eq('talked_at', date)

    const newCount = convs?.filter(c => c.customers?.started_at === date).length ?? 0
    const existingCount = convs?.filter(c => c.customers?.started_at !== date).length ?? 0
    const designAgreed = convs?.filter(c => c.design_agreed).length ?? 0

    return { newCount, existingCount, designAgreed }
  },

  // 스테이지 마스터
  async getStages() {
    const { data, error } = await supabase
      .from('consultation_stages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data ?? []
  },

  // 전체 퍼널 현황 (현재 단계 기준)
  async getFunnelStats(userId, stages) {
    const { data, error } = await supabase
      .from('consultations')
      .select('current_stage, customers!inner(user_id)')
      .eq('customers.user_id', userId)
    if (error) throw error

    const stageLabels = stages.map(s => s.label)
    const counts = {}
    stageLabels.forEach(s => counts[s] = 0)
    data?.forEach(d => {
      if (counts[d.current_stage] !== undefined) counts[d.current_stage]++
    })
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return { counts, total }
  },

  // 기간별 퍼널 현황 + 전환율
  async getFunnelStatsByPeriod(userId, startDate, endDate, stages) {
    const { data, error } = await supabase
      .from('consultations')
      .select('current_stage, updated_at, customers!inner(user_id)')
      .eq('customers.user_id', userId)
      .gte('updated_at', startDate)
      .lte('updated_at', endDate + 'T23:59:59')
    if (error) throw error

    const stageLabels = stages.map(s => s.label)
    const counts = {}
    stageLabels.forEach(s => counts[s] = 0)
    data?.forEach(d => {
      if (counts[d.current_stage] !== undefined) counts[d.current_stage]++
    })

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    const conversionRates = {}
    for (let i = 0; i < stageLabels.length - 1; i++) {
      const from = stageLabels[i]
      const to = stageLabels[i + 1]
      const fromTotal = stageLabels.slice(i).reduce((acc, s) => acc + (counts[s] ?? 0), 0)
      const toTotal = stageLabels.slice(i + 1).reduce((acc, s) => acc + (counts[s] ?? 0), 0)
      conversionRates[`${from}→${to}`] = fromTotal > 0
        ? Math.round((toTotal / fromTotal) * 100)
        : 0
    }

    return { counts, total, conversionRates }
  },

  // 주간 활동
  async getWeeklyActivity(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('conversations')
      .select('talked_at, customer_id, talk_count, design_agreed')
      .eq('user_id', userId)
      .gte('talked_at', startDate)
      .lte('talked_at', endDate)
      .order('talked_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  // 주간 리뷰 목록
  async getWeeklyReviews(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_reviews')
      .select('*')
      .eq('user_id', userId)
      .gte('review_date', startDate)
      .lte('review_date', endDate)
    if (error) throw error
    return data ?? []
  },

  // 주간 스크럼 목록 (휴일 제외용)
  async getWeeklyScrums(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_scrums')
      .select('*')
      .eq('user_id', userId)
      .gte('scrum_date', startDate)
      .lte('scrum_date', endDate)
    if (error) throw error
    return data ?? []
  },

  // 가장 많이 대화한 고객
  async getMostActiveCustomer(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('conversations')
      .select('customer_id, talk_count, design_agreed, customers(name, emoji)')
      .eq('user_id', userId)
      .gte('talked_at', startDate)
      .lte('talked_at', endDate)
    if (error) throw error

    if (!data || data.length === 0) return null

    const customerMap = {}
    data.forEach(conv => {
      if (!customerMap[conv.customer_id]) {
        customerMap[conv.customer_id] = {
          customer_id: conv.customer_id,
          name: conv.customers?.name,
          emoji: conv.customers?.emoji,
          total_talk: 0,
          design_agreed: false
        }
      }
      customerMap[conv.customer_id].total_talk += conv.talk_count ?? 0
      if (conv.design_agreed) customerMap[conv.customer_id].design_agreed = true
    })

    return Object.values(customerMap).sort((a, b) => b.total_talk - a.total_talk)[0]
  },

  // 반응 좋은 템플릿
  async getTopTemplates(userId, limit = 5) {
    const { data, error } = await supabase
      .from('templates')
      .select('*, template_reactions(reacted)')
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order('use_count', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  }
}