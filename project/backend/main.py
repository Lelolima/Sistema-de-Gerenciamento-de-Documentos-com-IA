from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
from datetime import datetime
import asyncio

# Importações dos módulos
from services.document_processor import DocumentProcessor
from services.analyzer import TextAnalyzer
from services.comparator import DocumentComparator
from storage.supabase_storage import SupabaseStorage
from utils.security import SecurityValidator

app = FastAPI(
    title="DocManager IA API",
    description="API para processamento inteligente de documentos",
    version="1.0.0"
)

# CORS - Configurar origens específicas em produção
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Producao: usar origens especificas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização dos serviços
doc_processor = DocumentProcessor()
text_analyzer = TextAnalyzer()
doc_comparator = DocumentComparator()
storage = SupabaseStorage()

# Modelos Pydantic
class DocumentResponse(BaseModel):
    id: str
    name: str
    type: str
    size: int
    uploadedAt: str
    processed: bool
    text: Optional[str] = None
    analysis: Optional[Dict] = None

class ComparisonRequest(BaseModel):
    doc1Id: str
    doc2Id: str

class AnalysisRequest(BaseModel):
    documentId: str

class AnalysisResponse(BaseModel):
    sentiment: Optional[Dict] = None
    entities: Optional[List[Dict]] = None
    summary: Optional[str] = None

class DocumentDB(BaseModel):
    """Modelo para armazenamento em banco de dados"""
    id: str
    name: str
    type: str
    size: int
    uploadedAt: str
    processed: bool
    text: Optional[str] = None
    analysis: Optional[Dict] = None
    user_id: Optional[str] = None  # ponytail: sem autenticacao ainda, adicionar quando implementar Supabase Auth
    created_at: datetime = datetime.now()

# Armazenamento em memoria (substituir por banco de dados em producao)
# ponytail: Dict em memoria para prototipo - migrar para PostgreSQL/Supabase quando for producao
documents_db: Dict[str, DocumentResponse] = {}
processing_queue: asyncio.Queue = asyncio.Queue()


async def process_document_background(doc_id: str, file_path: str):
    """Processamento em background com tratamento de erro"""
    try:
        # Extrair texto
        text = await doc_processor.extract_text(file_path)

        # Atualizar documento
        if doc_id in documents_db:
            documents_db[doc_id].processed = True
            documents_db[doc_id].text = text
    except Exception as e:
        # Log em sistema de monitoramento em producao
        print(f"Erro ao processar documento {doc_id}: {e}")
        if doc_id in documents_db:
            documents_db[doc_id].processed = False  # Marca como falho

@app.get("/")
async def root():
    return {"message": "DocManager IA API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload de um novo documento com validação de segurança"""
    # Validar arquivo (tamanho, extensão, MIME type)
    SecurityValidator.validate_file(file.filename or "", file.content_type or "", 0)

    # Validar tamanho
    content = await file.read()
    SecurityValidator.validate_file(
        file.filename or "",
        file.content_type or "",
        len(content)
    )

    # Sanitizar nome do arquivo
    safe_filename = SecurityValidator.sanitize_filename(file.filename or "unknown")

    # Gerar ID único
    doc_id = str(uuid.uuid4())

    # Salvar no storage
    try:
        file_path = await storage.upload(file, doc_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {str(e)}")

    # Criar registro
    doc = DocumentResponse(
        id=doc_id,
        name=safe_filename,
        type=file.content_type,
        size=len(content),
        uploadedAt=datetime.now().isoformat(),
        processed=False
    )
    documents_db[doc_id] = doc

    # Processar em background
    asyncio.create_task(process_document_background(doc_id, file_path))

    return doc

@app.get("/documents", response_model=List[DocumentResponse])
async def list_documents():
    """Listar todos os documentos"""
    return list(documents_db.values())

@app.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str):
    """Obter detalhes de um documento"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return documents_db[doc_id]

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Excluir um documento"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    try:
        await storage.delete(doc_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir: {str(e)}")

    del documents_db[doc_id]
    return {"message": "Documento excluído"}

@app.post("/documents/analyze", response_model=AnalysisResponse)
async def analyze_document(request: AnalysisRequest):
    """Analisar um documento com IA"""
    if request.documentId not in documents_db:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    doc = documents_db[request.documentId]
    if not doc.text:
        raise HTTPException(status_code=400, detail="Documento ainda não processado")

    # Realizar análises
    sentiment = await text_analyzer.analyze_sentiment(doc.text)
    entities = await text_analyzer.extract_entities(doc.text)
    summary = await text_analyzer.generate_summary(doc.text)

    # Salvar análise
    doc.analysis = {
        "sentiment": sentiment,
        "entities": entities,
        "summary": summary
    }

    return AnalysisResponse(
        sentiment=sentiment,
        entities=entities,
        summary=summary
    )

@app.post("/documents/compare")
async def compare_documents(request: ComparisonRequest):
    """Comparar dois documentos"""
    if request.doc1Id not in documents_db or request.doc2Id not in documents_db:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    doc1 = documents_db[request.doc1Id]
    doc2 = documents_db[request.doc2Id]

    if not doc1.text or not doc2.text:
        raise HTTPException(status_code=400, detail="Documentos ainda não processados")

    # Comparar
    comparison = await doc_comparator.compare(doc1.text, doc2.text)

    return {
        "doc1_text": doc1.text[:500] + "..." if len(doc1.text) > 500 else doc1.text,
        "doc2_text": doc2.text[:500] + "..." if len(doc2.text) > 500 else doc2.text,
        "similarity": comparison["similarity"],
        "differences": comparison["differences"]
    }

@app.get("/documents/{doc_id}/text")
async def get_document_text(doc_id: str):
    """Obter texto extraído de um documento"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    doc = documents_db[doc_id]
    if not doc.text:
        raise HTTPException(status_code=400, detail="Documento não processado")

    return {"text": doc.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)