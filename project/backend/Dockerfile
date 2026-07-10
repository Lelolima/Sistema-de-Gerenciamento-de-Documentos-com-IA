# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias do sistema
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar codigo
COPY . .

# Expor porta
EXPOSE 8000

# Rodar aplicacao
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]