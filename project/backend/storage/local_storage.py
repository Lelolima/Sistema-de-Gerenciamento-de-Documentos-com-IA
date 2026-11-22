"""Armazenamento em disco local — usado quando o Supabase não está configurado."""

import os
from pathlib import Path
from typing import Optional


class LocalStorage:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or os.getenv("STORAGE_DIR", "uploads"))
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _find(self, doc_id: str) -> Optional[Path]:
        matches = list(self.base_dir.glob(f"{doc_id}.*"))
        return matches[0] if matches else None

    async def upload(self, content: bytes, filename: str, content_type: str, doc_id: str) -> str:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
        path = self.base_dir / f"{doc_id}.{ext}"
        path.write_bytes(content)
        return path.name

    async def download(self, doc_id: str) -> bytes:
        path = self._find(doc_id)
        if not path:
            raise FileNotFoundError("Arquivo não encontrado")
        return path.read_bytes()

    async def delete(self, doc_id: str) -> bool:
        path = self._find(doc_id)
        if path:
            path.unlink()
        return True
