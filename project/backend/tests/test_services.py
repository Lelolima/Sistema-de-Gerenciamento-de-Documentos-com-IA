import pytest
from services.document_processor import DocumentProcessor
from services.analyzer import TextAnalyzer
from services.comparator import DocumentComparator


class TestDocumentProcessor:
    @pytest.mark.asyncio
    async def test_extract_text_from_txt(self, tmp_path):
        processor = DocumentProcessor()
        test_file = tmp_path / "test.txt"
        test_file.write_text("Hello World")

        text = await processor.extract_text(str(test_file))
        assert text == "Hello World"


class TestTextAnalyzer:
    @pytest.mark.asyncio
    async def test_sentiment_positive(self):
        analyzer = TextAnalyzer()
        result = await analyzer.analyze_sentiment("Isso é excelente e muito bom!")
        assert result["label"] == "positivo"

    @pytest.mark.asyncio
    async def test_sentiment_negative(self):
        analyzer = TextAnalyzer()
        result = await analyzer.analyze_sentiment("Isso é ruim e péssimo!")
        assert result["label"] == "negativo"

    @pytest.mark.asyncio
    async def test_extract_entities(self):
        analyzer = TextAnalyzer()
        text = "Contato: email@teste.com em 15/01/2024"
        entities = await analyzer.extract_entities(text)
        assert len(entities) >= 2


class TestDocumentComparator:
    @pytest.mark.asyncio
    async def test_compare_similar(self):
        comparator = DocumentComparator()
        text1 = "Hello World"
        text2 = "Hello World"
        result = await comparator.compare(text1, text2)
        assert result["similarity"] == 100.0

    @pytest.mark.asyncio
    async def test_compare_different(self):
        comparator = DocumentComparator()
        text1 = "Hello World"
        text2 = "Completely different text"
        result = await comparator.compare(text1, text2)
        assert result["similarity"] < 50.0
