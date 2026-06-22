import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../hooks/useCustomers'
import '../styles/CustomerList.css'

const STAGE_ORDER = ['니즈환기', '문제인식', '솔루션', '청약', '후속관리']
const STAGE_CLASS = {
  '니즈환기': 'stage-needs',
  '문제인식': 'stage-problem',
  '솔루션': 'stage-solution',
  '청약': 'stage-contract',
  '후속관리': 'stage-crm',
}

function getFurthestStage(consultations) {
  if (!consultations?.length) return '니즈환기'
  const maxIdx = consultations.reduce((max, c) => {
    const idx = STAGE_ORDER.indexOf(c.current_stage ?? '')
    return idx > max ? idx : max
  }, 0)
  return STAGE_ORDER[maxIdx]
}

function getLatestContact(conversations) {
  if (!conversations?.length) return null
  return conversations.reduce(
    (max, c) => (!max || c.talked_at > max) ? c.talked_at : max,
    null
  )
}

const SORT_OPTIONS = [
  { key: 'recent', label: '최신연락순' },
  { key: 'alpha', label: '가나다순' },
  { key: 'stage', label: '단계순' },
]

export default function CustomerList() {
  const { customers, loading } = useCustomers()
  const navigate = useNavigate()
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    let list = customers
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) || c.room_code?.toLowerCase().includes(q)
      )
    }
    if (sort === 'alpha') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    }
    if (sort === 'recent') {
      return [...list].sort((a, b) => {
        const la = getLatestContact(a.conversations) ?? a.started_at ?? ''
        const lb = getLatestContact(b.conversations) ?? b.started_at ?? ''
        return lb > la ? 1 : -1
      })
    }
    if (sort === 'stage') {
      return [...list].sort((a, b) => {
        const ia = STAGE_ORDER.indexOf(getFurthestStage(a.consultations))
        const ib = STAGE_ORDER.indexOf(getFurthestStage(b.consultations))
        return ia - ib
      })
    }
    return list
  }, [customers, sort, search])

  if (loading) return <p className="page-loading">불러오는 중...</p>

  return (
    <div className="cl-wrap">
      <div className="cl-header">
        <div>
          <h1 className="page-title">고객</h1>
          <p className="page-sub">총 {customers.length}명</p>
        </div>
      </div>

      <div className="cl-controls">
        <input
          className="cl-search"
          placeholder="이름 또는 방코드 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="cl-sort-row">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`chip ${sort === opt.key ? 'chip-active' : ''}`}
              onClick={() => setSort(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="cl-empty">고객이 없어요</p>
      ) : (
        <div className="cl-list">
          {sorted.map(customer => {
            const stage = getFurthestStage(customer.consultations)
            const latestContact = getLatestContact(customer.conversations)
            return (
              <div
                key={customer.id}
                className="cl-item"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="cl-item-left">
                  <div className="cl-emoji">{customer.emoji}</div>
                  <div className="cl-item-info">
                    <p className="cl-name">{customer.name}</p>
                    <p className="cl-meta">
                      {customer.room_code}{latestContact ? ` · ${latestContact}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`cl-stage-chip ${STAGE_CLASS[stage]}`}>
                  {stage}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
