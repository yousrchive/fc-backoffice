import { useLogin } from '../hooks/useLogin'
import '../styles/Login.css'

export default function Login() {
  const { isSignUp, setIsSignUp, form, loading, error, handleChange, handleSubmit } = useLogin()

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">FC Backoffice</h1>
        <p className="login-sub">{isSignUp ? '회원가입' : '로그인'}</p>

        {isSignUp && (
          <>
            <input className="login-input" name="name" placeholder="이름" value={form.name} onChange={handleChange} />
            <input className="login-input" name="team" placeholder="팀 (예: 솔루션1팀)" value={form.team} onChange={handleChange} />
            <input className="login-input" name="squad" placeholder="스쿼드 (예: 3스쿼드)" value={form.squad} onChange={handleChange} />
          </>
        )}

        <input className="login-input" name="email" placeholder="이메일" value={form.email} onChange={handleChange} />
        <input className="login-input" name="password" type="password" placeholder="비밀번호" value={form.password} onChange={handleChange} />

        {error && <p className="login-error">{error}</p>}

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
        </button>

        <p className="login-toggle" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? '이미 계정이 있어요' : '계정이 없어요'}
        </p>
      </div>
    </div>
  )
}