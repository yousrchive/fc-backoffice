import { useState, useEffect } from 'react'
import { useSolution } from '../../hooks/useSolution'
import '../../styles/SolutionSection.css'

export default function SolutionSection({ consultationId, customerId, userId, onDataChange }) {
  const {
    solution,
    insurerTypes,
    loading,
    updateSolution,
    addCoverage,
    deleteCoverage,
    updateInsurerResult,
    updateFinalCombo
  } = useSolution(consultationId, customerId, userId)

  const [newCoverage, setNewCoverage] = useState({ name: '', amount: '' })
  const [budget, setBudget] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [nextMemo, setNextMemo] = useState('')

  useEffect(() => {
    if (solution) {
      setBudget(solution.budget ?? '')
      setConclusion(solution.conclusion ?? '')
      setNextMemo(solution.next_memo ?? '')
    }
  }, [solution])

  useEffect(() => {
    if (onDataChange) onDataChange(solution)
  }, [solution, onDataChange])

  const 손보사 = insurerTypes.filter(i => i.category === '손해보험')
  const 생보사 = insurerTypes.filter(i => i.category === '생명보험')

  const getResult = (insurerTypeId) =>
    solution?.insurer_results?.find(r => r.insurer_type_id === insurerTypeId)

  const getCombo = (rank) =>
    solution?.final_combos?.find(c => c.rank === rank)

  if (loading) return <p className="section-loading">불러오는 중...</p>

  return (
    <div className="solution-wrap">
      <div className="solution-field">
        <p className="section-label">확보 예산 (원/월)</p>
        <input
          className="solution-input"
          placeholder="예: 130000"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          onBlur={() => updateSolution({ budget: Number(budget) })}
        />
      </div>

      <div className="solution-field">
        <p className="section-label">필수 보장항목</p>
        <table className="coverage-table">
          <thead>
            <tr>
              <th>보장 항목</th>
              <th>보장 금액</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {solution?.coverages?.map(cov => (
              <tr key={cov.id}>
                <td>{cov.name}</td>
                <td className="coverage-amt">{cov.amount}</td>
                <td>
                  <button className="coverage-del" onClick={() => deleteCoverage(cov.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="coverage-add-row">
          <input
            className="solution-input"
            placeholder="보장 항목"
            value={newCoverage.name}
            onChange={e => setNewCoverage({ ...newCoverage, name: e.target.value })}
          />
          <input
            className="solution-input"
            placeholder="금액 (예: 5000만원)"
            value={newCoverage.amount}
            onChange={e => setNewCoverage({ ...newCoverage, amount: e.target.value })}
          />
          <button
            className="coverage-add-btn"
            onClick={async () => {
              if (!newCoverage.name || !newCoverage.amount) return
              await addCoverage(newCoverage)
              setNewCoverage({ name: '', amount: '' })
            }}
          >
            추가
          </button>
        </div>
      </div>

      <div className="solution-field">
        <p className="section-label">보험사별 결과</p>
        <div className="insurer-grid">
          <div>
            <p className="insurer-category">손해보험사</p>
            {손보사.map(ins => (
              <InsurerRow
                key={ins.id}
                insurer={ins}
                result={getResult(ins.id)}
                onUpdate={(updates) => updateInsurerResult(ins.id, updates)}
              />
            ))}
          </div>
          <div>
            <p className="insurer-category">생명보험사</p>
            {생보사.map(ins => (
              <InsurerRow
                key={ins.id}
                insurer={ins}
                result={getResult(ins.id)}
                onUpdate={(updates) => updateInsurerResult(ins.id, updates)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="solution-field">
        <p className="section-label">최종 결정안</p>
        <div className="combo-grid">
          {[1, 2].map(rank => (
            <ComboCard
              key={rank}
              rank={rank}
              combo={getCombo(rank)}
              onUpdate={(updates) => updateFinalCombo(rank, updates)}
            />
          ))}
        </div>
      </div>

      <div className="solution-two-col">
        <div className="solution-field">
          <p className="section-label">결론</p>
          <textarea
            className="solution-textarea"
            placeholder="이 상담의 결론을 요약하세요."
            value={conclusion}
            onChange={e => setConclusion(e.target.value)}
            onBlur={() => updateSolution({ conclusion })}
            rows={4}
          />
        </div>
        <div className="solution-field">
          <p className="section-label">다음 할 말 메모</p>
          <textarea
            className="solution-textarea"
            placeholder="다음 답장 왔을 때 꺼낼 얘기를 미리 써두세요."
            value={nextMemo}
            onChange={e => setNextMemo(e.target.value)}
            onBlur={() => updateSolution({ next_memo: nextMemo })}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

function InsurerRow({ insurer, result, onUpdate }) {
  const [premium, setPremium] = useState(result?.premium ?? '')
  const status = result?.status

  return (
    <div className="insurer-row">
      <span className="insurer-name">{insurer.name}</span>
      <div className="insurer-right">
        <input
          className="insurer-input"
          placeholder="보험료"
          value={premium}
          onChange={e => setPremium(e.target.value)}
          onBlur={() => onUpdate({ premium: Number(premium), status: status ?? '인수' })}
        />
        <div className="status-pills">
          {['인수', '부담보', '거절'].map(s => (
            <button
              key={s}
              className={`status-pill status-${s} ${status === s ? 'status-on' : ''}`}
              onClick={() => onUpdate({ premium: Number(premium), status: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComboCard({ rank, combo, onUpdate }) {
  const [name, setName] = useState(combo?.combo_name ?? '')
  const [total, setTotal] = useState(combo?.total_premium ?? '')

  return (
    <div className={`combo-card ${rank === 1 ? 'combo-rank1' : 'combo-rank2'}`}>
      <p className="combo-rank-label">{rank}순위</p>
      <input
        className="combo-input"
        placeholder="예: 현대해상 + DB생명"
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={() => onUpdate({ combo_name: name, total_premium: Number(total) })}
      />
      <input
        className="combo-input"
        placeholder="총 보험료"
        value={total}
        onChange={e => setTotal(e.target.value)}
        onBlur={() => onUpdate({ combo_name: name, total_premium: Number(total) })}
      />
    </div>
  )
}