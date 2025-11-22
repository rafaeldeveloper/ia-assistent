# 🚀 Setup da Landing Page

## Antes de fazer deploy

Antes de fazer deploy no GitHub Pages, você precisa atualizar os links do GitHub no arquivo `index.html`.

### Links para atualizar:

1. **Linha 25**: Link do GitHub no menu
   ```html
   <a href="https://github.com/rafaeldeveloper/ia-finance-assistent" target="_blank" class="nav__github">GitHub</a>
   ```
   Substitua `seu-usuario` pelo seu usuário do GitHub

2. **Linha 60**: Botão "Começar Agora"
   ```html
   <a href="https://github.com/seu-usuario/ia-finance-assistent" target="_blank" class="btn btn--primary">
   ```

3. **Linha 63**: Botão "Ver no GitHub"
   ```html
   <a href="https://github.com/seu-usuario/ia-finance-assistent" target="_blank" class="btn btn--primary btn--large">
   ```

4. **Linha 66**: Link da documentação
   ```html
   <a href="https://github.com/seu-usuario/ia-finance-assistent#readme" target="_blank" class="btn btn--secondary btn--large">
   ```

5. **Linha 200**: Links do footer
   ```html
   <li><a href="https://github.com/seu-usuario/ia-finance-assistent" target="_blank">GitHub</a></li>
   <li><a href="https://github.com/seu-usuario/ia-finance-assistent#readme" target="_blank">Documentação</a></li>
   <li><a href="https://github.com/seu-usuario/ia-finance-assistent/issues" target="_blank">Reportar Bug</a></li>
   ```

### Como fazer a substituição:

1. Abra o arquivo `docs/index.html`
2. Use Ctrl+F (ou Cmd+F no Mac) para buscar `seu-usuario`
3. Substitua todas as ocorrências pelo seu usuário do GitHub
4. Salve o arquivo

## Deploy

Após atualizar os links, siga as instruções no `docs/README.md` para fazer o deploy.

