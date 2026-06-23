import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useConsultation } from '../hooks/useConsultation'
import { conversationService } from '../services/conversationService'
import NeedsSection from '../components/customer/NeedsSection'
import ProblemsSection from '../components/customer/ProblemsSection'
import SolutionSection from '../components/customer/SolutionSection'
import SubscriptionSection from '../components/customer/SubscriptionSection'
import CrmSection from '../components/customer/CrmSection'
import AlertModal from '../components/customer/AlertModal'
import KptSection from '../components/customer/KptSection'
import TemplateTracker from '../components/customer/TemplateTracker'
import UnderwritingSection from '../components/customer/UnderwritingSection'
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

  const { consultation, loading: consultationLoading, activeStages, goToStage, toast, STAGES: stageList } = useConsultation(id)
  const [activeSection, setActiveSection] = useState('전체')
  const [showAlertModal, setShowAlertModal] = useState(false)

  const fetchCustomer = useCallback(async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (data) setCustomer(data)
    setLoading(false)
  }, [id])

  const fetchTalkCount = useCallback(async () => {
    if (!user?.id) return
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('conversations')
      .select('talk_count')
      .eq('customer_id', id)
      .eq('user_id', user.id)
      .eq('talked_at', today)
      .maybeSingle()
    if (data) setTalkCount(data.talk_count ?? 0)
  }, [id, user?.id])

  useEffect(() => {
    fetchCustomer()
    fetchTalkCount()
  }, [fetchCustomer, fetchTalkCount])

  const handleTalkCount = async (delta) => {
    const next = Math.max(0, talkCount + delta)
    setTalkCount(next)
    await conversationService.upsertToday(id, user.id, { talk_count: next })
  }

  const handleStageClick = async (stage) => {
    const currentIndex = stageList.indexOf(consultation?.current_stage)
    const targetIndex = stageList.indexOf(stage)
    if (targetIndex <= currentIndex) return

    const success = await goToStage(
      stage,
      needsRef.current,
      problemsRef.current,
      solutionRef.current
    )
    if (success) setActiveSection(stage)
  }

  if (loading) return <p className="page-loading">불러오는 중...</p>
  if (!customer) return <p className="page-loading">고객을 찾을 수 없어요</p>

  return (
    <div className="detail-wrap">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate('/customers')}>← 고객 목록</button>
        <button className="alert-trigger-btn" onClick={() => setShowAlertModal(true)}>🔔 알림</button>
      </div>

      {showAlertModal && (
        <AlertModal customerId={id} onClose={() => setShowAlertModal(false)} />
      )}

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

      <KptSection customerId={id} userId={user?.id} />

      <div className="stage-tabs">
        <div
          className={`stage-tab ${activeSection === '전체' ? 'stage-tab-viewing' : 'stage-tab-inactive'}`}
          onClick={() => setActiveSection('전체')}
        >
          전체
        </div>
        {STAGES.map(stage => {
          const isActive = activeStages.includes(stage)
          const isCurrent = consultation?.current_stage === stage
          const currentIndex = stageList.indexOf(consultation?.current_stage)
          const targetIndex = stageList.indexOf(stage)
          const isNext = targetIndex === currentIndex + 1
          const isViewing = activeSection === stage

          return (
            <div
              key={stage}
              className={`stage-tab
                ${isActive ? 'stage-tab-active' : 'stage-tab-inactive'}
                ${isCurrent ? 'stage-tab-current' : ''}
                ${isNext ? 'stage-tab-next' : ''}
                ${isViewing ? 'stage-tab-viewing' : ''}
              `}
              onClick={() => {
                if (isActive) {
                  setActiveSection(stage)
                } else {
                  handleStageClick(stage)
                }
              }}
            >
              {stage}
            </div>
          )
        })}
      </div>

      <div className="consultation-sections">
        {consultationLoading ? (
          <p className="section-loading">상담 정보 불러오는 중...</p>
        ) : activeStages
          .filter(stage => activeSection === '전체' || stage === activeSection)
          .map(stage => (
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
                {stage === '청약' && (
                  <SubscriptionSection consultationId={consultation?.id} />
                )}
                {stage === '후속관리' && (
                  <CrmSection consultationId={consultation?.id} />
                )}
                <TemplateTracker
                  consultationId={consultation?.id}
                  customerId={id}
                  stage={stage}
                />
              </div>
            </div>
          ))}
      </div>

      <UnderwritingSection customerId={id} />

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}