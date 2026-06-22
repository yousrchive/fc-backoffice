import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCustomers } from '../hooks/useCustomers'
import { conversationService } from '../services/conversationService'
import { supabase } from '../lib/supabase'
import CustomerCard from '../components/customer/CustomerCard'
import CustomerSlider from '../components/customer/CustomerSlider'
import ConversationLog from '../components/customer/ConversationLog'
import '../styles/Customers.css'

const EMOJI_LIST = ['🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦋', '🌸', '🍀', '⭐', '🌙']
const today = new Date().toISOString().slice(0, 10)

function randomEmoji() {
  return EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)]
}

const defaultForm = () => ({
  name: '',
  room_code: '',
  phone: '',
  started_at: today,
  birth_date: '',
  emoji: randomEmoji()
})

export default function Customers() {
  const { user } = useAuth()
  const { customers, loading, addCustomer } = useCustomers()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [conversations, setConversations] = useState([])
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(defaultForm())

  const fetchConversations = useCallback(async () => {
    const data = await conversationService.getAll(user.id)
    if (data) setConversations(data)
  }, [user])

  const fetchProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }, [user])

  useEffect(() => {
    fetchConversations()
    fetchProfile()
  }, [fetchConversations, fetchProfile])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    if (!form.name || !form.room_code || !form.started_at) return
    await addCustomer(form)
    setForm(defaultForm())
    setShowForm(false)
    fetchConversations()
  }

  const handleClose = () => {
    setForm(defaultForm())
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

      <CustomerSlider
        customers={customers}
        conversations={conversations}
        goals={profile}
        onSelect={(c) => navigate(`/customers/${c.id}`)}
      />

      <div className="customers-divider">
        <p className="divider-label">최근 기록</p>
      </div>

      <ConversationLog
        conversations={conversations}
        customers={customers}
        onSelect={(c) => navigate(`/customers/${c.id}`)}
      />

      {showForm && (
        <>
          <div className="form-overlay" onClick={handleClose} />
          <div className="form-drawer">
            <div className="form-drawer-header">
              <p className="form-drawer-title">고객 추가</p>
              <button className="form-drawer-close" onClick={handleClose}>✕</button>
            </div>

            <div className="form-drawer-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">이름</label>
                  <input className="form-input" name="name" placeholder="고객 이름" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-field">
                  <label className="form-label">생년월일</label>
                  <input className="form-input" name="birth_date" placeholder="1990-01-01" value={form.birth_date} onChange={handleChange} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">전화번호</label>
                <input className="form-input" name="phone" placeholder="010-0000-0000" value={form.phone} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label className="form-label">방코드</label>
                <input className="form-input" name="room_code" placeholder="방코드" value={form.room_code} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label className="form-label">대화 시작일</label>
                <input className="form-input" name="started_at" placeholder="2026-06-02" value={form.started_at} onChange={handleChange} />
              </div>
            </div>

            <div className="form-drawer-footer">
              <button className="form-btn-cancel" onClick={handleClose}>취소</button>
              <button className="form-btn-submit" onClick={handleAdd}>추가</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}