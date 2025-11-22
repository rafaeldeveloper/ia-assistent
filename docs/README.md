# Landing Page - FinanceBot

Landing page moderna e responsiva para o Assistente de Finanças Pessoais.

## 🚀 Deploy no GitHub Pages

### ⚠️ IMPORTANTE: Configuração Inicial

**Antes de usar GitHub Actions, você precisa habilitar o Pages manualmente:**

1. Vá em **Settings > Pages** no seu repositório GitHub
2. Em **Source**, selecione:
   - **Deploy from a branch**
   - **Branch**: `landing-page` (ou `main`)
   - **Folder**: `/docs`
3. Clique em **Save**
4. **Depois** mude para **GitHub Actions** como source

📖 **Veja instruções detalhadas em**: `GITHUB_PAGES_SETUP.md`

### Método 1: GitHub Actions (Automático)

O workflow já está configurado em `.github/workflows/deploy-pages.yml`

1. **Primeiro**: Configure o Pages manualmente (veja acima)
2. **Depois**: Mude para "GitHub Actions" em Settings > Pages
3. Faça push das mudanças - o deploy será automático!

### Método 2: Manual (Mais Simples)

1. Vá em **Settings > Pages** no seu repositório GitHub
2. Em **Source**, selecione:
   - **Deploy from a branch**
   - **Branch**: `landing-page` (ou `main`)
   - **Folder**: `/docs`
3. Clique em **Save**
4. A página estará disponível em `https://rafaeldeveloper.github.io/ia-finance-assistent/`

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

