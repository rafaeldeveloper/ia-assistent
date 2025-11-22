# Landing Page - FinanceBot

Landing page moderna e responsiva para o Assistente de Finanças Pessoais.

## 🚀 Deploy no GitHub Pages

### Método 1: GitHub Actions (Automático)

1. Crie um arquivo `.github/workflows/deploy.yml` na raiz do projeto:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

2. Vá em Settings > Pages no GitHub
3. Selecione "GitHub Actions" como source
4. Faça push das mudanças - o deploy será automático!

### Método 2: Manual

1. Vá em Settings > Pages no seu repositório GitHub
2. Em "Source", selecione a branch `main` e pasta `/docs`
3. Clique em Save
4. A página estará disponível em `https://seu-usuario.github.io/ia-finance-assistent/`

## 📝 Personalização

Antes de fazer deploy, atualize os links no `index.html`:

1. Substitua `seu-usuario` pelo seu usuário do GitHub
2. Atualize os links do GitHub para apontar para seu repositório
3. Personalize cores, textos e imagens conforme necessário

## 🎨 Estrutura

```
docs/
├── index.html      # Página principal
├── styles.css      # Estilos
├── script.js       # JavaScript
└── README.md       # Este arquivo
```

## 📱 Responsivo

A landing page é totalmente responsiva e funciona bem em:
- Desktop
- Tablet
- Mobile

## ✨ Recursos

- Design moderno e limpo
- Animações suaves
- Navegação suave (smooth scroll)
- Menu mobile responsivo
- Seções interativas
- Otimizado para SEO

