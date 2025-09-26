import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { startServer } from './server.js';
import { env } from './env.js';
import { loadCommands } from './bot/commands.js';
import { loadEvents } from './bot/events.js';
// Adicionar handlers para erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});
// Iniciar servidor HTTP para health check
console.log('🚀 Iniciando servidor HTTP...');
startServer();
// Aguardar um pouco antes de inicializar o Discord
await new Promise(resolve => setTimeout(resolve, 1000));
// Criar cliente Discord simples e direto
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});
// Collection para armazenar comandos
client.commands = new Collection();
// Carregar comandos e eventos
await loadCommands(client);
await loadEvents(client);
// Definir presença quando conectar
client.once('ready', (client) => {
    console.log(`✅ Bot online como ${client.user.tag}!`);
    // Definir status
    client.user.setPresence({
        activities: [{
                name: 'desenvolvido por vegas!',
                type: ActivityType.Streaming,
                url: 'https://www.twitch.tv/discord'
            }],
        status: 'online'
    });
});
// Iniciar bot Discord
console.log('🤖 Iniciando bot Discord...');
client.login(env.BOT_TOKEN);
