import { ActivityType } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } from "@discordjs/voice";
import { storage } from "../../../lib/storage.js";
// Lista de status para alternar
const streamingStatusList = [
    'desenvolvido por vegas!',
    'sistema eixo ativo!',
    'moderação automática!',
    'comandos /eixo disponíveis!'
];
// Variável para controlar o índice da lista
let currentIndex = 0;
// Controle de conexões de voz ativas
const activeConnections = new Map();
/**
 * Conectar em um canal de voz
 */
export async function joinVoiceChannelById(guildId, channelId, client) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`⚠️ Guild ${guildId} não encontrada`);
            return false;
        }
        const channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== 2) { // 2 = GUILD_VOICE
            console.log(`⚠️ Canal de voz ${channelId} não encontrado`);
            return false;
        }
        // Verificar se já está conectado
        const existingConnection = getVoiceConnection(guildId);
        if (existingConnection) {
            console.log(`🎵 Já conectado em canal de voz no servidor ${guild.name}`);
            return true;
        }
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        activeConnections.set(guildId, connection);
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`✅ Conectado ao canal de voz ${channel.name} no servidor ${guild.name}`);
        });
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log(`❌ Desconectado do canal de voz no servidor ${guild.name}`);
            activeConnections.delete(guildId);
        });
        connection.on('error', (error) => {
            console.error(`⚠️ Erro na conexão de voz do servidor ${guild.name}:`, error);
            activeConnections.delete(guildId);
        });
        return true;
    }
    catch (error) {
        console.error('⚠️ Erro ao conectar no canal de voz:', error);
        return false;
    }
}
/**
 * Desconectar do canal de voz
 */
export function leaveVoiceChannel(guildId) {
    try {
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
            activeConnections.delete(guildId);
            console.log(`✅ Desconectado do canal de voz no servidor ${guildId}`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('⚠️ Erro ao desconectar do canal de voz:', error);
        return false;
    }
}
/**
 * Verificar se está conectado em algum canal de voz
 */
export function isConnectedToVoice(guildId) {
    return activeConnections.has(guildId);
}
/**
 * Auto-conectar em canais configurados
 */
export async function autoConnectVoiceChannels(client) {
    console.log('🎵 Verificando canais de voz configurados para auto-conexão...');
    try {
        for (const guild of client.guilds.cache.values()) {
            const config = storage.getServerConfig(guild.id);
            if (config.automation?.voiceChannels?.enabled && config.automation.voiceChannels.joinChannelId) {
                const success = await joinVoiceChannelById(guild.id, config.automation.voiceChannels.joinChannelId, client);
                if (success) {
                    console.log(`🎵 Auto-conectado ao canal de voz ID: ${config.automation.voiceChannels.joinChannelId} no servidor ${guild.name}`);
                }
                else {
                    console.log(`⚠️ Falha ao conectar no canal de voz ID: ${config.automation.voiceChannels.joinChannelId} no servidor ${guild.name}`);
                }
            }
        }
    }
    catch (error) {
        console.error('⚠️ Erro durante auto-conexão de voz:', error);
    }
}
/**
 * Event handler para mudanças de estado de voz dos usuários
 */
export function handleVoiceStateUpdate(oldState, newState) {
    // Log de entrada/saída de canais de voz
    if (oldState.channelId !== newState.channelId) {
        const guildId = newState.guild.id;
        const config = storage.getServerConfig(guildId);
        if (config.logs?.events?.voice) {
            // Implementar logs de voz se necessário
        }
    }
}
/**
 * Configura o status de transmissão dinâmico do bot e inicializa funcionalidades de voz
 * @param {Client} client O cliente do Discord.
 */
export const handleVoiceAndStatus = (client) => {
    // URL da Twitch para o status de 'Streaming'
    const twitchUrl = 'https://www.twitch.tv/discord';
    // Aguardar um pouco antes de definir presence (evitar erro de shard)
    setTimeout(() => {
        try {
            // --- Mudar o status inicialmente ---
            client.user?.setPresence({
                activities: [{
                        name: streamingStatusList[currentIndex],
                        type: ActivityType.Streaming,
                        url: twitchUrl,
                    }],
                status: 'online',
            });
            currentIndex = (currentIndex + 1) % streamingStatusList.length;
            console.log('✅ Status inicial definido com sucesso');
            // Inicializar funcionalidades de voz - REATIVADO
            console.log('🎵 Funcionalidade de voz ATIVADA - inicializando...');
            autoConnectVoiceChannels(client);
            // Configurar event listener para voice state updates
            client.on('voiceStateUpdate', (oldState, newState) => {
                handleVoiceStateUpdate(oldState, newState);
            });
        }
        catch (error) {
            console.log('⚠️ Erro ao definir presence:', error instanceof Error ? error.message : String(error));
        }
    }, 2000); // 2 segundos de delay - mais rápido
    // --- Loop para mudar o status a cada 20 segundos (com verificação) ---
    setTimeout(() => {
        setInterval(() => {
            try {
                if (client.user && client.isReady()) {
                    client.user.setActivity(streamingStatusList[currentIndex], {
                        type: ActivityType.Streaming,
                        url: twitchUrl,
                    });
                    currentIndex = (currentIndex + 1) % streamingStatusList.length;
                }
            }
            catch (error) {
                console.log('⚠️ Erro ao atualizar status:', error instanceof Error ? error.message : String(error));
            }
        }, 30000); // 30 segundos - mais estável
    }, 5000); // Começar após 5 segundos
};
