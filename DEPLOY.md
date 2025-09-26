# Deploy no Render

## Instruções Passo a Passo

### 1. Preparação
- ✅ O projeto já está configurado e buildando corretamente
- ✅ Arquivos `render.yaml` e scripts do `package.json` já foram criados

### 2. Deploy no Render

1. **Crie uma conta no Render**: https://render.com

2. **Conecte seu repositório**:
   - Faça push do seu código para GitHub/GitLab
   - No Render, clique em "New +" → "Background Service"
   - Conecte seu repositório

3. **Configure as variáveis de ambiente**:
   - `BOT_TOKEN`: Seu token do bot Discord
   - `CLIENT_ID`: ID da aplicação Discord
   - `NODE_ENV`: production

4. **Configurações do serviço**:
   - **Name**: discord-bot (ou o nome que preferir)
   - **Environment**: Node
   - **Region**: Oregon (ou mais próximo de você)
   - **Branch**: main
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run render-start`

5. **Deploy automático**:
   - O Render detectará automaticamente o arquivo `render.yaml`
   - O deploy será feito automaticamente a cada push

### 3. Variáveis de Ambiente Necessárias

No painel do Render, adicione estas variáveis:

```
BOT_TOKEN=seu_token_do_discord_aqui
CLIENT_ID=seu_client_id_aqui
NODE_ENV=production
```

### 4. Verificação

Após o deploy:
- Verifique os logs no dashboard do Render
- Seu bot deve aparecer online no Discord
- Teste os comandos slash no seu servidor

### 5. Troubleshooting

**Se o bot não conectar**:
- Verifique se as variáveis `BOT_TOKEN` e `CLIENT_ID` estão corretas
- Confira os logs no Render para ver erros específicos

**Se os comandos não funcionarem**:
- Certifique-se de que o bot tem as permissões necessárias no servidor
- Verifique se o `CLIENT_ID` está correto

### 6. Recursos do Bot

Seu bot inclui:
- ✅ Sistema de automod
- ✅ Comandos de verificação
- ✅ Criação automática de canais de regras
- ✅ Sistema de URL status
- ✅ Integração com canais de voz
- ✅ Comando ping para teste

**O bot está pronto para produção! 🚀**