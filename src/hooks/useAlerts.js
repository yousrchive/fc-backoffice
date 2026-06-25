import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { alertService } from '../services/alertService'

export function useAlerts(customerId) {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await alertService.getByCustomer(customerId)
      setAlerts(data)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (customerId) fetchAlerts()
  }, [customerId, fetchAlerts])

  const addAlert = async (alert) => {
    const data = await alertService.create({
      ...alert,
      customer_id: customerId,
      user_id: user.id
    })
    setAlerts(prev => [...prev, data].sort((a, b) => new Date(a.alert_at) - new Date(b.alert_at)))
    return data
  }

  const toggleDone = async (id, isDone) => {
    const data = await alertService.toggleDone(id, isDone)
    setAlerts(prev => prev.map(a => a.id === id ? data : a))
  }

  const deleteAlert = async (id) => {
    await alertService.delete(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const pendingAlerts = alerts.filter(a => !a.is_done)
  const doneAlerts = alerts.filter(a => a.is_done)

  return {
    alerts,
    pendingAlerts,
    doneAlerts,
    loading,
    addAlert,
    toggleDone,
    deleteAlert,
    fetchAlerts
  }
}