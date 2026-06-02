import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useConsultation } from '../hooks/useConsultation'
import NeedsSection from '../components/customer/NeedsSection'
import '../styles/CustomerDetail.css'

const STAGES = ['니즈환기', '문제인식', '솔루션', '청약', '후속관리']

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const { consultation, activeStages, advanceStage } = useConsultation(id)

  const fetchCustomer = useCallback(async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setCustomer(data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  if (loading) return <p className="page-loading">불러오는 중...</p>
  if (!customer) return <p className="page-loading">고객을 찾을 수 없어요</p>

  return (
    <div className="detail-wrap">
      <button className="back-btn" onClick={() => navigate('/customers')}>← 고객 목록</button>

      <div className="detail-header">
        <div className="detail-avatar">{customer.emoji}</div>
        <div className="detail-info">
          <h1 className="detail-name">{customer.name}</h1>
          <p className="detail-meta">{customer.room_code} · 대화 시작 {customer.started_at}</p>
          {customer.birth_date && <p className="detail-meta">생년월일 {customer.birth_date}</p>}
        </div>
      </div>

      <div className="stage-tabs">
        {STAGES.map(stage => {
          const isActive = activeStages.includes(stage)
          const isCurrent = consultation?.current_stage === stage
          return (
            <div
              key={stage}
              className={`stage-tab ${isActive ? 'stage-tab-active' : 'stage-tab-inactive'} ${isCurrent ? 'stage-tab-current' : ''}`}
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
                    />
                  )}
              {stage === '문제인식' && <div className="coming-soon">문제인식 섹션 준비 중</div>}
              {stage === '솔루션' && <div className="coming-soon">솔루션 섹션 준비 중</div>}
              {stage === '청약' && <div className="coming-soon">청약 섹션 준비 중</div>}
              {stage === '후속관리' && <div className="coming-soon">후속관리 섹션 준비 중</div>}
            </div>
          </div>
        ))}
      </div>

      {consultation?.current_stage !== '후속관리' && (
        <button className="advance-btn" onClick={advanceStage}>
          + {STAGES[STAGES.indexOf(consultation?.current_stage) + 1]} 단계 추가
        </button>
      )}
    </div>
  )
}