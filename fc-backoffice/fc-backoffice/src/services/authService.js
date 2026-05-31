import { supabase } from '../lib/supabase'

export const authService = {
  async signUp({ email, password, name, team, squad }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name, team, squad })
    if (profileError) throw profileError

    return data
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}