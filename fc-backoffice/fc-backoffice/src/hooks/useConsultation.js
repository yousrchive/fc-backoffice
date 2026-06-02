import { useState, useEffect, useCallback } from 'react'
import { consultationService } from '../services/consultationService'

const STAGES = ['니즈환기', '문제인식', '솔루션', '청약', '후속관리']

export function useConsultation(customerId) {
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchConsultation = useCallback(async () => {
    setLoading(true)
    try {
      let data = await consultationService.getByCustomer(customerId)
      if (!data) data = await consultationService.create(customerId)
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

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const goToStage = async (targetStage, currentNeeds, currentProblems, currentSolution) => {
    const currentIndex = STAGES.indexOf(consultation.current_stage)
    const targetIndex = STAGES.indexOf(targetStage)

    if (targetIndex <= currentIndex) return

    if (targetIndex > currentIndex + 1) {
      showToast(`${consultation.current_stage}를 먼저 완료해주세요`)
      return
    }

    // 완료 조건 체크
    if (consultation.current_stage === '니즈환기') {
      if (!currentNeeds?.need_type_id) {
        showToast('유입 경로를 선택해주세요')
        return
      }
    }

    if (consultation.current_stage === '문제인식') {
      if (!currentProblems || currentProblems.length === 0) {
        showToast('핵심 문제를 1개 이상 선택해주세요')
        return
      }
    }

    if (consultation.current_stage === '솔루션') {
      if (!currentSolution?.budget) {
        showToast('확보 예산을 입력해주세요')
        return
      }
    }

    try {
      const data = await consultationService.updateStage(consultation.id, targetStage)
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
    toast,
    activeStages,
    goToStage,
    STAGES
  }
}