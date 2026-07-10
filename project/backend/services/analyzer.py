from typing import Dict, List, Optional
import asyncio

class TextAnalyzer:
    """Analisador de texto com IA para sentiment analysis, entidades e resumos"""

    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Analisar sentimento do texto
        Retorna: label (positivo/negativo/neutro) e confidence
        """
        # Implementação simplificada - em produção usar transformers ou API externa
        text_lower = text.lower()

        positive_words = ['bom', 'ótimo', 'excelente', 'feliz', 'satisfatório', 'positivo', 'sucesso']
        negative_words = ['ruim', 'péssimo', 'triste', 'negativo', 'falha', 'erro', 'problema']

        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)

        if pos_count > neg_count:
            return {"label": "positivo", "confidence": min(0.95, 0.5 + (pos_count * 0.1))}
        elif neg_count > pos_count:
            return {"label": "negativo", "confidence": min(0.95, 0.5 + (neg_count * 0.1))}
        else:
            return {"label": "neutro", "confidence": 0.6}

    async def extract_entities(self, text: str) -> List[Dict]:
        """
        Extrair entidades nomeadas (pessoas, organizações, locais, datas)
        """
        # Implementação simplificada com regex
        import re

        entities = []

        # Datas (formato básico)
        date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2} de [a-zA-Z]+ de \d{4})\b'
        for match in re.finditer(date_pattern, text):
            entities.append({"text": match.group(), "type": "DATA"})

        # Emails
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        for match in re.finditer(email_pattern, text):
            entities.append({"text": match.group(), "type": "EMAIL"})

        # Valores monetários
        money_pattern = r'R?\$\s?\d+[,.]?\d*'
        for match in re.finditer(money_pattern, text):
            entities.append({"text": match.group(), "type": "VALOR"})

        # Números de telefone (Brasil)
        phone_pattern = r'\(?\d{2}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}'
        for match in re.finditer(phone_pattern, text):
            entities.append({"text": match.group(), "type": "TELEFONE"})

        return entities

    async def generate_summary(self, text: str, max_length: int = 200) -> Optional[str]:
        """
        Gerar resumo do texto
        """
        if not text or len(text) < 100:
            return text

        # Extrair frases importantes (método simples de extractive summarization)
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]

        if not sentences:
            return text

        # Pegar as primeiras frases como resumo
        summary = '. '.join(sentences[:3])

        if len(summary) > max_length:
            summary = summary[:max_length].rsplit(' ', 1)[0] + '...'

        return summary

    async def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """
        Extrair palavras-chave do texto
        """
        # Remover stopwords em português
        stopwords = {
            'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
            'um', 'uma', 'uns', 'umas', 'o', 'a', 'os', 'as', 'e', 'ou',
            'que', 'se', 'para', 'por', 'com', 'como', 'ao', 'aos', 'suas',
            'seu', 'seus', 'sua', 'suas', 'este', 'esta', 'estes', 'estas',
            'isso', 'isto', 'aquilo', 'aquele', 'aquela', 'naquele', 'naquela'
        }

        words = text.lower().split()
        words = [w.strip('.,;:!?()[]"\'') for w in words if len(w) > 2]
        words = [w for w in words if w not in stopwords]

        # Contar frequência
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Ordenar por frequência
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

        return [word for word, _ in sorted_words[:top_n]]