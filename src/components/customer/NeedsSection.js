import { useState } from 'react'
import { useNeeds } from '../../hooks/useNeeds'
import '../../styles/NeedsSection.css'

export default function NeedsSection({ consultationId, customerId, userId, onDataChange }) {
  const { needs, needTypes, loading, updateNeeds } = useNeeds(consultationId, customerId, userId)

  // null = 아직 유저가 편집 안 함 → DB 값 표시
  const [editedType, setEditedType] = useState(null)
  const [editedSpecificNeeds, setEditedSpecificNeeds] = useState(null)
  const [editedMemo, setEditedMemo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedType = editedType ?? needs?.need_type_id ?? null
  const specificNeeds = editedSpecificNeeds ?? needs?.specific_needs ?? ''
  const memo = editedMemo ?? needs?.memo ?? ''

  const doSave = async () => {
    if (!consultationId) {
      console.warn('[NeedsSection] consultationId 없음')
      return
    }
    setSaving(true)
    setSaved(false)
    try {
      const result = await updateNeeds({
        need_type_id: selectedType,
        specific_needs: specificNeeds,
        memo,
      })
      if (result) {
        setSaved(true)
        if (onDataChange) onDataChange(result)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('[NeedsSection] 저장 실패:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleTypeSelect = async (typeId) => {
    setEditedType(typeId)
    if (onDataChange) onDataChange({ ...(needs ?? {}), need_type_id: typeId })
    setSaving(true)
    setSaved(false)
    try {
      const result = await updateNeeds({
        need_type_id: typeId,
        specific_needs: specificNeeds,
        memo,
      })
      if (result) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('[NeedsSection] 저장 실패:', err)
    } finally {
      setSaving(false)
    }
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
          onChange={e => setEditedSpecificNeeds(e.target.value)}
          rows={3}
        />
      </div>

      <div className="needs-field">
        <p className="section-label">메모</p>
        <textarea
          className="needs-textarea"
          placeholder="이 단계에서 기억할 것들을 자유롭게 메모하세요."
          value={memo}
          onChange={e => setEditedMemo(e.target.value)}
          rows={3}
        />
      </div>

      <div className="section-save-row">
        {saved && <span className="section-saved">저장됨 ✓</span>}
        <button className="section-save-btn" onClick={doSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
