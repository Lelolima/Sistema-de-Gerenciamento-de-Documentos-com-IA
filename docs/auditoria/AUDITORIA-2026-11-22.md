# Auditoria técnica — 2026-11-22

Repositório: `Lelolima/Sistema-de-Gerenciamento-de-Documentos-com-IA` · Branch: `fix/backend-funcional-ci-auditoria-2026-11-22`

## Diagnóstico (estado anterior)

- **Finalidade:** upload, extração de texto, "análise" e comparação de documentos. Backend FastAPI (`project/backend`), frontend React/Vite (`project/frontend`).
- **Histórico:** 1 commit. **CI:** a única execução (`CI/CD Pipeline`) falhou.
- **Backend não iniciava** sem Supabase: `SupabaseStorage()` era instanciado na importação com `create_client(None, None)` → exceção. Todos os testes de API davam erro (7 errors — evidência abaixo).
- **Frontend não compilava:** `Compare` não existe no `lucide-react` (`vite build` e `tsc` falhavam); ESLint sem configuração (falhava); sem `package-lock.json`.

## Problemas encontrados

| # | Sev. | Problema | Evidência |
|---|------|----------|-----------|
| 1 | P0 | 165 vulnerabilidades conhecidas nas versões fixadas do backend (fastapi 0.109/starlette, python-multipart 0.0.6, Pillow 10.2, torch 2.1.2, transformers 4.36, python-jose 3.3, …) | `pip-audit -r requirements.txt --disable-pip --no-deps` → "Found 165" |
| 2 | P0 | API não inicia sem Supabase configurado | `pytest` → 7 errors `SupabaseException` |
| 3 | P1 | Upload gravava arquivo **vazio**: `main.py` lia o `UploadFile` e depois `storage.upload()` lia de novo (EOF) | leitura do código; teste `test_upload_stores_full_content_and_extracts_text` |
| 4 | P1 | Processamento nunca funcionava: o caminho remoto do Supabase (`<uuid>.pdf`) era aberto como arquivo local → texto nunca extraído → `/analyze` e `/compare` sempre 400 | idem |
| 5 | P1 | Frontend não compila (`Compare` inexistente, imports não usados) | `npx tsc --noEmit`, `vite build` |
| 6 | P1 | `VITE_API_URL` terminava em `/api`, mas a API (e `project/docs/api.md`) não tem esse prefixo → todas as chamadas 404 | `.env.example`, `docker-compose.yml` |
| 7 | P1 | `docker-compose.yml` apontava para `./backend` e `./frontend` (inexistentes) | `docker compose config` / estrutura |
| 8 | P1 | CI quebrado: ESLint sem config, `pytest-asyncio` ausente, actions v3 sem pin, sem permissões mínimas | `.github/workflows/ci.yml` |
| 9 | P2 | `npm audit`: pdfjs-dist (alta — execução de JS via PDF malicioso) e outras; pdfjs-dist, react-pdf, recharts, date-fns **não eram usados** | `npm audit`, `grep` |
| 10 | P2 | Teste do frontend era `expect(true).toBe(true)` | `src/tests/Dashboard.test.tsx` |
| 11 | P2 | **Funcionalidades anunciadas e inexistentes:** AES-256, RBAC, LGPD, rate limiting, busca semântica, Transformers. A "IA" é heurística (regex/listas de palavras) | código vs README |
| 12 | P2 | API **sem autenticação**: qualquer cliente lista, lê e exclui documentos | `main.py` |
| 13 | P3 | `created_at: datetime = datetime.now()` (valor fixo na importação), `print` em vez de log | `main.py` |

**Segredos:** nenhum valor real encontrado. `.env.example` e `docker-compose.yml` só têm placeholders (`your-supabase-key`, `mude-esta-chave-em-producao`). O fallback fraco de `SECRET_KEY` no compose não é usado pelo código. Busca manual com `git log -p | grep` (gitleaks indisponível na máquina).

## Mudanças

- Backend: `storage.get_storage()` escolhe Supabase (se `SUPABASE_URL`+`SUPABASE_KEY`) ou novo `LocalStorage` em disco (`STORAGE_DIR`); upload recebe os bytes já lidos; extração feita a partir do conteúdo em arquivo temporário via `BackgroundTasks`; logging; `Field(default_factory=datetime.now)`.
- `requirements.txt` só com o que o código importa, versões atuais sem CVEs conhecidas; removidas dependências **não importadas** (torch, transformers, sentence-transformers, SQLAlchemy, asyncpg, python-jose, passlib, diff-match-patch, aiofiles, pydantic-settings). `requirements-dev.txt` com pytest/pytest-asyncio/httpx/flake8.
- Testes novos: `tests/test_api.py` (7), `tests/test_security.py` (3); `pytest.ini`.
- Frontend: ícone `GitCompare`, imports limpos, `.eslintrc.cjs` (TS + react-hooks), teste real do `DashboardPage`, `package-lock.json`, remoção de dependências não usadas, `npm audit fix`.
- `docker-compose.yml`: contextos corretos, `VITE_API_URL` sem `/api`, `STORAGE_DIR`; Dockerfile do frontend em Node 20 com `npm ci`.
- CI reescrito: `permissions: contents: read`, actions fixadas por SHA, lint + tsc + testes + build + audits; sem deploy.
- README e `.env.example` fiéis à implementação.

## Testes executados (resultados reais, Windows, Node 20 / Python 3.13)

| Comando | Resultado |
|---------|-----------|
| `pytest` (antes da correção, com os novos testes) | 9 passed, **7 errors** (Supabase) |
| `pytest` (depois) | 16 passed |
| `flake8 --max-line-length=120 main.py services storage utils tests` | OK |
| `pip-audit -r requirements-dev.txt` | No known vulnerabilities found |
| `npm run lint` | 0 erros (7 avisos `no-explicit-any`) |
| `npx tsc --noEmit` | OK (antes: 5 erros) |
| `npm test` (vitest) | 2/2 |
| `npm run build` | OK (antes: falhava) |
| `npm audit --omit=dev --audit-level=high` | passa; restam 2 moderadas (react-router) |
| `docker compose config -q` | válido |

**Não executado:** OCR real (binário Tesseract não instalado nesta máquina), build das imagens Docker, integração com Supabase (não usei credenciais nem serviços externos).

## Riscos residuais / decisões do dono

1. **Autenticação na API** (P1 de segurança): endpoints abertos. Exige decisão de regra de negócio (validar JWT do Supabase? multiusuário?). Não implementado.
2. Metadados em memória: reiniciar a API perde a lista de documentos (arquivos ficam no storage). Migrar para PostgreSQL é decisão de produto.
3. react-router 6 tem 2 vulnerabilidades moderadas; correção exige v7 (major).
4. Vulnerabilidades só de desenvolvimento (vite 5/esbuild, vitest 1, eslint 8 em fim de vida) exigem majors.
5. `SettingsPage` grava uma "API key" em `localStorage` que nada usa.
6. Variáveis do frontend no Docker são lidas em tempo de build pelo Vite; passá-las só em `environment:` não tem efeito.

### Achado adicional
- `docker-compose.yml` montava o volume `document_storage` em `/app/storage`, que é o **pacote Python `storage`** copiado pelo Dockerfile — o volume esconderia o código e a API não iniciaria no container. Volume movido para `/app/uploads` (`STORAGE_DIR`).
