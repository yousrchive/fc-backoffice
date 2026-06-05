import { useState, useEffect } from 'react'
import { useProblems } from '../../hooks/useProblems'
import '../../styles/ProblemsSection.css'

const INSURANCE_REASONS = ['갱신형', '보장범위', '보장기간', '납입기간', '기타']

export default function ProblemsSection({ consultationId, customerId, userId, onDataChange }) {
  const {
    groupedTypes,
    selectedIds,
    summary,
    problemInsurances,
    loading,
    toggleProblem,
    updateSummary,
    addProblemInsurance,
    updateProblemInsurance,
    deleteProblemInsurance,
  } = useProblems(consultationId, customerId, userId)

  const [finalSuggestion, setFinalSuggestion] = useState('')
  const [memo, setMemo] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [insuranceInput, setInsuranceInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (summary) {
      setFinalSuggestion(summary.final_suggestion ?? '')
      setMemo(summary.memo ?? '')
      setTotalBudget(summary.total_budget ? String(summary.total_budget) : '')
    }
  }, [summary])

  useEffect(() => {
    if (onDataChange) onDataChange({ selectedIds, summary, problemInsurances })
  }, [selectedIds, summary, problemInsurances, onDataChange])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateSummary({
        final_suggestion: finalSuggestion,
        memo,
        total_budget: totalBudget ? Number(totalBudget) : null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleAddInsurance = async () => {
    if (!insuranceInput.trim()) return
    await addProblemInsurance(insuranceInput)
    setInsuranceInput('')
  }

  const toggleReason = (ins, reason) => {
    const next = ins.reason === reason ? null : reason
    updateProblemInsurance(ins.id, { reason: next })
  }

  if (loading) return <p className="section-loading">불러오는 중...</p>

  const categories = Object.entries(groupedTypes)

  return (
    <div className="problems-wrap">

      {/* 핵심 문제 — 카테고리별 */}
      {categories.map(([catName, types]) => (
        <div key={catName} className="problems-field">
          <p className="section-label">{catName}</p>
          <div className="chip-group">
            {types.map(type => (
              <button
                key={type.id}
                className={`chip ${selectedIds.includes(type.id) ? 'chip-active' : ''}`}
                onClick={() => toggleProblem(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 문제 보험 */}
      <div className="problems-field">
        <p className="section-label">문제 보험</p>
        <div className="problem-insurance-add">
          <input
            className="problems-input"
            placeholder="보험 이름 입력"
            value={insuranceInput}
            onChange={e => setInsuranceInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddInsurance() }}
          />
          <button className="problem-insurance-add-btn" onClick={handleAddInsurance}>
            + 추가
          </button>
        </div>
        <div className="problem-insurance-list">
          {problemInsurances.map(ins => (
            <div key={ins.id} className="problem-insurance-item">
              <div className="problem-insurance-header">
                <span className="problem-insurance-name">{ins.name}</span>
                <button
                  className="problem-insurance-del"
                  onClick={() => deleteProblemInsurance(ins.id)}
                >
                  ×
                </button>
              </div>
              <div className="problem-insurance-reasons">
                {INSURANCE_REASONS.map(reason => (
                  <button
                    key={reason}
                    className={`reason-chip ${ins.reason === reason ? 'reason-chip-active' : ''}`}
                    onClick={() => toggleReason(ins, reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최종 제언 */}
      <div className="problems-field">
        <p className="section-label">최종 제언</p>
        <p className="problems-field-hint">이렇게 말하면 되겠다 — 다음 대화에서 꺼낼 핵심 한 마디</p>
        <textarea
          className="problems-textarea problems-textarea-suggest"
          placeholder="예: '지금 암 보장이 전혀 없으신데, 이 부분이 가장 급하다고 보여요.'"
          value={finalSuggestion}
          onChange={e => setFinalSuggestion(e.target.value)}
          rows={3}
        />
      </div>

      {/* 메모 */}
      <div className="problems-field">
        <p className="section-label">메모</p>
        <textarea
          className="problems-textarea"
          placeholder="이 단계에서 기억할 것들을 자유롭게 메모하세요."
          value={memo}
          onChange={e => setMemo(e.target.value)}
          rows={3}
        />
      </div>

      {/* 총 확보 예산 */}
      <div className="problems-field">
        <p className="section-label">총 확보 예산 (원/월)</p>
        <input
          className="problems-input"
          placeholder="예: 130000"
          value={totalBudget}
          onChange={e => setTotalBudget(e.target.value.replace(/[^0-9]/g, ''))}
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
