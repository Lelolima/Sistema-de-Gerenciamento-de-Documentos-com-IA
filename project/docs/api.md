# API Reference

## Base URL

```
http://localhost:8000
```

## Autenticação

A API usa autenticação via Supabase. Inclua o token no header:

```
Authorization: Bearer <your-token>
```

---

## Endpoints

### Health Check

```http
GET /health
```

**Resposta:**
```json
{ "status": "healthy" }
```

---

### Upload de Documento

```http
POST /documents/upload
Content-Type: multipart/form-data
```

**Parâmetros:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| file | file | Arquivo para upload (PDF, DOCX, TXT, PNG, JPG) |

**Resposta:**
```json
{
  "id": "uuid-do-documento",
  "name": "arquivo.pdf",
  "type": "application/pdf",
  "size": 102400,
  "uploadedAt": "2024-01-15T10:30:00",
  "processed": false
}
```

---

### Listar Documentos

```http
GET /documents
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "arquivo.pdf",
    "type": "application/pdf",
    "size": 102400,
    "uploadedAt": "2024-01-15T10:30:00",
    "processed": true
  }
]
```

---

### Obter Documento

```http
GET /documents/{id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "arquivo.pdf",
  "type": "application/pdf",
  "size": 102400,
  "uploadedAt": "2024-01-15T10:30:00",
  "processed": true,
  "text": "Conteúdo do documento...",
  "analysis": {
    "sentiment": { "label": "positivo", "confidence": 0.85 },
    "entities": [...],
    "summary": "Resumo do documento..."
  }
}
```

---

### Excluir Documento

```http
DELETE /documents/{id}
```

**Resposta:**
```json
{ "message": "Documento excluído" }
```

---

### Analisar Documento

```http
POST /documents/analyze
Content-Type: application/json
```

**Body:**
```json
{
  "documentId": "uuid-do-documento"
}
```

**Resposta:**
```json
{
  "sentiment": { "label": "neutro", "confidence": 0.75 },
  "entities": [
    { "text": "São Paulo", "type": "LOCAL" },
    { "text": "15/01/2024", "type": "DATA" }
  ],
  "summary": "Resumo gerado automaticamente..."
}
```

---

### Comparar Documentos

```http
POST /documents/compare
Content-Type: application/json
```

**Body:**
```json
{
  "doc1Id": "uuid-doc-1",
  "doc2Id": "uuid-doc-2"
}
```

**Resposta:**
```json
{
  "doc1_text": "Texto do documento 1...",
  "doc2_text": "Texto do documento 2...",
  "similarity": 85.5,
  "differences": [
    { "type": "added", "content": "Texto adicionado" },
    { "type": "removed", "content": "Texto removido" }
  ]
}
```

---

### Obter Texto do Documento

```http
GET /documents/{id}/text
```

**Resposta:**
```json
{
  "text": "Conteúdo completo do documento..."
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 404 | Documento não encontrado |
| 500 | Erro interno do servidor |

**Resposta de erro:**
```json
{
  "detail": "Descrição do erro"
}
```

---

## Limites

| Recurso | Limite |
|---------|--------|
| Tamanho do arquivo | 50 MB |
| Tipos suportados | PDF, DOC, DOCX, TXT, PNG, JPG |
| Rate limit | 100 requisições/minuto |