// 로직 커버하는 로그인 훅

import { useState } from 'react'
import { authService } from '../services/authService'

export function useLogin() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', team: '', squad: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isSignUp) {
        await authService.signUp(form)
      } else {
        await authService.signIn(form)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    isSignUp,
    setIsSignUp,
    form,
    loading,
    error,
    handleChange,
    handleSubmit
  }
}