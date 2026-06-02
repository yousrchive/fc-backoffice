import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { conversationService } from '../services/conversationService'

export function useConversations(customerId) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await conversationService.getByCustomer(customerId)
      setConversations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (customerId) fetchConversations()
  }, [customerId, fetchConversations])

  const addConversation = async (conversation) => {
    try {
      const data = await conversationService.create({ ...conversation, user_id: user.id, customer_id: customerId })
      setConversations(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
    }
  }

  const updateConversation = async (id, updates) => {
    try {
      const data = await conversationService.update(id, updates)
      setConversations(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteConversation = async (id) => {
    try {
      await conversationService.delete(id)
      setConversations(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    addConversation,
    updateConversation,
    deleteConversation
  }
}