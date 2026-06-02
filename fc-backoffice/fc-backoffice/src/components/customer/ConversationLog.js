import '../../styles/ConversationLog.css'

function groupByDate(conversations, customers) {
  const map = {}
  conversations.forEach(conv => {
    const date = conv.talked_at?.slice(0, 10)
    if (!map[date]) map[date] = []
    const customer = customers.find(c => c.id === conv.customer_id)
    if (customer) {
      map[date].push({ ...conv, customer })
    }
  })
  // 날짜별 클러스터 내에서 updated_at 최신순 정렬
  Object.keys(map).forEach(date => {
    map[date].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  })
  return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today) return '오늘'
  if (dateStr === yesterday) return '어제'
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

const STAGE_MAP = {
  '니즈환기': 'stage-needs',
  '문제인식': 'stage-problem',
  '솔루션': 'stage-solution',
  '청약': 'stage-contract',
  '후속관리': 'stage-crm',
}

export default function ConversationLog({ conversations, customers, onSelect }) {
  const grouped = groupByDate(conversations, customers)

  if (grouped.length === 0) return (
    <p className="log-empty">아직 기록이 없어요</p>
  )

  return (
    <div className="log-wrap">
      {grouped.map(([date, convs]) => (
        <div key={date} className="log-group">
          <p className="log-date">{formatDate(date)}</p>
          <div className="log-list">
            {convs.map(conv => (
              <div
                key={conv.id}
                className="log-item"
                onClick={() => onSelect(conv.customer)}
              >
                <div className="log-left">
                  <div className="log-avatar">{conv.customer?.emoji}</div>
                  <div className="log-info">
                    <p className="log-name">{conv.customer?.name}</p>
                    <p className="log-meta">{conv.customer?.room_code} · {conv.customer?.started_at}</p>
                  </div>
                </div>
                <div className="log-right">
                  {conv.design_agreed && <span className="design-chip">설계동의</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}