import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTemplates } from '../hooks/useTemplates'
import { templateService } from '../services/templateService'
import '../styles/Templates.css'

export default function Templates() {
  const { user } = useAuth()
  const {
    templates,
    stages,
    loading,
    filter,
    setFilter,
    stageFilter,
    setStageFilter,
    addTemplate,
    updateTemplate,
    deleteTemplate
  } = useTemplates()

  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [histories, setHistories] = useState([])
  const [form, setForm] = useState({
    title: '',
    stage: '',
    context: '',
    content: '',
    tags: '',
    is_public: false
  })

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleAdd = async () => {
    if (!form.title || !form.content) return
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    await addTemplate({ ...form, tags })
    setForm({ title: '', stage: stages[1]?.label ?? '', context: '', content: '', tags: '', is_public: false })
    setShowForm(false)
  }

  const handleSelect = async (template) => {
    setSelectedTemplate(template)
    const data = await templateService.getHistories(template.id)
    setHistories(data)
  }

  const handleUpdate = async (updates) => {
    const oldContent = selectedTemplate.content
    const tags = updates.tags
      ? typeof updates.tags === 'string'
        ? updates.tags.split(',').map(t => t.trim()).filter(Boolean)
        : updates.tags
      : selectedTemplate.tags
    const data = await updateTemplate(selectedTemplate.id, { ...updates, tags }, oldContent)
    setSelectedTemplate(data)
    const histData = await templateService.getHistories(selectedTemplate.id)
    setHistories(histData)
  }

  const getReactionRate = (template) => {
    const reactions = template.template_reactions ?? []
    if (reactions.length === 0) return null
    const reacted = reactions.filter(r => r.reacted).length
    return Math.round((reacted / reactions.length) * 100)
  }

  if (loading) return <p className="page-loading">불러오는 중...</p>

  return (
    <div className="templates-wrap">
      {selectedTemplate ? (
        <TemplateDetail
          template={selectedTemplate}
          histories={histories}
          stages={stages}
          onBack={() => setSelectedTemplate(null)}
          onUpdate={handleUpdate}
          onDelete={async () => {
            await deleteTemplate(selectedTemplate.id)
            setSelectedTemplate(null)
          }}
          userId={user.id}
        />
      ) : (
        <>
          <div className="templates-header">
            <div>
              <h1 className="page-title">발화모음</h1>
              <p className="page-sub">총 {templates.length}개</p>
            </div>
            <button className="add-btn" onClick={() => setShowForm(true)}>+ 템플릿 추가</button>
          </div>

          <div className="templates-filters">
            <div className="filter-group">
              {['all', 'mine'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? '전체 템플릿' : '내 템플릿'}
                </button>
              ))}
            </div>
            <div className="filter-group">
              {stages.map(s => (
                <button
                  key={s.id}
                  className={`filter-btn ${stageFilter === s.label ? 'filter-active' : ''}`}
                  onClick={() => setStageFilter(s.label)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {showForm && (
            <>
              <div className="form-overlay" onClick={() => setShowForm(false)} />
              <div className="form-drawer">
                <div className="form-drawer-header">
                  <p className="form-drawer-title">템플릿 추가</p>
                  <button className="form-drawer-close" onClick={() => setShowForm(false)}>✕</button>
                </div>
                <div className="form-drawer-body">
                  <div className="form-field">
                    <label className="form-label">제목</label>
                    <input
                      className="form-input"
                      name="title"
                      placeholder="템플릿 제목"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">단계</label>
                      <select className="form-input" name="stage" value={form.stage} onChange={handleChange}>
                        {stages.slice(1).map(s => (
                          <option key={s.id} value={s.label}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">공개 여부</label>
                      <div className="toggle-wrap">
                        <input
                          type="checkbox"
                          name="is_public"
                          checked={form.is_public}
                          onChange={handleChange}
                          id="is_public"
                        />
                        <label htmlFor="is_public" className="toggle-label">전체 공개</label>
                      </div>
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">사용 맥락</label>
                    <input
                      className="form-input"
                      name="context"
                      placeholder="어떤 상황에서 쓰는 템플릿인지"
                      value={form.context}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">내용</label>
                    <textarea
                      className="form-input"
                      name="content"
                      placeholder="템플릿 내용"
                      value={form.content}
                      onChange={handleChange}
                      rows={6}
                      style={{ resize: 'none', lineHeight: 1.6 }}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">태그 (쉼표로 구분)</label>
                    <input
                      className="form-input"
                      name="tags"
                      placeholder="예: 초회상담, 보험료, 갱신형"
                      value={form.tags}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-drawer-footer">
                  <button className="form-btn-cancel" onClick={() => setShowForm(false)}>취소</button>
                  <button className="form-btn-submit" onClick={handleAdd}>추가</button>
                </div>
              </div>
            </>
          )}

          <div className="template-list">
            {templates.length === 0 ? (
              <p className="empty-text">아직 템플릿이 없어요.</p>
            ) : (
              templates.map(t => {
                const rate = getReactionRate(t)
                const isMine = t.user_id === user.id
                return (
                  <div key={t.id} className="template-card" onClick={() => handleSelect(t)}>
                    <div className="template-card-top">
                      <div className="template-card-left">
                        <span className={`stage-badge stage-${t.stage}`}>{t.stage}</span>
                        <p className="template-card-title">{t.title}</p>
                      </div>
                      <div className="template-card-right">
                        {rate !== null && (
                          <span className="reaction-rate">반응률 {rate}%</span>
                        )}
                        {!isMine && (
                          <span className="shared-badge">공유됨 · {t.profiles?.name}</span>
                        )}
                      </div>
                    </div>
                    {t.context && <p className="template-card-context">{t.context}</p>}
                    <p className="template-card-content">{t.content}</p>
                    {t.tags?.length > 0 && (
                      <div className="template-tags">
                        {t.tags.map(tag => (
                          <span key={tag} className="template-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="template-card-meta">
                      사용 {t.use_count}회 · 수정 {t.template_histories?.length ?? 0}회
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

function TemplateDetail({ template, histories, stages, onBack, onUpdate, onDelete, userId }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: template.title,
    stage: template.stage,
    context: template.context ?? '',
    content: template.content,
    tags: Array.isArray(template.tags) ? template.tags.join(', ') : '',
    is_public: template.is_public
  })

  const isMine = template.user_id === userId

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSave = async () => {
    await onUpdate(form)
    setEditing(false)
  }

  return (
    <div className="template-detail">
      <button className="back-btn" onClick={onBack}>← 발화모음</button>

      <div className="template-detail-header">
        <div className="template-detail-top">
          <span className={`stage-badge stage-${template.stage}`}>{template.stage}</span>
          {template.is_public && <span className="shared-badge">공개</span>}
          {!isMine && <span className="shared-badge">공유됨 · {template.profiles?.name}</span>}
        </div>

        {editing ? (
          <div className="template-edit-form">
            <div className="form-field">
              <label className="form-label">제목</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">단계</label>
                <select className="form-input" name="stage" value={form.stage} onChange={handleChange}>
                  {stages.slice(1).map(s => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">공개 여부</label>
                <div className="toggle-wrap">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={form.is_public}
                    onChange={handleChange}
                    id="edit_public"
                  />
                  <label htmlFor="edit_public" className="toggle-label">전체 공개</label>
                </div>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">사용 맥락</label>
              <input className="form-input" name="context" value={form.context} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">내용</label>
              <textarea
                className="form-input"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={8}
                style={{ resize: 'none', lineHeight: 1.6 }}
              />
            </div>
            <div className="form-field">
              <label className="form-label">태그</label>
              <input className="form-input" name="tags" value={form.tags} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button className="form-btn-cancel" onClick={() => setEditing(false)}>취소</button>
              <button className="form-btn-submit" onClick={handleSave}>저장</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="detail-name">{template.title}</h1>
            {template.context && <p className="template-detail-context">{template.context}</p>}
            <div className="template-detail-content">{template.content}</div>
            {template.tags?.length > 0 && (
              <div className="template-tags">
                {template.tags.map(tag => (
                  <span key={tag} className="template-tag">#{tag}</span>
                ))}
              </div>
            )}
            <p className="template-card-meta">사용 {template.use_count}회</p>
            {isMine && (
              <div className="form-actions">
                <button className="form-btn-cancel" onClick={onDelete}>삭제</button>
                <button className="form-btn-submit" onClick={() => setEditing(true)}>수정</button>
              </div>
            )}
          </>
        )}
      </div>

      {histories.length > 0 && (
        <div className="template-histories">
          <p className="dash-card-title">수정 이력</p>
          {histories.map(h => (
            <div key={h.id} className="history-item">
              <p className="history-date">{new Date(h.changed_at).toLocaleDateString('ko-KR')}</p>
              <p className="history-content">{h.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}