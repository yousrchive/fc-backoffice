import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { needsService } from '../services/needsService'

export function useNeeds(consultationId, customerId, userId) {
  const [needs, setNeeds] = useState(null)
  const [needTypes, setNeedTypes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNeedTypes = useCallback(async () => {
    const { data } = await supabase
      .from('need_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setNeedTypes(data)
  }, [])

  const fetchNeeds = useCallback(async () => {
    if (!consultationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await needsService.getByConsultation(consultationId)
      console.log('[useNeeds] fetch result:', data, '| consultationId:', consultationId)
      setNeeds(data)
    } catch (err) {
      console.error('[useNeeds] fetchNeeds error:', err)
    } finally {
      setLoading(false)
    }
  }, [consultationId])

  useEffect(() => {
    fetchNeedTypes()
    fetchNeeds()
  }, [fetchNeedTypes, fetchNeeds])

  const updateNeeds = async (updates) => {
    if (!consultationId) return null
    const data = await needsService.upsert(consultationId, updates, customerId, userId)
    if (data) setNeeds(data)
    return data
  }

  return { needs, needTypes, loading, updateNeeds }
}
