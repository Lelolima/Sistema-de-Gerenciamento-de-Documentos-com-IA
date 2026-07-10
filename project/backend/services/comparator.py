from typing import Dict, List
import difflib

class DocumentComparator:
    """Comparador de documentos para identificar similaridades e diferenças"""

    async def compare(self, text1: str, text2: str) -> Dict:
        """
        Comparar dois textos e retornar similaridade e diferenças
        """
        # Normalizar textos
        text1_norm = self._normalize(text1)
        text2_norm = self._normalize(text2)

        # Calcular similaridade
        similarity = difflib.SequenceMatcher(None, text1_norm, text2_norm).ratio()

        # Encontrar diferenças
        differences = self._find_differences(text1, text2)

        return {
            "similarity": round(similarity * 100, 2),
            "differences": differences
        }

    def _normalize(self, text: str) -> str:
        """Normalizar texto para comparação"""
        # Remover espaços extras, normalizar case
        text = ' '.join(text.split())
        return text.lower()

    def _find_differences(self, text1: str, text2: str) -> List[Dict]:
        """Encontrar diferenças entre dois textos"""
        differences = []

        # Dividir em linhas para comparação
        lines1 = text1.split('\n')
        lines2 = text2.split('\n')

        diff = difflib.ndiff(lines1, lines2)

        for line in diff:
            if line.startswith('- '):
                differences.append({
                    "type": "removed",
                    "content": line[2:]
                })
            elif line.startswith('+ '):
                differences.append({
                    "type": "added",
                    "content": line[2:]
                })

        return differences[:50]  # Limitar a 50 diferenças

    async def find_similar_documents(self, query_text: str, documents: List[Dict]) -> List[Dict]:
        """
        Encontrar documentos similares a uma query
        """
        results = []

        for doc in documents:
            if not doc.get('text'):
                continue

            similarity = difflib.SequenceMatcher(None, query_text.lower(), doc['text'].lower()).ratio()

            if similarity > 0.3:  # Threshold mínimo
                results.append({
                    "document_id": doc['id'],
                    "similarity": round(similarity * 100, 2),
                    "name": doc.get('name', 'Unknown')
                })

        # Ordenar por similaridade
        results.sort(key=lambda x: x['similarity'], reverse=True)

        return results[:10]  # Top 10 resultados