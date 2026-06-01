import '../../styles/CustomerCard.css'

const STAGE_MAP = {
  '니즈환기': { label: '니즈환기', color: 'stage-needs' },
  '문제인식': { label: '문제인식', color: 'stage-problem' },
  '솔루션': { label: '솔루션', color: 'stage-solution' },
  '청약': { label: '청약', color: 'stage-contract' },
  'CRM': { label: 'CRM', color: 'stage-crm' },
}

const EMOJI_LIST = ['🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙']

function getEmoji(id) {
  const index = id?.charCodeAt(0) % EMOJI_LIST.length
  return EMOJI_LIST[index ?? 0]
}

export default function CustomerCard({ customer, onClick }) {
  const stage = STAGE_MAP[customer.stage] ?? { label: '미정', color: 'stage-none' }

  return (
    <div className="customer-card" onClick={() => onClick(customer)}>
      <div className="customer-card-left">
        <div className="customer-emoji">{getEmoji(customer.id)}</div>
        <div className="customer-info">
          <p className="customer-name">{customer.name}</p>
          <p className="customer-meta">{customer.room_code} · {customer.started_at}</p>
        </div>
      </div>
      <span className={`stage-badge ${stage.color}`}>{stage.label}</span>
    </div>
  )
}