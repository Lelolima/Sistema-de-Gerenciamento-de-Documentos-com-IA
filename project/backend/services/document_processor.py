import fitz  # PyMuPDF
import docx
import pytesseract
from PIL import Image
import io
from pathlib import Path


class DocumentProcessor:
    """Processador de documentos para extração de texto"""

    async def extract_text(self, file_path: str) -> str:
        """Extrair texto de um documento"""
        ext = Path(file_path).suffix.lower()

        if ext == ".pdf":
            return await self._extract_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return await self._extract_from_docx(file_path)
        elif ext in [".png", ".jpg", ".jpeg"]:
            return await self._extract_from_image(file_path)
        elif ext == ".txt":
            return await self._extract_from_txt(file_path)
        else:
            raise ValueError(f"Formato não suportado: {ext}")

    async def _extract_from_pdf(self, file_path: str) -> str:
        """Extrair texto de PDF"""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception:
            # Tentar OCR se a extração falhar
            text = await self._extract_from_pdf_ocr(file_path)
        return text

    async def _extract_from_pdf_ocr(self, file_path: str) -> str:
        """Extrair texto de PDF usando OCR (para PDFs digitalizados)"""
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            pix = page.get_pixmap()
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            page_text = pytesseract.image_to_string(img, lang='por+eng')
            text += page_text + "\n"
        doc.close()
        return text

    async def _extract_from_docx(self, file_path: str) -> str:
        """Extrair texto de DOCX"""
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text

    async def _extract_from_image(self, file_path: str) -> str:
        """Extrair texto de imagem usando OCR"""
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img, lang='por+eng')
        return text

    async def _extract_from_txt(self, file_path: str) -> str:
        """Ler arquivo de texto puro"""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    async def convert_pdf_to_images(self, file_path: str, output_dir: str) -> list:
        """Converter PDF para imagens (para visualização)"""
        images = []
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            pix = page.get_pixmap()
            output_path = f"{output_dir}/page_{i+1}.png"
            pix.save(output_path)
            images.append(output_path)
        doc.close()
        return images
