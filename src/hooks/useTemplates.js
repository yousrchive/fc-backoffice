import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { templateService } from '../services/templateService'
import { consultationService } from '../services/consultationService'

export function useTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('전체')

  const fetchStages = useCallback(async () => {
    try {
    const data = await consultationService.getStages()
      setStages([{ id: 'all', label: '전체' }, ...data])
    } catch (error) {
      console.error('Failed to fetch stages:', error)
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const data = await templateService.getAll(user.id)
      setTemplates(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStages()
    if (user) fetchTemplates()
  }, [user, fetchTemplates, fetchStages])

  const addTemplate = async (template) => {
    const data = await templateService.create(user.id, template)
    setTemplates(prev => [data, ...prev])
    return data
  }

  const updateTemplate = async (id, updates, oldContent) => {
    const data = await templateService.update(id, updates, oldContent)
    setTemplates(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTemplate = async (id) => {
    await templateService.delete(id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const filteredTemplates = templates.filter(t => {
    const ownerMatch = filter === 'all' || t.user_id === user.id
    const stageMatch = stageFilter === '전체' || t.stage === stageFilter
    return ownerMatch && stageMatch
  })

  return {
    templates: filteredTemplates,
    allTemplates: templates,
    stages,
    loading,
    filter,
    setFilter,
    stageFilter,
    setStageFilter,
    fetchTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate
  }
}