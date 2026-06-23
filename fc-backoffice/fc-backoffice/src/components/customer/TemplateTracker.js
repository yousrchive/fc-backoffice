import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { templateService } from '../../services/templateService'
import '../../styles/TemplateTracker.css'

export default function TemplateTracker({ consultationId, customerId, stage }) {
  const { user } = useAuth()
  const [used, setUsed] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [stageTemplates, setStageTemplates] = useState([])
  const [search, setSearch] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', context: '', content: '' })
  const [saving, setSaving] = useState(false)

  const fetchUsed = useCallback(async () => {
    if (!consultationId) return
    const data = await templateService.getUsedByConsultationStage(consultationId, stage)
    setUsed(data)
  }, [consultationId, stage])

  useEffect(() => { fetchUsed() }, [fetchUsed])

  const openModal = async () => {
    const data = await templateService.getByStage(user.id, stage)
    setStageTemplates(data)
    setSearch('')
    setShowNewForm(false)
    setNewForm({ title: '', context: '', content: '' })
    setShowModal(true)
  }

  const handleSelect = async (template) => {
    await templateService.addToCustomer(customerId, template.id, consultationId, stage)
    await fetchUsed()
    setShowModal(false)
  }

  const handleCreateAndAdd = async () => {
    if (!newForm.title || !newForm.content) return
    setSaving(true)
    try {
      const t = await templateService.create(user.id, { ...newForm, stage, is_public: false })
      await handleSelect(t)
    } finally {
      setSaving(false)
    }
  }

  const handleReaction = async (item, value) => {
    const next = item.reacted === value ? null : value
    setUsed(prev => prev.map(u => u.id === item.id ? { ...u, reacted: next } : u))
    await templateService.upsertReaction(item.template_id, consultationId, stage, next)
  }

  const usedIds = new Set(used.map(u => u.template_id))
  const filtered = stageTemplates.filter(t => {
    if (usedIds.has(t.id)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return t.title?.toLowerCase().includes(q) || t.content?.toLowerCase().includes(q)
  })

  if (!consultationId) return null

  return (
    <div className="tt-wrap">
      <div className="tt-header">
        <p className="tt-label">사용한 발화</p>
        <button className="tt-add-btn" onClick={openModal}>+ 발화 추가</button>
      </div>

      {used.length === 0 ? (
        <p className="tt-empty">이 단계에서 사용한 발화가 없어요</p>
      ) : (
        <div className="tt-list">
          {used.map(item => (
            <div key={item.id} className="tt-item">
              <div className="tt-item-info">
                <p className="tt-title">{item.templates?.title}</p>
                {item.templates?.context && (
                  <p className="tt-context">{item.templates.context}</p>
                )}
              </div>
              <div className="tt-reactions">
                <button
                  className={`tt-react-btn ${item.reacted === true ? 'tt-react-yes' : ''}`}
                  onClick={() => handleReaction(item, true)}
                  title="반응함"
                >✓</button>
                <button
                  className={`tt-react-btn ${item.reacted === false ? 'tt-react-no' : ''}`}
                  onClick={() => handleReaction(item, false)}
                  title="반응 없음"
                >✗</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <div className="tt-overlay" onClick={() => setShowModal(false)} />
          <div className="tt-modal">
            <div className="tt-modal-header">
              <p className="tt-modal-title">{stage} 발화 선택</p>
              <button className="form-drawer-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="tt-modal-body">
              <input
                className="cl-search"
                placeholder="발화 검색"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <div className="tt-template-list">
                {filtered.map(t => (
                  <div key={t.id} className="tt-template-item" onClick={() => handleSelect(t)}>
                    <p className="tt-title">{t.title}</p>
                    {t.context && <p className="tt-context">{t.context}</p>}
                    <p className="tt-preview">{t.content}</p>
                  </div>
                ))}
                {filtered.length === 0 && !showNewForm && (
                  <p className="tt-empty">{search ? '검색 결과가 없어요' : '이 단계에 등록된 발화가 없어요'}</p>
                )}
              </div>

              <div className="tt-new-section">
                {!showNewForm ? (
                  <button className="tt-new-toggle" onClick={() => setShowNewForm(true)}>
                    + 새 발화 직접 등록
                  </button>
                ) : (
                  <div className="tt-new-form">
                    <p className="tt-new-form-title">새 발화 등록</p>
                    <input
                      className="form-input"
                      placeholder="제목"
                      value={newForm.title}
                      onChange={e => setNewForm({ ...newForm, title: e.target.value })}
                    />
                    <input
                      className="form-input"
                      placeholder="사용 맥락 (선택)"
                      value={newForm.context}
                      onChange={e => setNewForm({ ...newForm, context: e.target.value })}
                    />
                    <textarea
                      className="form-input"
                      placeholder="발화 내용"
                      value={newForm.content}
                      rows={4}
                      onChange={e => setNewForm({ ...newForm, content: e.target.value })}
                      style={{ resize: 'none', lineHeight: 1.6 }}
                    />
                    <div className="form-actions">
                      <button className="form-btn-cancel" onClick={() => setShowNewForm(false)}>취소</button>
                      <button
                        className="form-btn-submit"
                        onClick={handleCreateAndAdd}
                        disabled={saving || !newForm.title || !newForm.content}
                      >
                        {saving ? '저장 중...' : '등록 후 추가'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
