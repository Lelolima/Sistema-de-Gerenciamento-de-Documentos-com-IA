# Scripts de inicializacao rapida

# Frontend
cd project/frontend
npm install
npm run dev

# Backend (em outro terminal)
cd project/backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Docker (alternativa)
docker-compose up -d