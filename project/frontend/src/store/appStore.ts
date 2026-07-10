import { create } from 'zustand'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  processed: boolean
  text?: string
  analysis?: any
}

interface AppState {
  documents: Document[]
  darkMode: boolean
  sidebarOpen: boolean
  selectedDocuments: string[]
  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  toggleDarkMode: () => void
  toggleSidebar: () => void
  toggleSelectDocument: (id: string) => void
  clearSelection: () => void
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  darkMode: false,
  sidebarOpen: true,
  selectedDocuments: [],

  setDocuments: (docs) => set({ documents: docs }),

  addDocument: (doc) => set((state) => ({
    documents: [doc, ...state.documents]
  })),

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(d =>
      d.id === id ? { ...d, ...updates } : d
    )
  })),

  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id)
  })),

  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode
    document.documentElement.classList.toggle('dark', newMode)
    return { darkMode: newMode }
  }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleSelectDocument: (id) => set((state) => ({
    selectedDocuments: state.selectedDocuments.includes(id)
      ? state.selectedDocuments.filter(d => d !== id)
      : [...state.selectedDocuments, id]
  })),

  clearSelection: () => set({ selectedDocuments: [] }),
}))