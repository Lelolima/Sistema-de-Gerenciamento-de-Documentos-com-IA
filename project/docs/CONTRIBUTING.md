# Guia de Contribuição

## Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Faça suas mudanças**
4. **Rode os testes**
   ```bash
   npm test  # Frontend
   pytest    # Backend
   ```
5. **Commit suas mudanças**
   ```bash
   git commit -m "Adiciona minha feature"
   ```
6. **Push para a branch**
   ```bash
   git push origin feature/minha-feature
   ```
7. **Abra um Pull Request**

## Padrões de Código

### Frontend

- Use TypeScript para todo novo código
- Siga o ESLint configurado
- Componentes funcionais com hooks
- Estilização com TailwindCSS

### Backend

- Type hints em todas as funções
- Docstrings em funções públicas
- Siga PEP 8
- Testes unitários para novas funções

## Estrutura de Pastas

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── tests/
├── backend/
│   ├── services/
│   ├── storage/
│   └── tests/
└── docs/
```

## Issues

- Use labels para categorizar issues
- Descreva claramente o problema ou feature
- Inclua passos para reproduzir (bugs)

## Releases

Versões semânticas: `MAJOR.MINOR.PATCH`

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas features (compatíveis)
- **PATCH**: Correções de bugs