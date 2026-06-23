import { useState, useEffect, useCallback } from 'react'
import { underwritingService } from '../../services/underwritingService'
import '../../styles/UnderwritingSection.css'

const COLUMNS = [
  { key: 'condition_uw', label: '병력명(UW)', width: 120 },
  { key: 'condition_insurer', label: '병력명(보험사)', width: 120 },
  { key: 'insurer', label: '보험회사', width: 80 },
  { key: 'product', label: '상품명', width: 100 },
  { key: 'result', label: '심사결과', width: 130 },
  { key: 'exclusion', label: '부담보 내용', width: 140 },
  { key: 'surcharge', label: '할증 내용', width: 100 },
  { key: 'disclosure', label: '고지내용', width: 160 },
  { key: 'cancer_coverage', label: '암 관련 가입 담보', width: 150 },
  { key: 'cerebro_coverage', label: '뇌혈관 관련 가입 담보', width: 160 },
  { key: 'cardio_coverage', label: '심혈관 관련 가입담보', width: 150 },
  { key: 'disability_coverage', label: '후유장해 관련 가입담보', width: 160 },
  { key: 'surgery_coverage', label: '수술관련 가입 보장', width: 130 },
  { key: 'design_date', label: '설계년월', width: 110 },
]

const defaultForm = () => Object.fromEntries(COLUMNS.map(c => [c.key, '']))

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
    setForm(Object.fromEntries(COLUMNS.map(c => [c.key, record[c.key] ?? ''])))
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
      const payload = Object.fromEntries(
        COLUMNS.map(c => [c.key, form[c.key] || null])
      )
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
          <p className="uw-sub">병력별 심사 결과 및 가입 담보 현황</p>
        </div>
        <button className="add-btn" onClick={openNew}>+ 추가</button>
      </div>

      {records.length === 0 ? (
        <p className="uw-empty">언더라이팅 기록이 없어요</p>
      ) : (
        <div className="uw-table-scroll">
          <table className="uw-table">
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} style={{ minWidth: col.width }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="uw-row" onClick={() => openEdit(record)}>
                  {COLUMNS.map(col => (
                    <td key={col.key} title={record[col.key] ?? ''}>
                      <span className="uw-cell-text">{record[col.key] || '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
              {COLUMNS.map(col => (
                <div key={col.key} className="form-field">
                  <label className="form-label">{col.label}</label>
                  <textarea
                    className="form-input"
                    value={form[col.key]}
                    onChange={e => setForm({ ...form, [col.key]: e.target.value })}
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </div>
              ))}
            </div>
            <div className="form-drawer-footer">
              {editingId && (
                <button className="form-btn-cancel" onClick={() => handleDelete(editingId)}>삭제</button>
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
