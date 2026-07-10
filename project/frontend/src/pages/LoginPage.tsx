import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(isLogin ? 'Login realizado!' : 'Conta criada! Verifique seu email.')
        if (isLogin) {
          navigate('/')
        }
      }
    } catch (err) {
      toast.error('Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DocManager IA</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerenciamento inteligente de documentos
          </p>
        </div>

        <div className="card">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 ${
                isLogin
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-500'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 ${
                !isLogin
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-500'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}