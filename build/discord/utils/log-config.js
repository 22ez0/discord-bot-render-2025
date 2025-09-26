import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
const CONFIG_PATH = join(process.cwd(), 'logs-config.json');
// Carregar configuração
export function loadLogConfig() {
    try {
        if (!existsSync(CONFIG_PATH)) {
            return {};
        }
        const data = readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Erro ao carregar configuração de logs:', error);
        return {};
    }
}
// Salvar configuração  
export function saveLogConfig(config) {
    try {
        writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    }
    catch (error) {
        console.error('Erro ao salvar configuração de logs:', error);
    }
}
// Obter configuração de uma guild
export function getGuildLogConfig(guildId) {
    const config = loadLogConfig();
    return config[guildId] || null;
}
// Definir canal de logs para uma guild
export function setGuildLogChannel(guildId, channelId) {
    const config = loadLogConfig();
    if (!config[guildId]) {
        config[guildId] = {
            channelId,
            enabledEvents: {
                moderation: true,
                messages: true,
                members: true,
                server: true
            },
            ignoredChannels: [],
            ignoredUsers: []
        };
    }
    else {
        config[guildId].channelId = channelId;
    }
    saveLogConfig(config);
}
// Função melhorada para encontrar canal de logs
export async function getLogChannel(guildId, client) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            return null;
        // Primeiro tentar configuração salva
        const guildConfig = getGuildLogConfig(guildId);
        if (guildConfig?.channelId) {
            const configuredChannel = guild.channels.cache.get(guildConfig.channelId);
            if (configuredChannel && configuredChannel.isTextBased()) {
                return configuredChannel;
            }
        }
        // Fallback: procurar por nome (mantém compatibilidade)
        const fallbackChannel = guild.channels.cache.find((ch) => ch.isTextBased() &&
            (ch.name.includes('log') || ch.name.includes('audit') || ch.name.includes('moderação')));
        return fallbackChannel || null;
    }
    catch (error) {
        console.error('Erro ao obter canal de logs:', error);
        return null;
    }
}
// Verificar se evento está habilitado
export function isEventEnabled(guildId, eventType) {
    const config = getGuildLogConfig(guildId);
    return config?.enabledEvents[eventType] ?? true; // Default: habilitado
}
// Verificar se canal/usuário deve ser ignorado
export function shouldIgnore(guildId, channelId, userId) {
    const config = getGuildLogConfig(guildId);
    if (!config)
        return false;
    if (channelId && config.ignoredChannels.includes(channelId))
        return true;
    if (userId && config.ignoredUsers.includes(userId))
        return true;
    return false;
}
