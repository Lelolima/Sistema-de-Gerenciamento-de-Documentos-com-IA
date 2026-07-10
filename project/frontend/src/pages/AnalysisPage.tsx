import { useState } from 'react'
import { Brain, Smile, Users, FileText } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function AnalysisPage() {
  const { documents } = useAppStore()
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!selectedDocId) return

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/documents/analyze`, {
        documentId: selectedDocId,
      })
      setAnalysis(response.data)
    } catch (error) {
      console.error('Erro ao analisar documento')
    } finally {
      setLoading(false)
    }
  }

  const processedDocs = documents.filter(d => d.processed)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Análise de Documentos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Análise de sentimento, entidades e resumos com IA
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Selecionar Documento</h2>
        <select
          value={selectedDocId || ''}
          onChange={(e) => setSelectedDocId(e.target.value)}
          className="input"
        >
          <option value="">Selecione um documento...</option>
          {processedDocs.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          disabled={!selectedDocId || loading}
          className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Brain className="w-5 h-5" />
          {loading ? 'Analisando...' : 'Analisar Documento'}
        </button>
      </div>

      {analysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Smile className="w-6 h-6 text-yellow-500" />
                <h3 className="font-semibold">Sentimento</h3>
              </div>
              <div className="text-3xl font-bold">
                {analysis.sentiment?.label || 'N/A'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Confiança: {(analysis.sentiment?.confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold">Entidades</h3>
              </div>
              <div className="text-3xl font-bold">
                {analysis.entities?.length || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {analysis.entities?.map((e: any) => e.text).join(', ') || 'Nenhuma'}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold">Resumo</h3>
              </div>
              <p className="text-sm line-clamp-4">
                {analysis.summary || 'N/A'}
              </p>
            </div>
          </div>

          {analysis.entities && analysis.entities.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Entidades Nomeadas</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((entity: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm"
                  >
                    {entity.text} ({entity.type})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}