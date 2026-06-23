import { useState, useEffect, useCallback } from 'react'
import { underwritingService } from '../../services/underwritingService'
import '../../styles/UnderwritingSection.css'

const RESULTS = ['인수', '부담보', '거절']

const RESULT_CLASS = {
  '인수': 'uw-chip-accept',
  '부담보': 'uw-chip-partial',
  '거절': 'uw-chip-reject',
}

const defaultForm = () => ({
  result: '인수',
  insurer: '',
  product: '',
  condition: '',
  premium: '',
  memo: '',
})

function conditionLabel(result) {
  if (result === '부담보') return '부담보 조건'
  if (result === '거절') return '거절 사유'
  return null
}

export default function UnderwritingSection({ customerId }) {
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm())
  const [saving, setSaving] = useState(false)

  const fetchRecords = useCallback(async () => {
    if (!customerId) return
    const data = await underwritingService.getByCustomer(customerId)
    setRecords(data)
  }, [customerId])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const openNew = () => {
    setEditingId(null)
    setForm(defaultForm())
    setShowForm(true)
  }

  const openEdit = (record) => {
    setEditingId(record.id)
    setForm({
      result: record.result,
      insurer: record.insurer ?? '',
      product: record.product ?? '',
      condition: record.condition ?? '',
      premium: record.premium != null ? String(record.premium) : '',
      memo: record.memo ?? '',
    })
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(defaultForm())
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        result: form.result,
        insurer: form.insurer || null,
        product: form.product || null,
        condition: form.condition || null,
        premium: form.premium ? Number(form.premium) : null,
        memo: form.memo || null,
      }
      if (editingId) {
        const updated = await underwritingService.update(editingId, payload)
        setRecords(prev => prev.map(r => r.id === editingId ? updated : r))
      } else {
        const created = await underwritingService.create(customerId, payload)
        setRecords(prev => [created, ...prev])
      }
      handleClose()
    } catch (err) {
      console.error('UnderwritingSection save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await underwritingService.delete(id)
    setRecords(prev => prev.filter(r => r.id !== id))
    handleClose()
  }

  return (
    <div className="uw-wrap">
      <div className="uw-header">
        <div>
          <h2 className="uw-title">언더라이팅</h2>
          <p className="uw-sub">인수 · 부담보 · 거절 이력</p>
        </div>
        <button className="add-btn" onClick={openNew}>+ 추가</button>
      </div>

      {records.length === 0 ? (
        <p className="uw-empty">언더라이팅 기록이 없어요</p>
      ) : (
        <div className="uw-list">
          {records.map(record => (
            <div key={record.id} className="uw-card" onClick={() => openEdit(record)}>
              <div className="uw-card-top">
                <span className={`uw-chip ${RESULT_CLASS[record.result]}`}>{record.result}</span>
                <span className="uw-insurer">{record.insurer ?? '—'}</span>
                {record.premium != null && (
                  <span className="uw-premium">{Number(record.premium).toLocaleString()}원/월</span>
                )}
              </div>
              {record.product && <p className="uw-product">{record.product}</p>}
              {record.condition && (
                <p className="uw-condition">
                  <span className="uw-condition-label">
                    {record.result === '부담보' ? '부담보 조건' : '거절 사유'}
                  </span>
                  {record.condition}
                </p>
              )}
              {record.memo && <p className="uw-memo">{record.memo}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <>
          <div className="form-overlay" onClick={handleClose} />
          <div className="form-drawer">
            <div className="form-drawer-header">
              <p className="form-drawer-title">{editingId ? '언더라이팅 수정' : '언더라이팅 추가'}</p>
              <button className="form-drawer-close" onClick={handleClose}>✕</button>
            </div>

            <div className="form-drawer-body">
              <div className="form-field">
                <label className="form-label">결과</label>
                <div className="uw-result-chips">
                  {RESULTS.map(r => (
                    <button
                      key={r}
                      className={`uw-chip ${RESULT_CLASS[r]} ${form.result === r ? 'uw-chip-selected' : 'uw-chip-unselected'}`}
                      onClick={() => setForm({ ...form, result: r, condition: '' })}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">보험사</label>
                  <input
                    className="form-input"
                    placeholder="예: 현대해상"
                    value={form.insurer}
                    onChange={e => setForm({ ...form, insurer: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">상품명</label>
                  <input
                    className="form-input"
                    placeholder="예: 무배당 실손"
                    value={form.product}
                    onChange={e => setForm({ ...form, product: e.target.value })}
                  />
                </div>
              </div>

              {conditionLabel(form.result) && (
                <div className="form-field">
                  <label className="form-label">{conditionLabel(form.result)}</label>
                  <textarea
                    className="form-input"
                    placeholder={
                      form.result === '부담보'
                        ? '예: 좌측 무릎 5년 부담보'
                        : '예: 고혈압 이력으로 인한 거절'
                    }
                    value={form.condition}
                    onChange={e => setForm({ ...form, condition: e.target.value })}
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </div>
              )}

              {form.result !== '거절' && (
                <div className="form-field">
                  <label className="form-label">보험료 (원/월)</label>
                  <input
                    className="form-input"
                    placeholder="예: 120000"
                    value={form.premium}
                    onChange={e => setForm({ ...form, premium: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                </div>
              )}

              <div className="form-field">
                <label className="form-label">메모</label>
                <textarea
                  className="form-input"
                  placeholder="추가로 기억할 내용"
                  value={form.memo}
                  onChange={e => setForm({ ...form, memo: e.target.value })}
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div className="form-drawer-footer">
              {editingId && (
                <button className="form-btn-cancel" onClick={() => handleDelete(editingId)}>
                  삭제
                </button>
              )}
              <button className="form-btn-cancel" onClick={handleClose}>취소</button>
              <button className="form-btn-submit" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
