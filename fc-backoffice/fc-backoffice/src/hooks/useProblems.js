import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { problemsService } from '../services/problemsService'

export function useProblems(consultationId, customerId, userId) {
  const [problems, setProblems] = useState([])
  const [problemTypes, setProblemTypes] = useState([])
  const [summary, setSummary] = useState(null)
  const [problemInsurances, setProblemInsurances] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProblemTypes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('problem_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (data) setProblemTypes(data)
    } catch (_) {}
  }, [])

  const fetchProblems = useCallback(async () => {
    if (!consultationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [data, sum, ins] = await Promise.all([
        problemsService.getByConsultation(consultationId),
        problemsService.getSummary(consultationId).catch(() => null),
        problemsService.getProblemInsurances(consultationId).catch(() => []),
      ])
      setProblems(data ?? [])
      setSummary(sum)
      setProblemInsurances(ins ?? [])
    } catch (err) {
      console.error('fetchProblems:', err)
    } finally {
      setLoading(false)
    }
  }, [consultationId])

  useEffect(() => {
    fetchProblemTypes()
    fetchProblems()
  }, [fetchProblemTypes, fetchProblems])

  const toggleProblem = async (problemTypeId) => {
    try {
      await problemsService.toggle(consultationId, problemTypeId, customerId, userId)
      await fetchProblems()
    } catch (err) {
      console.error('toggleProblem:', err)
    }
  }

  const updateSummary = async (updates) => {
    try {
      const data = await problemsService.upsertSummary(consultationId, updates)
      if (data) setSummary(prev => ({ ...(prev ?? {}), ...data }))
    } catch (err) {
      console.error('updateSummary:', err)
    }
  }

  const addProblemInsurance = async (name) => {
    if (!name.trim()) return
    const tempId = `temp-${Date.now()}`
    const tempItem = { id: tempId, name: name.trim(), consultation_id: consultationId }
    setProblemInsurances(prev => [...prev, tempItem])
    try {
      const ins = await problemsService.addProblemInsurance(consultationId, name.trim())
      if (ins) setProblemInsurances(prev => prev.map(i => i.id === tempId ? ins : i))
    } catch (_) {}
  }

  const updateProblemInsurance = async (id, updates) => {
    setProblemInsurances(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    if (!String(id).startsWith('temp-')) {
      try { await problemsService.updateProblemInsurance(id, updates) } catch (_) {}
    }
  }

  const deleteProblemInsurance = async (id) => {
    setProblemInsurances(prev => prev.filter(i => i.id !== id))
    if (!String(id).startsWith('temp-')) {
      try {
        await problemsService.deleteProblemInsurance(id)
      } catch (_) {}
    }
  }

  const selectedIds = problems.map(p => p.problem_type_id)

  const groupedTypes = problemTypes.reduce((acc, pt) => {
    const cat = pt.category ?? '핵심 문제'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(pt)
    return acc
  }, {})

  return {
    problems,
    problemTypes,
    groupedTypes,
    selectedIds,
    summary,
    problemInsurances,
    loading,
    toggleProblem,
    updateSummary,
    addProblemInsurance,
    updateProblemInsurance,
    deleteProblemInsurance,
  }
}
