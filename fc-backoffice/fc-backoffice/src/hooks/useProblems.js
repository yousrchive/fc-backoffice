import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { problemsService } from '../services/problemsService'

export function useProblems(consultationId, customerId, userId) {
  const [problems, setProblems] = useState([])
  const [problemTypes, setProblemTypes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProblemTypes = useCallback(async () => {
    const { data } = await supabase
      .from('problem_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setProblemTypes(data)
  }, [])

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await problemsService.getByConsultation(consultationId)
      setProblems(data)
    } finally {
      setLoading(false)
    }
  }, [consultationId])

  useEffect(() => {
    fetchProblemTypes()
    if (consultationId) fetchProblems()
  }, [consultationId, fetchProblemTypes, fetchProblems])

  const toggleProblem = async (problemTypeId) => {
    await problemsService.toggle(consultationId, problemTypeId, customerId, userId)
    await fetchProblems()
  }

  const selectedIds = problems.map(p => p.problem_type_id)

  return {
    problems,
    problemTypes,
    selectedIds,
    loading,
    toggleProblem
  }
}