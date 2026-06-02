import { useState, useEffect } from 'react'
import { useProblems } from '../../hooks/useProblems'
import '../../styles/ProblemsSection.css'

export default function ProblemsSection({ consultationId, customerId, userId, onDataChange }) {
  const { problemTypes, selectedIds, problems, loading, toggleProblem } = useProblems(consultationId, customerId, userId)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (onDataChange) onDataChange(problems)
  }, [problems, onDataChange])

  if (loading) return <p className="section-loading">불러오는 중...</p>

  return (
    <div className="problems-wrap">
      <div className="problems-field">
        <p className="section-label">핵심 문제</p>
        <div className="chip-group">
          {problemTypes.map(type => (
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
    </div>
  )
}