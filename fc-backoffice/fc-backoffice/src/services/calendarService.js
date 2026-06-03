import { supabase } from '../lib/supabase'

export const calendarService = {
  async getConversationsByMonth(userId, year, month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${year}-${String(month + 1).padStart(2, '0')}-01`

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customers(id, name, emoji)
      `)
      .eq('user_id', userId)
      .gte('talked_at', start)
      .lt('talked_at', end)
      .order('talked_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getSchedulesByMonth(userId, year, month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${year}-${String(month + 1).padStart(2, '0')}-01`

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        customers(id, name, emoji)
      `)
      .eq('user_id', userId)
      .gte('scheduled_at', start)
      .lt('scheduled_at', end)
      .order('scheduled_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async addSchedule(schedule) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateScheduleStatus(id, status) {
    const { data, error } = await supabase
      .from('schedules')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}