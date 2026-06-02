import { useState, useEffect } from 'react'
import { useNeeds } from '../../hooks/useNeeds'
import '../../styles/NeedsSection.css'

export default function NeedsSection({ consultationId, customerId, userId }) {
  const { needs, needTypes, loading, updateNeeds } = useNeeds(consultationId, customerId, userId)
  const [selectedType, setSelectedType] = useState(null)
  const [specificNeeds, setSpecificNeeds] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (needs) {
      setSelectedType(needs.need_type_id)
      setSpecificNeeds(needs.specific_needs ?? '')
      setMemo(needs.memo ?? '')
    }
  }, [needs])

  const handleTypeSelect = async (typeId) => {
    setSelectedType(typeId)
    setSaving(true)
    await updateNeeds({ need_type_id: typeId, specific_needs: specificNeeds, memo })
    setSaving(false)
  }

  const handleBlur = async () => {
    setSaving(true)
    await updateNeeds({ need_type_id: selectedType, specific_needs: specificNeeds, memo })
    setSaving(false)
  }

  if (loading) return <p className="section-loading">불러오는 중...</p>

  return (
    <div className="needs-wrap">
      <div className="needs-field">
        <p className="section-label">유입 경로</p>
        <div className="chip-group">
          {needTypes.map(type => (
            <button
              key={type.id}
              className={`chip ${selectedType === type.id ? 'chip-active' : ''}`}
              onClick={() => handleTypeSelect(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="needs-field">
        <p className="section-label">구체적인 니즈</p>
        <textarea
          className="needs-textarea"
          placeholder="고객이 구체적으로 말한 내용을 기록해두세요."
          value={specificNeeds}
          onChange={e => setSpecificNeeds(e.target.value)}
          onBlur={handleBlur}
          rows={3}
        />
      </div>

      <div className="needs-field">
        <p className="section-label">메모</p>
        <textarea
          className="needs-textarea"
          placeholder="이 단계에서 기억할 것들을 자유롭게 메모하세요."
          value={memo}
          onChange={e => setMemo(e.target.value)}
          onBlur={handleBlur}
          rows={3}
        />
      </div>

      {saving && <p className="saving-text">저장 중...</p>}
    </div>
  )
}