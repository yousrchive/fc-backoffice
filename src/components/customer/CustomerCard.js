import '../../styles/CustomerCard.css'

const STAGE_MAP = {
  '니즈환기': { label: '니즈환기', color: 'stage-needs' },
  '문제인식': { label: '문제인식', color: 'stage-problem' },
  '솔루션': { label: '솔루션', color: 'stage-solution' },
  '청약': { label: '청약', color: 'stage-contract' },
  '후속관리': { label: '후속관리', color: 'stage-crm' },
}

export default function CustomerCard({ customer, onClick }) {
  const stage = customer.consultations?.[0]?.current_stage
  const stageInfo = STAGE_MAP[stage] ?? { label: '미정', color: 'stage-none' }

  return (
    <div className="customer-card" onClick={() => onClick(customer)}>
      <div className="customer-card-left">
        <div className="customer-emoji">{customer.emoji}</div>
        <div className="customer-info">
          <p className="customer-name">{customer.name}</p>
          <p className="customer-meta">{customer.room_code} · {customer.started_at}</p>
        </div>
      </div>
      <span className={`stage-badge ${stageInfo.color}`}>{stageInfo.label}</span>
    </div>
  )
}