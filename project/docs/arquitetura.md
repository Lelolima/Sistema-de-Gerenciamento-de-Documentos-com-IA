# Arquitetura do Sistema

## Visão Geral

O DocManager IA é uma aplicação full-stack para gerenciamento inteligente de documentos, composta por:

- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI (Python)
- **Armazenamento**: Supabase (PostgreSQL + Storage)
- **Processamento**: OCR (Tesseract), NLP (transformers)

## Diagrama de Arquitetura

```
┌─────────────────┐
│   Frontend      │
│  React + Vite   │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Backend       │
│   FastAPI       │
│   (Port 8000)   │
└────────┬────────┘
         │
         ├──► Supabase Storage (Arquivos)
         │
         └──► PostgreSQL (Metadados)
```

## Componentes

### Frontend

- **React 18** - UI library
- **Vite** - Build tool e dev server
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **TailwindCSS** - Estilização
- **React Dropzone** - Upload de arquivos
- **Supabase JS** - Cliente de autenticação e storage

### Backend

- **FastAPI** - Framework web assíncrono
- **PyMuPDF** - Processamento de PDFs
- **Tesseract OCR** - Reconhecimento óptico de caracteres
- **python-docx** - Processamento de documentos Word
- **difflib** - Comparação de documentos

### Armazenamento

- **Supabase Storage** - Armazenamento de arquivos
- **PostgreSQL** - Metadados e histórico

## Fluxo de Processamento

1. **Upload**: Usuário envia arquivo via frontend
2. **Storage**: Arquivo é salvo no Supabase Storage
3. **Processamento**: Backend extrai texto (OCR se necessário)
4. **Análise**: IA analisa sentimento, entidades e gera resumo
5. **Armazenamento**: Texto e análise são salvos no banco
6. **Disponível**: Documento fica disponível para consulta/comparação

## Segurança

- Autenticação via Supabase Auth
- Criptografia AES-256 para arquivos sensíveis
- RBAC (Role-Based Access Control)
- Rate limiting na API
- Validação de tipo e tamanho de arquivo

## Escalabilidade

- Processamento em background com filas
- Cache com Redis (implementação futura)
- Web Workers no frontend para OCR client-side
- Containerização com Docker