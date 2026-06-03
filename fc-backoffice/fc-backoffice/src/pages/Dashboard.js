import { useState, useEffect } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const {
    today,
    scrum,
    review,
    todayStats,
    funnelStats,
    stages,
    topTemplates,
    weeklyActivity,
    loading,
    dailyGoal,
    updateScrum,
    updateReview,
    getFunnelByPeriod
  } = useDashboard()

  const [scrumForm, setScrumForm] = useState({})
  const [reviewForm, setReviewForm] = useState({})
  const [activeTab, setActiveTab] = useState('goal')
  const [isHoliday, setIsHoliday] = useState(false)

  useEffect(() => {
    if (scrum) setIsHoliday(scrum.is_holiday ?? false)
  }, [scrum])

  const handleScrumChange = (e) => {
    setScrumForm({ ...scrumForm, [e.target.name]: e.target.value })
  }

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value })
  }

  const handleScrumBlur = async () => {
    await updateScrum({ ...scrum, ...scrumForm, is_holiday: isHoliday })
  }

  const handleReviewBlur = async () => {
    await updateReview({ ...review, ...reviewForm })
  }

  const handleHolidayToggle = async () => {
    const next = !isHoliday
    setIsHoliday(next)
    await updateScrum({ ...scrum, ...scrumForm, is_holiday: next })
  }

  const scrumVal = (field) => scrumForm[field] ?? scrum?.[field] ?? ''
  const reviewVal = (field) => reviewForm[field] ?? review?.[field] ?? ''

  if (loading) return <p className="page-loading">불러오는 중...</p>

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">대시보드</h1>
          <p className="page-sub">{today}</p>
        </div>
        <button
          className={`holiday-btn ${isHoliday ? 'holiday-on' : ''}`}
          onClick={handleHolidayToggle}
        >
          {isHoliday ? '🌴 휴일' : '휴일 설정'}
        </button>
      </div>

      <div className="dash-tabs">
        {[
          { key: 'goal', label: '목표' },
          { key: 'result', label: '성과' },
          { key: 'funnel', label: '퍼널 현황' },
          { key: 'templates', label: '템플릿 반응' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`dash-tab ${activeTab === tab.key ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'goal' && (
        <div className="dash-section-wrap">
          <div className="dash-card">
            <p className="dash-card-title">오늘 목표</p>
            <div className="dash-form">
              <div className="dash-field">
                <label className="dash-label">오늘 목표 실적</label>
                <input
                  className="dash-input"
                  name="goal_performance"
                  placeholder="오늘 목표를 입력하세요"
                  value={scrumVal('goal_performance')}
                  onChange={handleScrumChange}
                  onBlur={handleScrumBlur}
                />
              </div>
              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">신규 상담 목표</label>
                  <input
                    className="dash-input"
                    name="new_consult_goal"
                    type="number"
                    placeholder="0"
                    value={scrumVal('new_consult_goal')}
                    onChange={handleScrumChange}
                    onBlur={handleScrumBlur}
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label">시뮬레이터 연습 목표</label>
                  <input
                    className="dash-input"
                    name="simulator_goal"
                    placeholder="목표를 입력하세요"
                    value={scrumVal('simulator_goal')}
                    onChange={handleScrumChange}
                    onBlur={handleScrumBlur}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <p className="dash-card-title">오늘 스크럼</p>
            <div className="dash-form">
              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">즉시 답장 필요 고객</label>
                  <input
                    className="dash-input"
                    name="immediate_customers"
                    placeholder="고객 이름"
                    value={scrumVal('immediate_customers')}
                    onChange={handleScrumChange}
                    onBlur={handleScrumBlur}
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label">예약 상담 고객</label>
                  <input
                    className="dash-input"
                    name="reserved_customers"
                    placeholder="고객 이름"
                    value={scrumVal('reserved_customers')}
                    onChange={handleScrumChange}
                    onBlur={handleScrumBlur}
                  />
                </div>
              </div>
              <div className="dash-field">
                <label className="dash-label">리터치 필요 고객</label>
                <input
                  className="dash-input"
                  name="retouch_customers"
                  placeholder="고객 이름"
                  value={scrumVal('retouch_customers')}
                  onChange={handleScrumChange}
                  onBlur={handleScrumBlur}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">업무 우선순위</label>
                <textarea
                  className="dash-textarea"
                  name="work_priority"
                  placeholder="오늘 업무 우선순위를 적어주세요"
                  value={scrumVal('work_priority')}
                  onChange={handleScrumChange}
                  onBlur={handleScrumBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">오늘 타임라인</label>
                <textarea
                  className="dash-textarea"
                  name="timeline"
                  placeholder="오늘 일정을 적어주세요"
                  value={scrumVal('timeline')}
                  onChange={handleScrumChange}
                  onBlur={handleScrumBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Plan B</label>
                <textarea
                  className="dash-textarea"
                  name="plan_b"
                  placeholder="목표 미달 시 Plan B"
                  value={scrumVal('plan_b')}
                  onChange={handleScrumChange}
                  onBlur={handleScrumBlur}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'result' && (
        <div className="dash-section-wrap">
          <div className="dash-card">
            <p className="dash-card-title">오늘 현황</p>
            {dailyGoal === 0 ? (
              <p className="dash-holiday-msg">🌴 오늘은 휴일이에요</p>
            ) : (
              <>
                <div className="goal-progress-wrap">
                  <div className="goal-progress-header">
                    <p className="goal-progress-label">상담 달성률</p>
                    <p className="goal-progress-value">
                      {todayStats.newCount + todayStats.existingCount} / {dailyGoal}명
                    </p>
                  </div>
                  <div className="goal-progress-track">
                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${Math.min(
                          Math.round(((todayStats.newCount + todayStats.existingCount) / dailyGoal) * 100),
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <p className="goal-progress-pct">
                    {Math.round(((todayStats.newCount + todayStats.existingCount) / dailyGoal) * 100)}%
                  </p>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <p className="stat-value">{todayStats.newCount}</p>
                    <p className="stat-label">신규 상담</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{todayStats.existingCount}</p>
                    <p className="stat-label">기존 상담</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{todayStats.newCount + todayStats.existingCount}</p>
                    <p className="stat-label">총 상담</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value" style={{ color: 'var(--green)' }}>{todayStats.designAgreed}</p>
                    <p className="stat-label">설계 동의</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="dash-card">
            <p className="dash-card-title">오늘 리뷰</p>
            <div className="dash-form">
              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">계약 고객 수</label>
                  <input
                    className="dash-input"
                    name="contract_count"
                    type="number"
                    placeholder="0"
                    value={reviewVal('contract_count')}
                    onChange={handleReviewChange}
                    onBlur={handleReviewBlur}
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label">총 계약 금액</label>
                  <input
                    className="dash-input"
                    name="total_contract_amount"
                    type="number"
                    placeholder="0"
                    value={reviewVal('total_contract_amount')}
                    onChange={handleReviewChange}
                    onBlur={handleReviewBlur}
                  />
                </div>
              </div>
              <div className="dash-field">
                <label className="dash-label">Keep — 계속할 것</label>
                <textarea
                  className="dash-textarea"
                  name="keep_text"
                  placeholder="오늘 유지할 행동과 결과"
                  value={reviewVal('keep_text')}
                  onChange={handleReviewChange}
                  onBlur={handleReviewBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Stop — 그만할 것</label>
                <textarea
                  className="dash-textarea"
                  name="stop_text"
                  placeholder="오늘 그만할 행동과 결과"
                  value={reviewVal('stop_text')}
                  onChange={handleReviewChange}
                  onBlur={handleReviewBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Try — 상담량 증가 가설</label>
                <textarea
                  className="dash-textarea"
                  name="try_volume"
                  placeholder="상담 시간 축소·생산성 향상 가설"
                  value={reviewVal('try_volume')}
                  onChange={handleReviewChange}
                  onBlur={handleReviewBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Try — 전환율 증가 가설</label>
                <textarea
                  className="dash-textarea"
                  name="try_conversion"
                  placeholder="부정적·무반응 케이스 기반 가설"
                  value={reviewVal('try_conversion')}
                  onChange={handleReviewChange}
                  onBlur={handleReviewBlur}
                  rows={3}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">매니저 요청사항</label>
                <textarea
                  className="dash-textarea"
                  name="manager_request"
                  placeholder="매니저에게 도움받고 싶은 부분"
                  value={reviewVal('manager_request')}
                  onChange={handleReviewChange}
                  onBlur={handleReviewBlur}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'funnel' && (
        <FunnelTab
          stages={stages}
          funnelStats={funnelStats}
          weeklyActivity={weeklyActivity}
          getFunnelByPeriod={getFunnelByPeriod}
        />
      )}

      {activeTab === 'templates' && (
        <div className="dash-section-wrap">
          <div className="dash-card">
            <p className="dash-card-title">반응 좋은 템플릿 TOP 5</p>
            {topTemplates.length === 0 ? (
              <p className="dash-empty">아직 템플릿 반응 데이터가 없어요</p>
            ) : (
              <div className="template-list">
                {topTemplates.map((t, i) => {
                  const reactions = t.template_reactions ?? []
                  const reacted = reactions.filter(r => r.reacted).length
                  const rate = reactions.length > 0
                    ? Math.round((reacted / reactions.length) * 100)
                    : 0
                  return (
                    <div key={t.id} className="template-item">
                      <div className="template-rank">{i + 1}</div>
                      <div className="template-info">
                        <p className="template-title">{t.title}</p>
                        <p className="template-meta">{t.stage} · 사용 {t.use_count}회 · 반응률 {rate}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FunnelTab({ stages, funnelStats, weeklyActivity, getFunnelByPeriod }) {
  const [periodType, setPeriodType] = useState('this_week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [prevPeriod, setPrevPeriod] = useState(null)
  const [comparing, setComparing] = useState(false)

  const getWeekRange = (offset = 0) => {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10)
    }
  }

  const loadStats = async () => {
    setComparing(true)
    try {
      let start, end, prevStart, prevEnd

      if (periodType === 'this_week') {
        const curr = getWeekRange(0)
        const prev = getWeekRange(-1)
        start = curr.start; end = curr.end
        prevStart = prev.start; prevEnd = prev.end
      } else if (periodType === 'last_week') {
        const curr = getWeekRange(-1)
        const prev = getWeekRange(-2)
        start = curr.start; end = curr.end
        prevStart = prev.start; prevEnd = prev.end
      } else {
        start = customStart; end = customEnd
        const diff = new Date(end) - new Date(start)
        const prevEndDate = new Date(new Date(start).getTime() - 86400000)
        const prevStartDate = new Date(prevEndDate.getTime() - diff)
        prevStart = prevStartDate.toISOString().slice(0, 10)
        prevEnd = prevEndDate.toISOString().slice(0, 10)
      }

      const [curr, prev] = await Promise.all([
        getFunnelByPeriod(start, end),
        getFunnelByPeriod(prevStart, prevEnd)
      ])
      setCurrentPeriod(curr)
      setPrevPeriod(prev)
    } finally {
      setComparing(false)
    }
  }

  useEffect(() => {
    if (periodType !== 'custom' && stages.length > 0) loadStats()
  }, [periodType, stages])

  const stageLabels = stages.map(s => s.label)

  return (
    <div className="dash-section-wrap">
      <div className="dash-card">
        <p className="dash-card-title">이번 주 일별 상담 현황</p>
        <div className="weekly-bars">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => {
            const date = new Date()
            const currentDay = date.getDay()
            const diff = i + 1 - (currentDay === 0 ? 7 : currentDay)
            const targetDate = new Date(date)
            targetDate.setDate(date.getDate() + diff)
            const dateStr = targetDate.toISOString().slice(0, 10)
            const count = weeklyActivity.filter(a => a.talked_at === dateStr).length
            return (
              <div key={day} className="weekly-bar-item">
                <div className="weekly-bar-fill-wrap">
                  <div
                    className="weekly-bar-fill"
                    style={{ height: `${Math.min(count * 20, 100)}%` }}
                  />
                </div>
                <p className="weekly-bar-label">{day}</p>
                <p className="weekly-bar-count">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="dash-card">
        <p className="dash-card-title">퍼널 전환율 분석</p>
        <div className="funnel-filter">
          {[
            { key: 'this_week', label: '이번 주' },
            { key: 'last_week', label: '저번 주' },
            { key: 'custom', label: '직접 설정' },
          ].map(p => (
            <button
              key={p.key}
              className={`dash-tab ${periodType === p.key ? 'dash-tab-active' : ''}`}
              onClick={() => setPeriodType(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {periodType === 'custom' && (
          <div className="funnel-custom-range">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">시작일</label>
                <input
                  className="dash-input"
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">끝일</label>
                <input
                  className="dash-input"
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
            <button className="form-btn-submit" onClick={loadStats}>조회</button>
          </div>
        )}

        {comparing && <p className="dash-empty">불러오는 중...</p>}

        {currentPeriod && prevPeriod && !comparing && (
          <div className="funnel-compare">
            <div className="funnel-compare-header">
              <div className="funnel-stage-col" />
              <div className="funnel-period-col">
                <p className="funnel-period-label">
                  {periodType === 'this_week' ? '이번 주' : periodType === 'last_week' ? '저번 주' : `${customStart} ~ ${customEnd}`}
                </p>
              </div>
              <div className="funnel-period-col">
                <p className="funnel-period-label">이전 기간</p>
              </div>
              <div className="funnel-diff-col">
                <p className="funnel-period-label">증감</p>
              </div>
            </div>

            {stageLabels.map(stage => {
              const curr = currentPeriod.counts[stage] ?? 0
              const prev = prevPeriod.counts[stage] ?? 0
              const currPct = currentPeriod.total > 0 ? Math.round((curr / currentPeriod.total) * 100) : 0
              const prevPct = prevPeriod.total > 0 ? Math.round((prev / prevPeriod.total) * 100) : 0
              const diff = curr - prev
              return (
                <div key={stage} className="funnel-compare-row">
                  <div className="funnel-stage-col">
                    <p className="funnel-stage-name">{stage}</p>
                  </div>
                  <div className="funnel-period-col">
                    <p className="funnel-count">{curr}명</p>
                    <p className="funnel-pct">{currPct}%</p>
                  </div>
                  <div className="funnel-period-col">
                    <p className="funnel-count">{prev}명</p>
                    <p className="funnel-pct">{prevPct}%</p>
                  </div>
                  <div className="funnel-diff-col">
                    <p className={`funnel-diff ${diff > 0 ? 'diff-up' : diff < 0 ? 'diff-down' : 'diff-same'}`}>
                      {diff > 0 ? `▲${diff}` : diff < 0 ? `▼${Math.abs(diff)}` : '–'}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="funnel-conversion-wrap">
              <p className="funnel-conversion-title">단계간 전환율</p>
              {Object.entries(currentPeriod.conversionRates).map(([key, rate]) => {
                const prevRate = prevPeriod.conversionRates[key] ?? 0
                const diff = rate - prevRate
                return (
                  <div key={key} className="funnel-conversion-row">
                    <p className="funnel-conversion-key">{key}</p>
                    <p className="funnel-conversion-rate">{rate}%</p>
                    <p className={`funnel-diff ${diff > 0 ? 'diff-up' : diff < 0 ? 'diff-down' : 'diff-same'}`}>
                      {diff > 0 ? `▲${diff}%p` : diff < 0 ? `▼${Math.abs(diff)}%p` : '–'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="dash-card">
        <p className="dash-card-title">전체 고객 퍼널 현황</p>
        <div className="funnel-bars">
          {stageLabels.map(stage => {
            const count = funnelStats.counts?.[stage] ?? 0
            const total = funnelStats.total ?? 1
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={stage} className="funnel-bar-row">
                <p className="funnel-bar-label">{stage}</p>
                <div className="funnel-bar-track">
                  <div className="funnel-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="funnel-bar-count">{count}명 ({pct}%)</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}