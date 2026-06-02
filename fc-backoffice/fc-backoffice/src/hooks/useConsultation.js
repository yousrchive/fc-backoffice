import { useState, useEffect, useCallback } from 'react'
import { consultationService } from '../services/consultationService'

const STAGES = ['니즈환기', '문제인식', '솔루션', '청약', '후속관리']

export function useConsultation(customerId) {
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConsultation = useCallback(async () => {
    setLoading(true)
    try {
      let data = await consultationService.getByCustomer(customerId)
      if (!data) {
        data = await consultationService.create(customerId)
      }
      setConsultation(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (customerId) fetchConsultation()
  }, [customerId, fetchConsultation])

  const advanceStage = async () => {
    const currentIndex = STAGES.indexOf(consultation.current_stage)
    if (currentIndex >= STAGES.length - 1) return
    const nextStage = STAGES[currentIndex + 1]
    try {
      const data = await consultationService.updateStage(consultation.id, nextStage)
      setConsultation(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const activeStages = consultation
    ? STAGES.slice(0, STAGES.indexOf(consultation.current_stage) + 1)
    : ['니즈환기']

  return {
    consultation,
    loading,
    error,
    activeStages,
    advanceStage,
    STAGES
  }
}