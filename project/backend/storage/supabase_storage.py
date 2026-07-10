from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Dict, Optional

load_dotenv()

class SupabaseStorage:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.bucket_name = "documents"
        self._file_cache: Dict[str, str] = {}  # Cache para evitar list() repetido

    async def upload(self, file, doc_id: str) -> str:
        """Upload de arquivo para o Supabase Storage"""
        content = await file.read()
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
        file_path = f"{doc_id}.{file_extension}"

        self.client.storage.from_(self.bucket_name).upload(
            file_path,
            content,
            {"content-type": file.content_type}
        )

        # Cache para operações futuras
        self._file_cache[doc_id] = file_path

        return file_path

    async def download(self, doc_id: str) -> bytes:
        """Download de arquivo do Supabase Storage"""
        file_path = await self._get_file_path(doc_id)

        if not file_path:
            raise FileNotFoundError("Arquivo não encontrado")

        return self.client.storage.from_(self.bucket_name).download(file_path)

    async def delete(self, doc_id: str) -> bool:
        """Excluir arquivo do Supabase Storage"""
        file_path = await self._get_file_path(doc_id)

        if file_path:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            self._file_cache.pop(doc_id, None)  # Remove do cache

        return True

    def get_public_url(self, doc_id: str) -> str:
        """Obter URL pública do arquivo"""
        file_path = self._file_cache.get(doc_id)

        if file_path:
            return self.client.storage.from_(self.bucket_name).get_public_url(file_path)

        raise FileNotFoundError("Arquivo não encontrado")

    async def _get_file_path(self, doc_id: str) -> Optional[str]:
        """Obter caminho do arquivo com cache"""
        # Primeiro verifica cache
        if doc_id in self._file_cache:
            return self._file_cache[doc_id]

        # Busca no storage
        try:
            files = self.client.storage.from_(self.bucket_name).list()
            for f in files:
                if f["name"].startswith(doc_id):
                    self._file_cache[doc_id] = f["name"]
                    return f["name"]
        except Exception:
            pass

        return None