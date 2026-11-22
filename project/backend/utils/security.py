from fastapi import HTTPException


class SecurityValidator:
    """Validações de segurança para uploads e entradas"""

    # Extensiones permitidas e seus MIME types correspondentes
    ALLOWED_EXTENSIONS = {
        '.pdf': ['application/pdf'],
        '.doc': ['application/msword'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        '.txt': ['text/plain'],
        '.png': ['image/png'],
        '.jpg': ['image/jpeg'],
        '.jpeg': ['image/jpeg'],
    }

    MAX_FILE_SIZE = 52428800  # 50MB

    @classmethod
    def validate_file(cls, filename: str, content_type: str, size: int) -> bool:
        """Validar arquivo por extensão, MIME type e tamanho"""
        # Validar tamanho
        if size > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Arquivo muito grande. Tamanho máximo: {cls.MAX_FILE_SIZE // (1024*1024)}MB"
            )

        # Validar extensão
        ext = '.' + filename.split('.')[-1].lower() if '.' in filename else ''
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não permitido. Extensões aceitas: {', '.join(cls.ALLOWED_EXTENSIONS.keys())}"
            )

        # Validar MIME type
        allowed_types = cls.ALLOWED_EXTENSIONS[ext]
        if content_type and content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"MIME type não permitido para extensão {ext}"
            )

        return True

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitizar nome de arquivo para prevenir path traversal"""
        # Remove caracteres especiais e Paths
        safe_name = filename.replace('\\', '/').split('/')[-1]
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c in '._- ')
        return safe_name[:100]  # Limitar tamanho

    @classmethod
    def validate_rate_limit(cls, requests_count: int, window_seconds: int, limit: int = 100) -> bool:
        """Validar rate limiting"""
        if requests_count > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit excedido. Máximo {limit} requisições por {window_seconds} segundos"
            )
        return True
