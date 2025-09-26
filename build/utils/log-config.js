import { ChannelType, PermissionsBitField } from 'discord.js';
// Sistema básico de configuração de logs (em memória)
const guildLogChannels = new Map();
// Definir canal de logs para uma guild  
export function setGuildLogChannel(guildId, channelId) {
    guildLogChannels.set(guildId, channelId);
    console.log(`Canal de logs configurado para guild ${guildId}: ${channelId}`);
}
// Função unificada para encontrar canal de logs
export async function getLogChannel(guildId, client) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            return null;
        // Primeiro tentar configuração salva (em memória)
        const savedChannelId = guildLogChannels.get(guildId);
        if (savedChannelId) {
            const savedChannel = guild.channels.cache.get(savedChannelId);
            if (savedChannel && savedChannel.isTextBased()) {
                // Verificar se o bot tem permissões no canal configurado
                const botPermissions = savedChannel.permissionsFor(guild.members.me);
                if (botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    return savedChannel;
                }
                console.warn(`Bot não tem permissões no canal de logs configurado: ${savedChannelId}`);
            }
        }
        // Fallback: procurar por nome (mantém compatibilidade)
        const fallbackChannel = guild.channels.cache.find((ch) => ch.type === ChannelType.GuildText &&
            (ch.name.includes('log') || ch.name.includes('audit') || ch.name.includes('moderação')));
        if (fallbackChannel) {
            const botPermissions = fallbackChannel.permissionsFor(guild.members.me);
            if (botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                return fallbackChannel;
            }
        }
        return null;
    }
    catch (error) {
        console.error('Erro ao obter canal de logs:', error);
        return null;
    }
}
