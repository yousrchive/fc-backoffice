import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { solutionService } from '../services/solutionService'

export function useSolution(consultationId, customerId, userId) {
  const [solution, setSolution] = useState(null)
  const [insurerTypes, setInsurerTypes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInsurerTypes = useCallback(async () => {
    const { data } = await supabase
      .from('insurer_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setInsurerTypes(data)
  }, [])

  const fetchSolution = useCallback(async () => {
    setLoading(true)
    try {
      const data = await solutionService.getByConsultation(consultationId)
      setSolution(data)
    } finally {
      setLoading(false)
    }
  }, [consultationId])

  useEffect(() => {
    fetchInsurerTypes()
    if (consultationId) fetchSolution()
  }, [consultationId, fetchInsurerTypes, fetchSolution])

  const updateSolution = async (updates) => {
    const data = await solutionService.upsert(consultationId, updates, customerId, userId)
    setSolution(prev => ({ ...prev, ...data }))
    return data
  }

  const addCoverage = async (coverage) => {
    if (!solution?.id) {
      const data = await solutionService.upsert(consultationId, {}, customerId, userId)
      setSolution(data)
      const cov = await solutionService.addCoverage(data.id, coverage)
      setSolution(prev => ({ ...prev, coverages: [...(prev?.coverages ?? []), cov] }))
      return cov
    }
    const cov = await solutionService.addCoverage(solution.id, coverage)
    setSolution(prev => ({ ...prev, coverages: [...(prev?.coverages ?? []), cov] }))
    return cov
  }

  const deleteCoverage = async (id) => {
    await solutionService.deleteCoverage(id)
    setSolution(prev => ({ ...prev, coverages: prev?.coverages?.filter(c => c.id !== id) }))
  }

  const updateInsurerResult = async (insurerTypeId, updates) => {
    if (!solution?.id) {
      const data = await solutionService.upsert(consultationId, {}, customerId, userId)
      setSolution(data)
      await solutionService.upsertInsurerResult(data.id, insurerTypeId, updates)
    } else {
      await solutionService.upsertInsurerResult(solution.id, insurerTypeId, updates)
    }
    await fetchSolution()
  }

  const updateFinalCombo = async (rank, updates) => {
    if (!solution?.id) {
      const data = await solutionService.upsert(consultationId, {}, customerId, userId)
      setSolution(data)
      await solutionService.upsertFinalCombo(data.id, rank, updates)
    } else {
      await solutionService.upsertFinalCombo(solution.id, rank, updates)
    }
    await fetchSolution()
  }

  return {
    solution,
    insurerTypes,
    loading,
    updateSolution,
    addCoverage,
    deleteCoverage,
    updateInsurerResult,
    updateFinalCombo,
    fetchSolution
  }
}