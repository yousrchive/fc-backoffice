import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/dashboardService'

export function useDashboard() {
  const { user } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  const [scrum, setScrum] = useState(null)
  const [review, setReview] = useState(null)
  const [todayStats, setTodayStats] = useState({ newCount: 0, existingCount: 0, designAgreed: 0 })
  const [funnelStats, setFunnelStats] = useState({ counts: {}, total: 0 })
  const [stages, setStages] = useState([])
  const [topTemplates, setTopTemplates] = useState([])
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const getWeekRange = () => {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10)
    }
  }

  const getDailyGoal = () => {
    const dayOfWeek = new Date().getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = scrum?.is_holiday ?? false
    if (isWeekend || isHoliday) return 0
    return scrum?.new_consult_goal || 8
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getWeekRange()

      // 스테이지 먼저 가져오기
      const stagesData = await dashboardService.getStages()
      setStages(stagesData)

      const [scrumData, reviewData, todayStatsData, funnelData, templatesData, weeklyData] =
        await Promise.all([
          dashboardService.getScrum(user.id, today),
          dashboardService.getReview(user.id, today),
          dashboardService.getTodayStats(user.id, today),
          dashboardService.getFunnelStats(user.id, stagesData),
          dashboardService.getTopTemplates(user.id),
          dashboardService.getWeeklyActivity(user.id, start, end)
        ])

      setScrum(scrumData)
      setReview(reviewData)
      setTodayStats(todayStatsData)
      setFunnelStats(funnelData)
      setTopTemplates(templatesData)
      setWeeklyActivity(weeklyData)
    } finally {
      setLoading(false)
    }
  }, [user, today])

  useEffect(() => {
    if (user) fetchAll()
  }, [user, fetchAll])

  const updateScrum = async (updates) => {
    const data = await dashboardService.upsertScrum(user.id, today, updates)
    setScrum(data)
  }

  const updateReview = async (updates) => {
    const data = await dashboardService.upsertReview(user.id, today, updates)
    setReview(data)
  }

  const getFunnelByPeriod = useCallback(async (startDate, endDate) => {
    return await dashboardService.getFunnelStatsByPeriod(user.id, startDate, endDate, stages)
  }, [user, stages])

  return {
    today,
    scrum,
    review,
    todayStats,
    funnelStats,
    stages,
    topTemplates,
    weeklyActivity,
    loading,
    dailyGoal: getDailyGoal(),
    updateScrum,
    updateReview,
    getFunnelByPeriod,
    fetchAll
  }
}