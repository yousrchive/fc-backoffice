import { useState, useEffect } from 'react'
import { useAlerts } from '../../hooks/useAlerts'
import { consultationService } from '../../services/consultationService'
import '../../styles/AlertModal.css'

const QUICK_OPTIONS = [
  { label: '내일', days: 1 },
  { label: '3일 후', days: 3 },
  { label: '1주일 후', days: 7 },
  { label: '2주일 후', days: 14 },
  { label: '1개월 후', days: 30 },
]

export default function AlertModal({ customerId, onClose }) {
  const { alerts, pendingAlerts, doneAlerts, loading, addAlert, toggleDone, deleteAlert } = useAlerts(customerId)
  const [stages, setStages] = useState([])
  const [form, setForm] = useState({
    content: '',
    stage: '',
    alert_at: ''
  })

  useEffect(() => {
    consultationService.getStages().then(data => {
      setStages([...data, { id: 'etc', label: '기타' }])
    })
  }, [])

  const handleQuick = (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(9, 0, 0, 0)
    setForm({ ...form, alert_at: date.toISOString().slice(0, 16) })
  }

  const handleAdd = async () => {
    if (!form.content || !form.alert_at) return
    await addAlert({
      content: form.content,
      stage: form.stage || null,
      alert_at: new Date(form.alert_at).toISOString()
    })
    setForm({ content: '', stage: '', alert_at: '' })
  }

  const formatAlertAt = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <p className="modal-title">알림 관리</p>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert-add-section">
            <div className="form-field">
              <label className="form-label">알림 내용</label>
              <input
                className="form-input"
                placeholder="예: 3일 후 리터치 연락하기"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label">단계 (선택)</label>
              <div className="chip-group">
                {stages.map(s => (
                  <button
                    key={s.id}
                    className={`chip ${form.stage === s.label ? 'chip-active' : ''}`}
                    onClick={() => setForm({ ...form, stage: form.stage === s.label ? '' : s.label })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">알림 시각</label>
              <div className="quick-options">
                {QUICK_OPTIONS.map(q => (
                  <button
                    key={q.label}
                    className="quick-btn"
                    onClick={() => handleQuick(q.days)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <input
                className="form-input"
                type="datetime-local"
                value={form.alert_at}
                onChange={e => setForm({ ...form, alert_at: e.target.value })}
              />
            </div>

            <button className="form-btn-submit" style={{ width: '100%' }} onClick={handleAdd}>
              알림 추가
            </button>
          </div>

          {pendingAlerts.length > 0 && (
            <div className="alert-list-section">
              <p className="alert-section-label">예정된 알림</p>
              {pendingAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-item-left">
                    <button className="alert-check" onClick={() => toggleDone(alert.id, true)}>○</button>
                    <div className="alert-item-info">
                      <p className="alert-content">{alert.content}</p>
                      <div className="alert-meta">
                        {alert.stage && <span className="alert-stage-chip">{alert.stage}</span>}
                        <span className="alert-time">{formatAlertAt(alert.alert_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="alert-delete" onClick={() => deleteAlert(alert.id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {doneAlerts.length > 0 && (
            <div className="alert-list-section">
              <p className="alert-section-label">완료된 알림</p>
              {doneAlerts.map(alert => (
                <div key={alert.id} className="alert-item alert-item-done">
                  <div className="alert-item-left">
                    <button className="alert-check alert-check-done" onClick={() => toggleDone(alert.id, false)}>✓</button>
                    <div className="alert-item-info">
                      <p className="alert-content alert-content-done">{alert.content}</p>
                      <div className="alert-meta">
                        {alert.stage && <span className="alert-stage-chip">{alert.stage}</span>}
                        <span className="alert-time">{formatAlertAt(alert.alert_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="alert-delete" onClick={() => deleteAlert(alert.id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <p className="alert-empty">등록된 알림이 없어요</p>
          )}
        </div>
      </div>
    </div>
  )
}