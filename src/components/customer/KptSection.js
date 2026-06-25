import { useState, useEffect } from 'react'
import { kptService } from '../../services/kptService'
import '../../styles/KptSection.css'

const TYPE_LABELS = {
  K: { label: 'Keep', desc: '잘 됐던 점', color: 'kpt-k' },
  P: { label: 'Problem', desc: '아쉬웠던 점', color: 'kpt-p' },
  T: { label: 'Try', desc: '앞으로 유의할 점', color: 'kpt-t' },
}

export default function KptSection({ customerId, userId }) {
  const [open, setOpen] = useState(false)
  const [kpts, setKpts] = useState([])
  const [type, setType] = useState('K')
  const [content, setContent] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!customerId) return
    kptService.getByCustomer(customerId)
      .then(setKpts)
      .catch(console.error)
  }, [customerId])

  const handleAdd = async () => {
    if (!content.trim() || !customerId || !userId) return
    setAdding(true)
    try {
      const item = await kptService.add(customerId, userId, type, content.trim())
      if (item) setKpts(prev => [item, ...prev])
      setContent('')
    } catch (err) {
      console.error('KPT add:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    setKpts(prev => prev.filter(k => k.id !== id))
    try { await kptService.delete(id) } catch (_) {}
  }

  const pendingCount = kpts.length

  return (
    <div className="kpt-wrap">
      <button className="kpt-toggle" onClick={() => setOpen(v => !v)}>
        <span className="kpt-toggle-label">
          중간회고
          {pendingCount > 0 && <span className="kpt-count">{pendingCount}</span>}
        </span>
        <span className="kpt-toggle-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="kpt-body">
          {/* 추가 폼 */}
          <div className="kpt-add">
            <div className="kpt-type-chips">
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  className={`kpt-type-chip ${v.color} ${type === k ? 'kpt-type-chip-on' : ''}`}
                  onClick={() => setType(k)}
                >
                  {v.label}
                  <span className="kpt-type-desc">{v.desc}</span>
                </button>
              ))}
            </div>
            <textarea
              className="kpt-textarea"
              placeholder={`${TYPE_LABELS[type].desc}을 적어주세요`}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) handleAdd()
              }}
            />
            <div className="kpt-add-row">
              <span className="kpt-hint">⌘ Enter로 추가</span>
              <button className="kpt-add-btn" onClick={handleAdd} disabled={adding || !content.trim()}>
                {adding ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>

          {/* 목록 — 최신순 */}
          <div className="kpt-list">
            {kpts.length === 0 && (
              <p className="kpt-empty">아직 기록이 없어요</p>
            )}
            {kpts.map(kpt => (
              <div key={kpt.id} className={`kpt-item kpt-item-${kpt.type.toLowerCase()}`}>
                <div className="kpt-item-header">
                  <span className={`kpt-badge ${TYPE_LABELS[kpt.type]?.color}`}>
                    {TYPE_LABELS[kpt.type]?.label}
                  </span>
                  <span className="kpt-item-date">
                    {new Date(kpt.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </span>
                  <button className="kpt-item-del" onClick={() => handleDelete(kpt.id)}>×</button>
                </div>
                <p className="kpt-item-content">{kpt.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
