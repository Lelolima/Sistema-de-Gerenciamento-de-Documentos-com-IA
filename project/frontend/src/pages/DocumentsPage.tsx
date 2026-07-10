import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useAppStore()
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post(`${API_URL}/documents/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        addDocument({
          id: response.data.id,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          processed: false,
        })

        toast.success(`${file.name} enviado com sucesso!`)
      }
    } catch (error) {
      toast.error('Erro ao enviar documento')
    } finally {
      setUploading(false)
    }
  }, [addDocument])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  })

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/documents/${id}`)
      deleteDocument(id)
      toast.success('Documento removido')
    } catch {
      toast.error('Erro ao remover documento')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentos</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie seus documentos</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">
          {isDragActive ? 'Solte os arquivos aqui' : 'Arraste e solte arquivos aqui'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          PDF, DOC, DOCX, TXT, PNG, JPG (máx. 50MB)
        </p>
        {uploading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-primary-500">
            <Loader className="w-5 h-5 animate-spin" />
            Enviando...
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Seus Documentos</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum documento enviado</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{formatSize(doc.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      doc.processed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {doc.processed ? 'Processado' : 'Pendente'}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}