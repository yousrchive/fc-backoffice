import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { calendarService } from '../services/calendarService'
import '../styles/Calendar.css'

const STAGE_CLASS = {
  '니즈환기': 'cal-stage-needs',
  '문제인식': 'cal-stage-problems',
  '솔루션': 'cal-stage-solution',
  '청약': 'cal-stage-subscription',
  '후속관리': 'cal-stage-crm',
}
const DOW = ['일', '월', '화', '수', '목', '금', '토']

function getFurthestStage(consultations) {
  if (!consultations?.length) return null
  const stage = consultations[0]?.current_stage
  return stage ?? null
}

export default function Calendar() {
  const { user } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [byDate, setByDate] = useState({})
  const [loading, setLoading] = useState(false)
  const todayStr = today.toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await calendarService.getMonthData(user.id, year, month)
      setByDate(data)
    } catch (err) {
      console.error('Calendar fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, year, month])

  useEffect(() => { fetchData() }, [fetchData])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const dateStr = (d) => `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <div className="cal-page">
      {/* 헤더 */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <div className="cal-title-group">
          <h1 className="cal-title">{year}년 {month}월</h1>
          <button className="cal-today-btn" onClick={goToday}>오늘</button>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div className="cal-grid">
        {DOW.map(d => (
          <div key={d} className={`cal-dow ${d === '일' ? 'cal-dow-sun' : d === '토' ? 'cal-dow-sat' : ''}`}>
            {d}
          </div>
        ))}

        {/* 날짜 셀 */}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="cal-cell cal-cell-empty" />

          const ds = dateStr(day)
          const dayData = byDate[ds] ?? { conversations: [], alerts: [] }
          const dow = (firstDay + day - 1) % 7
          const isToday = ds === todayStr
          const isPast = ds < todayStr
          const isSun = dow === 0
          const isSat = dow === 6

          return (
            <div
              key={ds}
              className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${isPast ? 'cal-cell-past' : ''}`}
            >
              <p className={`cal-date-num ${isSun ? 'cal-sun' : isSat ? 'cal-sat' : ''}`}>
                {day}
              </p>

              <div className="cal-entries">
                {/* 대화 고객 */}
                {dayData.conversations.map((conv, i) => {
                  const customer = conv.customers
                  const stage = getFurthestStage(customer?.consultations)
                  return (
                    <div key={i} className="cal-customer-entry">
                      <span className="cal-emoji">{customer?.emoji}</span>
                      <span className="cal-cust-name">{customer?.name}</span>
                      {stage && (
                        <span className={`cal-stage-chip ${STAGE_CLASS[stage] ?? ''}`}>
                          {stage}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* 알림 */}
                {dayData.alerts.map((alert, i) => (
                  <div key={`alert-${i}`} className={`cal-alert-entry ${alert.is_done ? 'cal-alert-done' : ''}`}>
                    <span className="cal-alert-bell">{alert.is_done ? '✓' : '🔔'}</span>
                    <span className="cal-alert-text">{alert.content}</span>
                    {alert.stage && <span className="cal-alert-stage">{alert.stage}</span>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {loading && <p className="cal-loading">불러오는 중...</p>}
    </div>
  )
}
