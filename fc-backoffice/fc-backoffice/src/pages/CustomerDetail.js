import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useConsultation } from '../hooks/useConsultation'
import { conversationService } from '../services/conversationService'
import NeedsSection from '../components/customer/NeedsSection'
import ProblemsSection from '../components/customer/ProblemsSection'
import SolutionSection from '../components/customer/SolutionSection'
import '../styles/CustomerDetail.css'

const STAGES = ['니즈환기', '문제인식', '솔루션', '청약', '후속관리']

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [talkCount, setTalkCount] = useState(0)
  const needsRef = useRef(null)
  const problemsRef = useRef(null)
  const solutionRef = useRef(null)

  const { consultation, activeStages, goToStage, toast, STAGES: stageList } = useConsultation(id)

  const fetchCustomer = useCallback(async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setCustomer(data)
    setLoading(false)
  }, [id])

  const fetchTalkCount = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('conversations')
      .select('talk_count')
      .eq('customer_id', id)
      .eq('talked_at', today)
      .maybeSingle()
    if (data) setTalkCount(data.talk_count ?? 0)
  }, [id])

  useEffect(() => {
    fetchCustomer()
    fetchTalkCount()
  }, [fetchCustomer, fetchTalkCount])

  const handleTalkCount = async (delta) => {
    const next = Math.max(0, talkCount + delta)
    setTalkCount(next)
    const conv = await conversationService.upsertToday(id, user.id)
    await supabase
      .from('conversations')
      .update({ talk_count: next })
      .eq('id', conv.id)
  }

  const handleStageClick = (stage) => {
    const currentIndex = stageList.indexOf(consultation?.current_stage)
    const targetIndex = stageList.indexOf(stage)
    if (targetIndex <= currentIndex) return

    goToStage(
      stage,
      needsRef.current,
      problemsRef.current,
      solutionRef.current
    )
  }

  if (loading) return <p className="page-loading">불러오는 중...</p>
  if (!customer) return <p className="page-loading">고객을 찾을 수 없어요</p>

  return (
    <div className="detail-wrap">
      <button className="back-btn" onClick={() => navigate('/customers')}>← 고객 목록</button>

      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-avatar">{customer.emoji}</div>
          <div className="detail-info">
            <h1 className="detail-name">{customer.name}</h1>
            <p className="detail-meta">{customer.room_code}</p>
            <p className="detail-meta">대화 시작 {customer.started_at}</p>
            {customer.birth_date && <p className="detail-meta">생년월일 {customer.birth_date}</p>}
            {customer.phone && <p className="detail-meta">{customer.phone}</p>}
          </div>
        </div>
      </div>

      <div className="talk-count-wrap">
        <div className="talk-count-left">
          <p className="talk-count-label">대화 횟수</p>
          <p className="talk-count-hint">고객과 유의한 티키타카 횟수를 기록해주세요.</p>
        </div>
        <div className="talk-count-ctrl">
          <button className="talk-btn" onClick={() => handleTalkCount(-1)}>−</button>
          <span className="talk-num">{talkCount}</span>
          <button className="talk-btn" onClick={() => handleTalkCount(1)}>+</button>
        </div>
      </div>

      <div className="stage-tabs">
        {STAGES.map(stage => {
          const isActive = activeStages.includes(stage)
          const isCurrent = consultation?.current_stage === stage
          const currentIndex = stageList.indexOf(consultation?.current_stage)
          const targetIndex = stageList.indexOf(stage)
          const isNext = targetIndex === currentIndex + 1

          return (
            <div
              key={stage}
              className={`stage-tab ${isActive ? 'stage-tab-active' : 'stage-tab-inactive'} ${isCurrent ? 'stage-tab-current' : ''} ${isNext ? 'stage-tab-next' : ''}`}
              onClick={() => handleStageClick(stage)}
            >
              {stage}
            </div>
          )
        })}
      </div>

      <div className="consultation-sections">
        {activeStages.map(stage => (
          <div key={stage} className="consultation-section">
            <div className="section-header">
              <h2 className="section-title">{stage}</h2>
            </div>
            <div className="section-content">
              {stage === '니즈환기' && (
                <NeedsSection
                  consultationId={consultation?.id}
                  customerId={id}
                  userId={user?.id}
                  onDataChange={(data) => { needsRef.current = data }}
                />
              )}
              {stage === '문제인식' && (
                <ProblemsSection
                  consultationId={consultation?.id}
                  customerId={id}
                  userId={user?.id}
                  onDataChange={(data) => { problemsRef.current = data }}
                />
              )}
              {stage === '솔루션' && (
                <SolutionSection
                  consultationId={consultation?.id}
                  customerId={id}
                  userId={user?.id}
                  onDataChange={(data) => { solutionRef.current = data }}
                />
              )}
              {stage === '청약' && <div className="coming-soon">청약 섹션 준비 중</div>}
              {stage === '후속관리' && <div className="coming-soon">후속관리 섹션 준비 중</div>}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}