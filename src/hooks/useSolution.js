import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { solutionService } from '../services/solutionService'

export function useSolution(consultationId, customerId, userId) {
  const [solution, setSolution] = useState(null)
  const [insurerTypes, setInsurerTypes] = useState([])
  const [coverageTags, setCoverageTags] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInsurerTypes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('insurer_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (data) setInsurerTypes(data)
    } catch (_) {}
  }, [])

  const fetchCoverageTags = useCallback(async () => {
    try {
      const tags = await solutionService.getCoverageTags()
      setCoverageTags(tags)
    } catch (_) {}
  }, [])

  const fetchSolution = useCallback(async () => {
    if (!consultationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await solutionService.getByConsultation(consultationId)
      setSolution(data)
    } catch (err) {
      console.error('fetchSolution:', err)
    } finally {
      setLoading(false)
    }
  }, [consultationId])

  useEffect(() => {
    fetchInsurerTypes()
    fetchCoverageTags()
    fetchSolution()
  }, [fetchInsurerTypes, fetchCoverageTags, fetchSolution])

  const ensureSolution = useCallback(async () => {
    if (solution?.id) return solution
    if (!consultationId) return null
    try {
      const data = await solutionService.upsert(consultationId, {}, customerId, userId)
      if (data) setSolution(data)
      return data
    } catch (err) {
      console.error('ensureSolution:', err)
      return null
    }
  }, [solution, consultationId, customerId, userId])

  const updateSolution = async (updates) => {
    if (!consultationId) return null
    try {
      await ensureSolution()
      const data = await solutionService.upsert(consultationId, updates, customerId, userId)
      if (data) setSolution(prev => ({ ...(prev ?? {}), ...data }))
      return data
    } catch (err) {
      console.error('updateSolution:', err)
      return null
    }
  }

  const addCoverage = async (coverage) => {
    const sol = await ensureSolution()
    if (!sol?.id) return null
    try {
      const cov = await solutionService.addCoverage(sol.id, coverage)
      if (cov) setSolution(prev => ({ ...prev, coverages: [...(prev?.coverages ?? []), cov] }))
      return cov
    } catch (err) {
      console.error('addCoverage:', err)
      return null
    }
  }

  const deleteCoverage = async (id) => {
    setSolution(prev => ({ ...prev, coverages: prev?.coverages?.filter(c => c.id !== id) }))
    try {
      await solutionService.deleteCoverage(id)
    } catch (err) {
      console.error('deleteCoverage:', err)
    }
  }

  const updateInsurerResult = async (insurerTypeId, updates) => {
    const sol = await ensureSolution()
    if (!sol?.id) return
    try {
      await solutionService.upsertInsurerResult(sol.id, insurerTypeId, updates)
      await fetchSolution()
    } catch (err) {
      console.error('updateInsurerResult:', err)
    }
  }

  const updateFinalCombo = async (rank, updates) => {
    const sol = await ensureSolution()
    if (!sol?.id) return
    try {
      await solutionService.upsertFinalCombo(sol.id, rank, updates)
      await fetchSolution()
    } catch (err) {
      console.error('updateFinalCombo:', err)
    }
  }

  const updateAdjustmentCombo = async (updates) => {
    const sol = await ensureSolution()
    if (!sol?.id) return
    try {
      await solutionService.upsertAdjustmentCombo(sol.id, updates)
      await fetchSolution()
    } catch (err) {
      console.error('updateAdjustmentCombo:', err)
    }
  }

  const uploadPdf = async (file, solutionId, comboId) => {
    try {
      return await solutionService.uploadPdf(file, solutionId, comboId)
    } catch (err) {
      console.error('uploadPdf:', err)
      return null
    }
  }

  return {
    solution,
    insurerTypes,
    coverageTags,
    loading,
    updateSolution,
    addCoverage,
    deleteCoverage,
    updateInsurerResult,
    updateFinalCombo,
    updateAdjustmentCombo,
    uploadPdf,
    fetchSolution,
  }
}
