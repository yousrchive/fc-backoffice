import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { customerService } from '../services/customerService'

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await customerService.getAll(user.id)
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchCustomers()
  }, [user, fetchCustomers])

  const addCustomer = async (customer) => {
    try {
      const data = await customerService.create({ ...customer, user_id: user.id })
      setCustomers(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
    }
  }

  const updateCustomer = async (id, updates) => {
    try {
      const data = await customerService.update(id, updates)
      setCustomers(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteCustomer = async (id) => {
    try {
      await customerService.delete(id)
      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  }
}