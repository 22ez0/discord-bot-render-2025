# Discord Bot - Constatic Framework

Um bot Discord completo e profissional desenvolvido com TypeScript usando o framework Constatic.

## 🚀 Funcionalidades

- ✅ **Sistema de Automod** - Moderação automática do servidor
- ✅ **Comandos Slash** - Comandos modernos integrados ao Discord
- ✅ **Sistema de Verificação** - Verificação automática de membros
- ✅ **Gerenciamento de Roles** - Criação e gerenciamento de cargos
- ✅ **Status Dinâmico** - Status que muda automaticamente
- ✅ **Integração com Voice** - Detecção de atividade em canais de voz
- ✅ **Sistema de URLs** - Monitoramento e validação de links
- ✅ **Logs Avançados** - Sistema de logging colorido e detalhado

## 🛠️ Tecnologias

- **TypeScript** - Linguagem principal
- **Discord.js v14** - Biblioteca para Discord API
- **Constatic Framework** - Framework customizado para bots
- **Zod** - Validação de schemas e ambiente
- **Chalk** - Styling para terminal

## 📋 Pré-requisitos

- Node.js 20+ 
- NPM ou Yarn
- Token do Bot Discord
- Client ID da aplicação Discord

## ⚡ Instalação e Uso Local

1. **Clone o repositório**
```bash
git clone https://github.com/22ez0/eixobot.git
cd eixobot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` com:
```env
BOT_TOKEN=seu_token_do_discord
CLIENT_ID=seu_client_id
GUILD_ID=id_do_servidor_teste (opcional)
WEBHOOK_LOGS_URL=url_webhook_logs (opcional)
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```

5. **Build para produção**
```bash
npm run build
npm start
```

## 🚀 Deploy no Render

Este bot está configurado para deploy automático no Render:

1. **Fork/Clone este repositório para seu GitHub**

2. **Crie uma conta no [Render](https://render.com)**

3. **Conecte seu repositório**:
   - No Render: New + → Background Service
   - Conecte seu repositório GitHub

4. **Configure as variáveis de ambiente**:
   ```
   BOT_TOKEN=seu_token_do_discord
   CLIENT_ID=seu_client_id
   NODE_ENV=production
   ```

5. **O Render detectará automaticamente** o arquivo `render.yaml` e fará o deploy!

### Configurações do Serviço Render

- **Tipo**: Background Service
- **Environment**: Node
- **Build Command**: `npm run render-build`
- **Start Command**: `npm run render-start`
- **Auto-Deploy**: Habilitado

## 📁 Estrutura do Projeto

```
src/
├── discord/
│   ├── base/           # Framework base Constatic
│   ├── commands/       # Comandos slash do bot
│   ├── events/         # Event handlers
│   └── responders/     # Responders para interações
├── functions/          # Funções auxiliares
├── env.ts             # Validação de ambiente
└── index.ts           # Entry point

build/                 # Arquivos compilados
render.yaml           # Configuração do Render
DEPLOY.md             # Guia detalhado de deploy
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm run start` - Executa versão compilada
- `npm run check` - Verifica tipos TypeScript
- `npm run watch` - Executa com auto-reload

## 🤖 Como Obter Token e Client ID

1. **Acesse o [Discord Developer Portal](https://discord.com/developers/applications)**
2. **Crie uma Nova Aplicação**
3. **Copie o Client ID** da página General Information
4. **Vá para Bot** → Reset Token → **Copie o Bot Token**
5. **Configure os Gateway Intents necessários**:
   - ✅ Guilds
   - ✅ Guild Members (Intent privilegiado)
   - ✅ Guild Messages
   - ✅ Message Content (Intent privilegiado)
   - ✅ Guild Voice States
   - ✅ Guild Presences (Intent privilegiado)
6. **Configure as permissões** no Bot → OAuth2 → URL Generator:
   - Bot scope + Administrator (ou permissões específicas)

### ⚠️ Importante sobre Intents Privilegiados
Os intents privilegiados precisam ser aprovados pelo Discord para bots em 100+ servidores. Para desenvolvimento, ative-os manualmente no Developer Portal.

## 📝 Comandos Disponíveis

- `/ping` - Testa a latência do bot
- `/verify` - Sistema de verificação
- `/rules` - Cria canal de regras automático
- `/roleall` - Gerenciamento de cargos
- E muito mais!

**📌 Registro Automático**: Os comandos slash são registrados automaticamente quando o bot inicia pela primeira vez.

## 🐛 Troubleshooting

**Bot não conecta?**
- Verifique se `BOT_TOKEN` e `CLIENT_ID` estão corretos
- Confirme que o bot tem permissões no servidor

**Comandos não aparecem?**
- Aguarde até 1 hora para sincronização global
- Use `GUILD_ID` para testes mais rápidos

**Erros de build?**
- Execute `npm run check` para verificar tipos
- Confirme que Node.js 20+ está instalado

## 📊 Status do Deploy

*Badge de status será disponibilizado após o primeiro deploy no Render*

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**22ez0** - [GitHub](https://github.com/22ez0)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!