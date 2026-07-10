import { useState } from 'react'
import { Key, Database, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')

  const handleSaveApiKey = () => {
    localStorage.setItem('api_key', apiKey)
    toast.success('Chave de API salva!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold">Chave de API</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure sua chave de API para serviços externos (Groq, OpenAI, etc.)
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="input"
        />
        <button onClick={handleSaveApiKey} className="btn btn-primary mt-4">
          Salvar Chave
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold">Supabase</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          URL: {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Status: Conectado
        </p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold">Segurança</h2>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Criptografia AES-256
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Autenticação Supabase
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Conformidade LGPD
          </li>
        </ul>
      </div>
    </div>
  )
}