import { useState, useEffect } from 'react'
import { crmService } from '../../services/crmService'
import '../../styles/CheckSection.css'

const FOLLOWUP_CHECKS = [
  { key: 'special_delete', label: '특약 삭제 완료' },
]

const HAPPYCALL_CHECKS = [
  { key: 'cancel_3months', label: '안내에 하자가 있을 때 3개월 안에 계약취소 가능' },
  { key: 'withdrawal', label: '청약철회: 보험증권 받은 날로부터 15일 이내 / 청약일로부터 30일 이내' },
  { key: 'risk_change', label: '직업·직무·보험목적물 변경 등 위험 변경 시 통지 의무' },
  { key: 'claim_3years', label: '보험금 청구권 소멸시효 3년 (지급절차/지급제한사유 포함 안내)' },
]

export default function CrmSection({ consultationId }) {
  const [followupChecks, setFollowupChecks] = useState({})
  const [happycallChecks, setHappycallChecks] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!consultationId) return
    crmService.getByConsultation(consultationId).then(data => {
      if (data) {
        setFollowupChecks(data.followup_checks ?? {})
        setHappycallChecks(data.happycall_checks ?? {})
      }
    }).catch(console.error)
  }, [consultationId])

  const toggle = (checks, setChecks, key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!consultationId) return
    setSaving(true)
    setSaved(false)
    try {
      await crmService.upsert(consultationId, {
        followup_checks: followupChecks,
        happycall_checks: happycallChecks,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('CrmSection save:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="check-wrap">
      <div className="check-group">
        <p className="section-label">후속 정리</p>
        {FOLLOWUP_CHECKS.map(item => (
          <label key={item.key} className="check-item">
            <button
              className={`check-box ${followupChecks[item.key] ? 'check-box-on' : ''}`}
              onClick={() => toggle(followupChecks, setFollowupChecks, item.key)}
            >
              {followupChecks[item.key] ? '✓' : ''}
            </button>
            <span className={`check-label ${followupChecks[item.key] ? 'check-label-done' : ''}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="check-group">
        <p className="section-label">해피콜 안내 체크</p>
        {HAPPYCALL_CHECKS.map(item => (
          <label key={item.key} className="check-item">
            <button
              className={`check-box ${happycallChecks[item.key] ? 'check-box-on' : ''}`}
              onClick={() => toggle(happycallChecks, setHappycallChecks, item.key)}
            >
              {happycallChecks[item.key] ? '✓' : ''}
            </button>
            <span className={`check-label ${happycallChecks[item.key] ? 'check-label-done' : ''}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="section-save-row">
        {saved && <span className="section-saved">저장됨 ✓</span>}
        <button className="section-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
