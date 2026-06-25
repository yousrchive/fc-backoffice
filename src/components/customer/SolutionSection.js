import { useState, useEffect, useRef } from 'react'
import { useSolution } from '../../hooks/useSolution'
import '../../styles/SolutionSection.css'

const fmt = (v) => {
  if (v === '' || v === null || v === undefined) return ''
  const n = Number(String(v).replace(/,/g, ''))
  if (isNaN(n)) return ''
  return n.toLocaleString('ko-KR')
}
const parse = (v) => {
  if (!v) return 0
  const n = Number(String(v).replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

export default function SolutionSection({ consultationId, customerId, userId, onDataChange }) {
  const {
    solution,
    insurerTypes,
    coverageTags,
    loading,
    updateSolution,
    addCoverage,
    deleteCoverage,
    updateInsurerResult,
    updateFinalCombo,
    updateAdjustmentCombo,
    uploadPdf,
    fetchSolution,
  } = useSolution(consultationId, customerId, userId)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [budget, setBudget] = useState('')
  const [coverageName, setCoverageName] = useState('')
  const [coverageAmount, setCoverageAmount] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)

  const [reply, setReply] = useState('')
  const [replyStatus, setReplyStatus] = useState(null)
  const [negReason, setNegReason] = useState('')
  const [noPrediction, setNoPrediction] = useState('')
  const [adjDirection, setAdjDirection] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [nextMemo, setNextMemo] = useState('')

  useEffect(() => {
    if (solution) {
      setBudget(solution.budget ? fmt(solution.budget) : '')
      setReply(solution.customer_reply ?? '')
      setReplyStatus(solution.reply_status ?? null)
      setNegReason(solution.reply_negative_reason ?? '')
      setNoPrediction(solution.reply_no_response_prediction ?? '')
      setAdjDirection(solution.adjustment_direction ?? '')
      setConclusion(solution.conclusion ?? '')
      setNextMemo(solution.next_memo ?? '')
    }
  }, [solution])

  useEffect(() => {
    if (onDataChange) onDataChange(solution)
  }, [solution, onDataChange])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateSolution({
        budget: parse(budget),
        customer_reply: reply,
        reply_status: replyStatus,
        reply_negative_reason: negReason,
        reply_no_response_prediction: noPrediction,
        adjustment_direction: adjDirection,
        conclusion,
        next_memo: nextMemo,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleCoverageNameChange = (val) => {
    setCoverageName(val)
    if (val.length > 0) {
      const filtered = coverageTags.filter(t => t.name.includes(val))
      setSuggestions(filtered)
      setShowSug(filtered.length > 0)
    } else {
      const all = coverageTags.slice(0, 8)
      setSuggestions(all)
      setShowSug(all.length > 0)
    }
  }

  const handleAddCoverage = async (nameOverride) => {
    const name = nameOverride ?? coverageName
    if (!name.trim()) return
    await addCoverage({ name: name.trim(), amount: parse(coverageAmount) })
    setCoverageName('')
    setCoverageAmount('')
    setShowSug(false)
  }

  const toggleReplyStatus = (s) => {
    const next = replyStatus === s ? null : s
    setReplyStatus(next)
  }

  const 손보사 = insurerTypes.filter(i => i.category === '손해보험')
  const 생보사 = insurerTypes.filter(i => i.category === '생명보험')
  const getResult = (id) => solution?.insurer_results?.find(r => r.insurer_type_id === id)
  const getFinalCombo = (rank) => solution?.final_combos?.find(c => c.rank === rank)
  const adjCombo = solution?.final_combos?.find(c => c.rank === 0)
  const showAdjustment = replyStatus === '부정' || replyStatus === '무응답'

  if (loading) return <p className="section-loading">불러오는 중...</p>

  return (
    <div className="solution-wrap">

      {/* 확보 예산 */}
      <div className="solution-field">
        <p className="section-label">확보 예산 (원/월)</p>
        <input
          className="solution-input"
          placeholder="예: 130,000"
          value={budget}
          onChange={e => setBudget(fmt(e.target.value))}
          onBlur={() => updateSolution({ budget: parse(budget) })}
        />
      </div>

      {/* 필수 보장항목 */}
      <div className="solution-field">
        <p className="section-label">필수 보장항목</p>
        <div className="coverage-chips">
          {solution?.coverages?.map(cov => (
            <div key={cov.id} className="coverage-chip">
              <span className="coverage-chip-name">{cov.name}</span>
              {cov.amount > 0 && (
                <span className="coverage-chip-amount">{fmt(cov.amount)}만원</span>
              )}
              <button className="coverage-chip-del" onClick={() => deleteCoverage(cov.id)}>×</button>
            </div>
          ))}
        </div>
        <div className="coverage-add-area">
          <div className="coverage-input-wrap">
            <input
              className="solution-input"
              placeholder="보장 항목"
              value={coverageName}
              onChange={e => handleCoverageNameChange(e.target.value)}
              onFocus={() => {
                const filtered = coverageName
                  ? coverageTags.filter(t => t.name.includes(coverageName))
                  : coverageTags.slice(0, 8)
                setSuggestions(filtered)
                setShowSug(filtered.length > 0)
              }}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCoverage() }}
            />
            {showSug && (
              <div className="coverage-suggestions">
                {suggestions.map(tag => (
                  <div
                    key={tag.id}
                    className="coverage-suggestion-item"
                    onMouseDown={() => {
                      setCoverageName(tag.name)
                      setShowSug(false)
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            className="solution-input coverage-amount-input"
            placeholder="금액 (단위: 만원)"
            value={coverageAmount}
            onChange={e => setCoverageAmount(fmt(e.target.value))}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCoverage() }}
          />
          <button className="coverage-add-btn" onClick={() => handleAddCoverage()}>추가</button>
        </div>
      </div>

      {/* 보험사별 결과 */}
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
                onUpdate={updates => updateInsurerResult(ins.id, updates)}
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
                onUpdate={updates => updateInsurerResult(ins.id, updates)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 최종 결정안 */}
      <div className="solution-field">
        <p className="section-label">최종 결정안</p>
        <div className="combo-grid">
          {[1, 2].map(rank => (
            <ComboCard
              key={rank}
              label={`${rank}순위`}
              cardClass={rank === 1 ? 'combo-rank1' : 'combo-rank2'}
              combo={getFinalCombo(rank)}
              insurerTypes={insurerTypes}
              solutionId={solution?.id}
              onUpdate={updates => updateFinalCombo(rank, updates)}
              uploadPdf={uploadPdf}
              onRefresh={fetchSolution}
            />
          ))}
        </div>
      </div>

      {/* 고객 답장 */}
      <div className="solution-field">
        <p className="section-label">고객 답장</p>
        <textarea
          className="solution-textarea"
          placeholder="고객 답장을 여기에 붙여넣으세요."
          value={reply}
          onChange={e => setReply(e.target.value)}
          onBlur={() => updateSolution({ customer_reply: reply })}
          rows={4}
        />
        <div className="reply-status-row">
          {['긍정', '부정', '무응답'].map(s => (
            <button
              key={s}
              className={`reply-chip reply-chip-${s} ${replyStatus === s ? 'reply-chip-on' : ''}`}
              onClick={() => toggleReplyStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {replyStatus === '부정' && (
          <div className="reply-sub">
            <p className="section-label">부정 이유</p>
            <textarea
              className="solution-textarea"
              placeholder="고객이 부정적인 이유를 적어주세요."
              value={negReason}
              onChange={e => setNegReason(e.target.value)}
              onBlur={() => updateSolution({ reply_negative_reason: negReason })}
              rows={3}
            />
          </div>
        )}
        {replyStatus === '무응답' && (
          <div className="reply-sub">
            <p className="section-label">무응답 이유 예측</p>
            <textarea
              className="solution-textarea"
              placeholder="고객이 응답하지 않는 이유를 예측해보세요."
              value={noPrediction}
              onChange={e => setNoPrediction(e.target.value)}
              onBlur={() => updateSolution({ reply_no_response_prediction: noPrediction })}
              rows={3}
            />
          </div>
        )}
      </div>

      {/* 조정 */}
      {showAdjustment && (
        <>
          <div className="solution-field">
            <p className="section-label">조정 방향</p>
            <textarea
              className="solution-textarea"
              placeholder="어떤 방향으로 조정할지 적어주세요."
              value={adjDirection}
              onChange={e => setAdjDirection(e.target.value)}
              onBlur={() => updateSolution({ adjustment_direction: adjDirection })}
              rows={3}
            />
          </div>
          <div className="solution-field">
            <p className="section-label">조정 결과</p>
            <ComboCard
              label="조정 결과"
              cardClass="combo-adj"
              combo={adjCombo}
              insurerTypes={insurerTypes}
              solutionId={solution?.id}
              onUpdate={updates => updateAdjustmentCombo(updates)}
              uploadPdf={uploadPdf}
              onRefresh={fetchSolution}
              single
            />
          </div>
        </>
      )}

      {/* 결론 + 다음 할 말 */}
      <div className="solution-two-col">
        <div className="solution-field">
          <p className="section-label">결론</p>
          <textarea
            className="solution-textarea"
            placeholder="이 상담의 결론을 요약하세요."
            value={conclusion}
            onChange={e => setConclusion(e.target.value)}
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
            rows={4}
          />
        </div>
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

function InsurerRow({ insurer, result, onUpdate }) {
  const [premium, setPremium] = useState('')
  const status = result?.status

  useEffect(() => {
    setPremium(result?.premium ? fmt(result.premium) : '')
  }, [result])

  return (
    <div className="insurer-row">
      <span className="insurer-name">{insurer.name}</span>
      <div className="insurer-right">
        <input
          className="insurer-input"
          placeholder="보험료"
          value={premium}
          onChange={e => setPremium(fmt(e.target.value))}
          onBlur={() => onUpdate({ premium: parse(premium), status: status ?? '인수' })}
        />
        <div className="status-pills">
          {['인수', '부담보', '거절'].map(s => (
            <button
              key={s}
              className={`status-pill status-${s} ${status === s ? 'status-on' : ''}`}
              onClick={() => onUpdate({ premium: parse(premium), status: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComboCard({ label, cardClass, combo, insurerTypes, solutionId, onUpdate, uploadPdf, onRefresh, single }) {
  const [entries, setEntries] = useState([])
  const [total, setTotal] = useState('')
  const [pdfList, setPdfList] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (combo) {
      setEntries(combo.insurer_entries ?? [])
      setTotal(combo.total_premium ? fmt(combo.total_premium) : '')
      setPdfList(combo.pdf_urls ?? [])
    }
  }, [combo])

  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    if (showPicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPicker])

  const buildComboName = (nextEntries) => {
    return nextEntries
      .map(e => {
        const ins = insurerTypes.find(i => i.id === e.insurer_type_id)
        return [ins?.name, e.product_name].filter(Boolean).join(' ')
      })
      .join(' + ')
  }

  const save = (nextEntries, nextTotal, nextPdfs) => {
    const e = nextEntries ?? entries
    const t = nextTotal ?? total
    const p = nextPdfs ?? pdfList
    onUpdate({
      combo_name: buildComboName(e),
      insurer_entries: e,
      total_premium: parse(t),
      pdf_urls: p,
    })
  }

  const toggleInsurer = (insId) => {
    const exists = entries.some(e => e.insurer_type_id === insId)
    const next = exists
      ? entries.filter(e => e.insurer_type_id !== insId)
      : [...entries, { insurer_type_id: insId, product_name: '' }]
    setEntries(next)
    save(next, null, null)
  }

  const updateProductName = (insId, name) => {
    const next = entries.map(e =>
      e.insurer_type_id === insId ? { ...e, product_name: name } : e
    )
    setEntries(next)
    save(next, null, null)
  }

  const handlePdfUpload = async (file) => {
    if (!solutionId) return
    setUploading(true)
    try {
      const url = await uploadPdf(file, solutionId, combo?.id ?? 'new')
      const next = [...pdfList, { name: file.name, url }]
      setPdfList(next)
      save(null, null, next)
    } catch (err) {
      console.error('PDF 업로드 실패:', err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removePdf = (idx) => {
    const next = pdfList.filter((_, i) => i !== idx)
    setPdfList(next)
    save(null, null, next)
  }

  return (
    <div className={`combo-card ${cardClass} ${single ? 'combo-card-single' : ''}`}>
      <p className="combo-rank-label">{label}</p>

      {/* 선택된 보험사 + 상품명 */}
      <div className="combo-insurer-section">
        {entries.map(entry => {
          const ins = insurerTypes.find(i => i.id === entry.insurer_type_id)
          return (
            <div key={entry.insurer_type_id} className="combo-insurer-entry">
              <button
                className="combo-insurer-chip"
                onClick={() => toggleInsurer(entry.insurer_type_id)}
              >
                {ins?.name ?? '?'} ×
              </button>
              <input
                className="combo-product-input"
                placeholder="상품명"
                value={entry.product_name}
                onChange={e => updateProductName(entry.insurer_type_id, e.target.value)}
                onBlur={() => save(null, null, null)}
              />
            </div>
          )
        })}
        <div className="combo-picker-wrap" ref={pickerRef}>
          <button
            className="combo-add-insurer-btn"
            onClick={() => setShowPicker(v => !v)}
          >
            + 보험사
          </button>
          {showPicker && (
            <div className="insurer-picker">
              <p className="insurer-picker-label">손해보험사</p>
              {insurerTypes.filter(i => i.category === '손해보험').map(ins => (
                <button
                  key={ins.id}
                  className={`insurer-picker-item ${entries.some(e => e.insurer_type_id === ins.id) ? 'insurer-picker-selected' : ''}`}
                  onClick={() => toggleInsurer(ins.id)}
                >
                  {ins.name}
                </button>
              ))}
              <p className="insurer-picker-label" style={{ marginTop: 8 }}>생명보험사</p>
              {insurerTypes.filter(i => i.category === '생명보험').map(ins => (
                <button
                  key={ins.id}
                  className={`insurer-picker-item ${entries.some(e => e.insurer_type_id === ins.id) ? 'insurer-picker-selected' : ''}`}
                  onClick={() => toggleInsurer(ins.id)}
                >
                  {ins.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 총 보험료 */}
      <input
        className="combo-input"
        placeholder="총 보험료 (단위: 만원)"
        value={total}
        onChange={e => setTotal(fmt(e.target.value))}
        onBlur={() => save(null, total, null)}
      />

      {/* PDF 목록 */}
      <div className="combo-pdfs">
        {pdfList.map((pdf, i) => (
          <div key={i} className="combo-pdf-item">
            <a
              href={typeof pdf === 'string' ? pdf : pdf.url}
              target="_blank"
              rel="noreferrer"
              className="combo-pdf-link"
            >
              📄 {typeof pdf === 'string' ? `PDF ${i + 1}` : pdf.name}
            </a>
            <button className="combo-pdf-del" onClick={() => removePdf(i)}>×</button>
          </div>
        ))}
        <input
          type="file"
          accept=".pdf"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handlePdfUpload(e.target.files[0]) }}
        />
        <button
          className="combo-pdf-add-btn"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '업로드 중...' : '+ PDF 추가'}
        </button>
      </div>
    </div>
  )
}
