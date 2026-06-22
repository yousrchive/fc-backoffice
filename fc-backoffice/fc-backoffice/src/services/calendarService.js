import { supabase } from '../lib/supabase'

export const calendarService = {
  async getMonthData(userId, year, month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const [{ data: convs }, { data: alerts }] = await Promise.all([
      supabase
        .from('conversations')
        .select('talked_at, talk_count, updated_at, customers!inner(id, name, emoji, consultations(current_stage))')
        .eq('customers.user_id', userId)
        .gte('talked_at', start)
        .lt('talked_at', end)
        .order('talked_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('customer_alerts')
        .select('id, content, alert_at, is_done, stage, customers(name, emoji)')
        .eq('user_id', userId)
        .gte('alert_at', start + 'T00:00:00')
        .lt('alert_at', end + 'T00:00:00')
        .order('alert_at'),
    ])

    const byDate = {}

    // 날짜별로 고객 dedup: 같은 날 같은 고객은 가장 최근 updated_at만 유지
    const dateCustomerMap = {}
    convs?.forEach(conv => {
      const date = conv.talked_at
      const customerId = conv.customers?.id
      if (!customerId) return
      const key = `${date}__${customerId}`
      const existing = dateCustomerMap[key]
      if (!existing || new Date(conv.updated_at) > new Date(existing.updated_at)) {
        dateCustomerMap[key] = conv
      }
    })

    Object.values(dateCustomerMap).forEach(conv => {
      const date = conv.talked_at
      if (!byDate[date]) byDate[date] = { conversations: [], alerts: [] }
      byDate[date].conversations.push(conv)
    })

    // 각 날짜 내에서 updated_at 최신순 정렬
    Object.values(byDate).forEach(day => {
      day.conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    })

    alerts?.forEach(alert => {
      const date = alert.alert_at.slice(0, 10)
      if (!byDate[date]) byDate[date] = { conversations: [], alerts: [] }
      byDate[date].alerts.push(alert)
    })

    return byDate
  },

  async addSchedule(schedule) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },
}
