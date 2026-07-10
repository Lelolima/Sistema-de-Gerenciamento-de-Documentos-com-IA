import { FileText, Upload, Compare, Brain, TrendingUp } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function DashboardPage() {
  const { documents } = useAppStore()

  const stats = [
    { name: 'Documentos', value: documents.length, icon: FileText, color: 'text-blue-500' },
    { name: 'Processados', value: documents.filter(d => d.processed).length, icon: Brain, color: 'text-green-500' },
    { name: 'Comparados', value: 0, icon: Compare, color: 'text-purple-500' },
    { name: 'Análises', value: documents.filter(d => d.analysis).length, icon: TrendingUp, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral dos seus documentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className={`w-12 h-12 ${stat.color} opacity-20`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Documentos Recentes</h2>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum documento enviado ainda</p>
            <a href="/documents" className="text-primary-500 hover:underline mt-2 inline-block">
              Enviar primeiro documento →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span>{doc.name}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    doc.processed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {doc.processed ? 'Processado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}