import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("STORAGE_DIR", str(tmp_path / "storage"))
    import main
    main.documents_db.clear()
    main.storage = main.get_storage()
    return TestClient(main.app)


def _upload(client, name="contrato.txt", content=b"Contrato excelente assinado em 15/01/2024.",
            ctype="text/plain"):
    return client.post("/documents/upload", files={"file": (name, content, ctype)})


def test_health(client):
    assert client.get("/health").json() == {"status": "healthy"}


def test_upload_stores_full_content_and_extracts_text(client):
    content = b"Contrato excelente assinado em 15/01/2024."
    r = _upload(client, content=content)
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["size"] == len(content)

    import main
    assert await_download(main, doc["id"]) == content

    r = client.get(f"/documents/{doc['id']}/text")
    assert r.status_code == 200
    assert r.json()["text"] == content.decode()
    assert client.get(f"/documents/{doc['id']}").json()["processed"] is True


def await_download(main, doc_id):
    import asyncio
    return asyncio.run(main.storage.download(doc_id))


def test_analyze_and_compare(client):
    a = _upload(client, "a.txt", b"Resultado excelente e muito bom. Contato: x@y.com").json()
    b = _upload(client, "b.txt", b"Resultado ruim, com falha. Contato: x@y.com").json()

    r = client.post("/documents/analyze", json={"documentId": a["id"]})
    assert r.status_code == 200
    assert r.json()["sentiment"]["label"] == "positivo"

    r = client.post("/documents/compare", json={"doc1Id": a["id"], "doc2Id": b["id"]})
    assert r.status_code == 200
    assert 0 <= r.json()["similarity"] < 100


def test_upload_rejects_disallowed_extension(client):
    r = _upload(client, "script.exe", b"MZ", "application/octet-stream")
    assert r.status_code == 400


def test_upload_rejects_mime_mismatch(client):
    r = _upload(client, "doc.pdf", b"hello", "text/plain")
    assert r.status_code == 400


def test_delete_document(client):
    doc = _upload(client).json()
    assert client.delete(f"/documents/{doc['id']}").status_code == 200
    assert client.get(f"/documents/{doc['id']}").status_code == 404


def test_unknown_document_404(client):
    assert client.post("/documents/analyze", json={"documentId": "nope"}).status_code == 404
