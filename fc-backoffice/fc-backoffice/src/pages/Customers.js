import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../hooks/useCustomers'
import CustomerCard from '../components/customer/CustomerCard'
import '../styles/Customers.css'

export default function Customers() {
  const { customers, loading, addCustomer } = useCustomers()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', room_code: '', started_at: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    if (!form.name || !form.room_code || !form.started_at) return
    await addCustomer(form)
    setForm({ name: '', room_code: '', started_at: '' })
    setShowForm(false)
  }

  if (loading) return <p className="page-loading">불러오는 중...</p>

  return (
    <div className="customers-wrap">
      <div className="customers-header">
        <div>
          <h1 className="page-title">고객</h1>
          <p className="page-sub">총 {customers.length}명</p>
        </div>
        <button className="add-btn" onClick={() => setShowForm(true)}>+ 고객 추가</button>
      </div>

      {showForm && (
        <div className="add-form">
          <input className="form-input" name="name" placeholder="이름" value={form.name} onChange={handleChange} />
          <input className="form-input" name="room_code" placeholder="방코드" value={form.room_code} onChange={handleChange} />
          <input className="form-input" name="started_at" type="date" value={form.started_at} onChange={handleChange} />
          <div className="form-actions">
            <button className="form-btn-cancel" onClick={() => setShowForm(false)}>취소</button>
            <button className="form-btn-submit" onClick={handleAdd}>추가</button>
          </div>
        </div>
      )}

      <div className="customers-list">
        {customers.length === 0 ? (
          <p className="empty-text">아직 고객이 없어요. 첫 고객을 추가해보세요!</p>
        ) : (
          customers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={(c) => navigate(`/customers/${c.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}