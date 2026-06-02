import '../../styles/CustomerSlider.css'

function isToday(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr?.slice(0, 10) === today
}

export default function CustomerSlider({ customers, conversations, goals, onSelect }) {
  const todayCustomers = customers.filter(c =>
    conversations.some(conv => conv.customer_id === c.id && isToday(conv.talked_at))
  )

  const designAgreedCustomers = customers.filter(c =>
    conversations.some(conv => conv.customer_id === c.id && conv.design_agreed)
  )

  const todayGoalMet = todayCustomers.length >= (goals?.daily_consult_goal ?? 8)

  const isDesignAgreedToday = (customerId) =>
    conversations.some(conv =>
      conv.customer_id === customerId &&
      conv.design_agreed &&
      isToday(conv.talked_at)
    )

  return (
    <div className="slider-section">
      <div className="slider-block">
        <div className="slider-header">
          <span className="slider-title">오늘 상담</span>
          <span className="slider-count">{todayCustomers.length}/{goals?.daily_consult_goal ?? 8}</span>
          {todayGoalMet && <span className="goal-chip">목표 달성 🎉</span>}
        </div>
        <div className="slider-box">
          {todayCustomers.length === 0 ? (
            <div className="slider-empty-box">
              <p className="slider-empty">오늘 상담한 고객이 없어요</p>
            </div>
          ) : (
            <div className="slider-wrap">
              <div className="slider-track">
                {todayCustomers.map(c => (
                  <div key={c.id} className="slider-item" onClick={() => onSelect(c)}>
                    <div className="slider-avatar avatar-active">{c.emoji}</div>
                    <p className="slider-name name-active">{c.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="slider-block">
        <div className="slider-header">
          <span className="slider-title">가입설계 동의</span>
          <span className="slider-count">{designAgreedCustomers.length}/{goals?.daily_design_goal ?? 3}</span>
        </div>
        <div className="slider-box">
          {designAgreedCustomers.length === 0 ? (
            <div className="slider-empty-box">
              <p className="slider-empty">가입설계 동의한 고객이 없어요</p>
            </div>
          ) : (
            <div className="slider-wrap">
              <div className="slider-track">
                {designAgreedCustomers.map(c => {
                  const fresh = isDesignAgreedToday(c.id)
                  return (
                    <div key={c.id} className="slider-item" onClick={() => onSelect(c)}>
                      <div className={`slider-avatar ${fresh ? 'avatar-fresh' : 'avatar-dim'}`}>{c.emoji}</div>
                      <p className={`slider-name ${fresh ? 'name-active' : 'name-dim'}`}>{c.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}