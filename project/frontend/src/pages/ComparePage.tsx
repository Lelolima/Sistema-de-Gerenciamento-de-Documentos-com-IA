import { useState } from 'react'
import { GitCompare, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function ComparePage() {
  const { documents, selectedDocuments, toggleSelectDocument } = useAppStore()
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (selectedDocuments.length !== 2) return

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/documents/compare`, {
        doc1Id: selectedDocuments[0],
        doc2Id: selectedDocuments[1],
      })
      setComparison(response.data)
    } catch (error) {
      console.error('Erro ao comparar documentos')
    } finally {
      setLoading(false)
    }
  }

  const selectableDocs = documents.filter(d => d.processed)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comparar Documentos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione dois documentos para ver as diferenças
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {selectableDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => toggleSelectDocument(doc.id)}
            className={`card cursor-pointer transition-all ${
              selectedDocuments.includes(doc.id)
                ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <GitCompare
                className={`w-6 h-6 ${
                  selectedDocuments.includes(doc.id)
                    ? 'text-primary-500'
                    : 'text-gray-400'
                }`}
              />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCompare}
        disabled={selectedDocuments.length !== 2 || loading}
        className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <GitCompare className="w-5 h-5" />
        {loading ? 'Comparando...' : 'Comparar Documentos'}
      </button>

      {comparison && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Resultado da Comparação</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Documento 1</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-96">
                {comparison.doc1_text}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Documento 2</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-96">
                {comparison.doc2_text}
              </pre>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded">
            <p><strong>Similaridade:</strong> {comparison.similarity}%</p>
            <p><strong>Diferenças:</strong> {comparison.differences?.length || 0}</p>
          </div>
        </div>
      )}
    </div>
  )
}