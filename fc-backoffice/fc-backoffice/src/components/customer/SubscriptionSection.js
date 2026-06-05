import { useState, useEffect } from 'react'
import { subscriptionService } from '../../services/subscriptionService'
import '../../styles/CheckSection.css'

const CUSTOMER_CHECKS = [
  { key: 'address', label: '주소 확인' },
  { key: 'job', label: '직업 확인' },
  { key: 'medical', label: '병력 마무리 고지' },
]

const CONTRACT_CHECKS = [
  { key: 'refund', label: '해약환급금 없다는 점 고지' },
  { key: 'coverage', label: '보장 최종 고지' },
  { key: 'renewal', label: '갱신형 보장 갱신 확인 (실손/일배책 등 해당 시)' },
]

export default function SubscriptionSection({ consultationId }) {
  const [meta, setMeta] = useState(null)
  const [customerChecks, setCustomerChecks] = useState({})
  const [contractChecks, setContractChecks] = useState({})
  const [finalProduct, setFinalProduct] = useState('')
  const [finalPremium, setFinalPremium] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!consultationId) return
    subscriptionService.getByConsultation(consultationId).then(data => {
      if (data) {
        setMeta(data)
        setCustomerChecks(data.customer_checks ?? {})
        setContractChecks(data.contract_checks ?? {})
        setFinalProduct(data.final_product ?? '')
        setFinalPremium(data.final_premium ? String(data.final_premium) : '')
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
      const data = await subscriptionService.upsert(consultationId, {
        customer_checks: customerChecks,
        contract_checks: contractChecks,
        final_product: finalProduct,
        final_premium: finalPremium ? Number(finalPremium) : null,
      })
      if (data) setMeta(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('SubscriptionSection save:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="check-wrap">
      <div className="check-group">
        <p className="section-label">고객 확인</p>
        {CUSTOMER_CHECKS.map(item => (
          <label key={item.key} className="check-item">
            <button
              className={`check-box ${customerChecks[item.key] ? 'check-box-on' : ''}`}
              onClick={() => toggle(customerChecks, setCustomerChecks, item.key)}
            >
              {customerChecks[item.key] ? '✓' : ''}
            </button>
            <span className={`check-label ${customerChecks[item.key] ? 'check-label-done' : ''}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="check-group">
        <p className="section-label">계약 확인</p>
        {CONTRACT_CHECKS.map(item => (
          <label key={item.key} className="check-item">
            <button
              className={`check-box ${contractChecks[item.key] ? 'check-box-on' : ''}`}
              onClick={() => toggle(contractChecks, setContractChecks, item.key)}
            >
              {contractChecks[item.key] ? '✓' : ''}
            </button>
            <span className={`check-label ${contractChecks[item.key] ? 'check-label-done' : ''}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="check-group">
        <p className="section-label">최종 청약</p>
        <input
          className="check-input"
          placeholder="상품명 (예: 현대해상 무배당 실손 + DB생명 종신)"
          value={finalProduct}
          onChange={e => setFinalProduct(e.target.value)}
        />
        <input
          className="check-input"
          placeholder="총 보험료 (원/월)"
          value={finalPremium}
          onChange={e => setFinalPremium(e.target.value.replace(/[^0-9]/g, ''))}
        />
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
