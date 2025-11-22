# 🔧 Configuração do GitHub Pages

## Erro: "Get Pages site failed"

Se você está recebendo este erro, significa que o GitHub Pages não está habilitado ou configurado corretamente.

## ✅ Solução Passo a Passo

### 1. Habilitar GitHub Pages Manualmente

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - **Source**: `Deploy from a branch`
   - **Branch**: `landing-page` (ou `main`)
   - **Folder**: `/docs`
5. Clique em **Save**

### 2. Configurar GitHub Actions como Source

Após habilitar o Pages manualmente pela primeira vez:

1. Ainda em **Settings > Pages**
2. Em **Source**, mude para: **GitHub Actions**
3. Clique em **Save**

### 3. Verificar Permissões

Certifique-se de que o workflow tem as permissões corretas:

1. Vá em **Settings > Actions > General**
2. Em **Workflow permissions**, selecione:
   - **Read and write permissions**
   - Marque **Allow GitHub Actions to create and approve pull requests**

### 4. Executar o Workflow

Após configurar:

1. Vá em **Actions** no seu repositório
2. Selecione o workflow "Deploy to GitHub Pages"
3. Clique em **Run workflow**
4. Selecione a branch `landing-page` (ou `main`)
5. Clique em **Run workflow**

## 🔄 Alternativa: Deploy Manual (Sem GitHub Actions)

Se preferir não usar GitHub Actions:

1. Vá em **Settings > Pages**
2. Em **Source**, selecione:
   - **Source**: `Deploy from a branch`
   - **Branch**: `landing-page` (ou `main`)
   - **Folder**: `/docs`
3. Clique em **Save**
4. A página estará disponível em: `https://rafaeldeveloper.github.io/ia-finance-assistent/`

## 📝 Notas Importantes

- O primeiro deploy pode levar alguns minutos
- Após o primeiro deploy manual, você pode mudar para GitHub Actions
- Certifique-se de que a branch `landing-page` ou `main` existe e tem os arquivos em `docs/`
- O workflow só roda quando há mudanças em `docs/**`

## 🐛 Troubleshooting

### Erro: "Not Found"
- Verifique se o Pages está habilitado em Settings > Pages
- Certifique-se de que a branch existe
- Verifique se a pasta `docs/` existe e tem arquivos

### Workflow não executa
- Verifique se está na branch correta (`landing-page` ou `main`)
- Verifique se há mudanças em `docs/**`
- Tente executar manualmente via "Run workflow"

### Página não atualiza
- Aguarde alguns minutos (pode levar até 10 minutos)
- Limpe o cache do navegador
- Verifique os logs em Actions > Deploy to GitHub Pages

