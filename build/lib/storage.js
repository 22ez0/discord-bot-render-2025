import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
class StorageManager {
    constructor() {
        this.dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : './data';
        this.cache = new Map();
        this.ensureDataDir();
    }
    ensureDataDir() {
        if (!existsSync(this.dataDir)) {
            mkdirSync(this.dataDir, { recursive: true });
            console.log('📁 Diretório de dados criado');
        }
    }
    getFilePath(guildId) {
        return join(this.dataDir, `${guildId}.json`);
    }
    // Carregar configurações do servidor
    getServerConfig(guildId) {
        // Verificar cache primeiro
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }
        const filePath = this.getFilePath(guildId);
        try {
            if (existsSync(filePath)) {
                const data = readFileSync(filePath, 'utf-8');
                const config = JSON.parse(data);
                this.cache.set(guildId, config);
                return config;
            }
        }
        catch (error) {
            console.error(`Erro ao carregar configurações do servidor ${guildId}:`, error);
        }
        // Configuração padrão
        const defaultConfig = {
            guildId,
            automod: {
                enabled: false,
                antiSpam: {
                    enabled: false,
                    maxMessages: 5,
                    timeWindow: 10,
                    punishment: 'timeout',
                    punishmentDuration: 10
                },
                antiLinks: {
                    enabled: false,
                    allowWhitelist: true,
                    whitelist: [],
                    punishment: 'warn',
                    customRules: {
                        enabled: false,
                        allowedDomains: [],
                        blockDiscordInvites: false,
                        timeoutDuration: 10
                    }
                },
                bannedWords: {
                    enabled: false,
                    words: [],
                    punishment: 'warn',
                    ignoreRoles: [],
                    customRules: {
                        enabled: false,
                        agePatterns: false,
                        strictMode: false
                    }
                },
                antiSpamAdvanced: {
                    enabled: false,
                    spamMessages: 5,
                    spamTimeWindow: 10,
                    spamPunishment: 'timeout',
                    spamTimeoutDuration: 30,
                    identicalMessages: 3,
                    identicalTimeWindow: 10,
                    identicalPunishment: 'timeout',
                    identicalTimeoutDuration: 60,
                    warningSystem: {
                        enabled: false,
                        maxWarnings: 3,
                        escalationActions: ['kick', 'ban']
                    }
                }
            },
            automation: {
                welcome: {
                    enabled: false,
                    message: 'Bem-vindo(a) ao servidor, {user}! 👋'
                },
                goodbye: {
                    enabled: false,
                    message: '{user} saiu do servidor. 😢'
                },
                autoRoles: {
                    enabled: false,
                    roles: []
                },
                voiceChannels: {
                    enabled: true,
                    joinChannelId: '1418330613055750278'
                }
            },
            logs: {
                events: {
                    moderation: true,
                    members: true,
                    messages: false,
                    voice: false
                }
            },
            clSystem: {
                enabled: true,
                allowedUsers: [],
                allowedRoles: [],
                customTriggers: ['cl', 'clear', 'limpar'],
                deleteOwnMessage: true
            }
        };
        this.cache.set(guildId, defaultConfig);
        return defaultConfig;
    }
    // Salvar configurações do servidor
    saveServerConfig(guildId, config) {
        try {
            const currentConfig = this.getServerConfig(guildId);
            const updatedConfig = { ...currentConfig, ...config };
            const filePath = this.getFilePath(guildId);
            writeFileSync(filePath, JSON.stringify(updatedConfig, null, 2));
            // Atualizar cache
            this.cache.set(guildId, updatedConfig);
            console.log(`💾 Configurações salvas para servidor ${guildId}`);
            return true;
        }
        catch (error) {
            console.error(`Erro ao salvar configurações do servidor ${guildId}:`, error);
            return false;
        }
    }
    // Atualizar emojis do servidor
    updateServerEmojis(guildId, emojis) {
        const config = this.getServerConfig(guildId);
        config.emojis = { ...config.emojis, ...emojis };
        return this.saveServerConfig(guildId, config);
    }
    // Obter emojis do servidor
    getServerEmojis(guildId) {
        const config = this.getServerConfig(guildId);
        return config.emojis;
    }
    // Atualizar configurações de automod
    updateAutomodConfig(guildId, automodConfig) {
        const config = this.getServerConfig(guildId);
        if (config.automod && automodConfig) {
            config.automod = { ...config.automod, ...automodConfig };
        }
        return this.saveServerConfig(guildId, config);
    }
    // Função para inicializar automod e!mod com configurações padrão
    initializeEmodAutomod(guildId) {
        const config = this.getServerConfig(guildId);
        // Configurar automod e!mod com valores padrão das especificações
        config.automod = {
            enabled: true,
            antiSpam: {
                enabled: false, // Usar o sistema avançado
                maxMessages: 5,
                timeWindow: 10,
                punishment: 'timeout',
                punishmentDuration: 10
            },
            antiLinks: {
                enabled: true,
                allowWhitelist: false,
                whitelist: [],
                punishment: 'timeout',
                customRules: {
                    enabled: true,
                    allowedDomains: ['gif', 'giphy.com', 'tenor.com', 'tiktok.com', 'vm.tiktok.com', 'instagram.com', 'ig.com', 'spotify.com', 'open.spotify.com'],
                    blockDiscordInvites: true,
                    exemptUserId: '1415549624747560970',
                    timeoutDuration: 10 // 10 minutos para invites
                }
            },
            bannedWords: {
                enabled: true,
                words: ['cp', 'child porn', 'cepe', 'sepe', 'estupro', 'estuprar', 'gordo', 'gorda', 'rape', 'cortes', 'lulz', 'automutilação'],
                punishment: 'warn',
                ignoreRoles: [],
                customRules: {
                    enabled: true,
                    agePatterns: true,
                    strictMode: true,
                    exemptUserId: '1415549624747560970'
                }
            },
            antiSpamAdvanced: {
                enabled: true,
                spamMessages: 8, // 8 mensagens em 4 segundos
                spamTimeWindow: 4, // 4 segundos
                spamPunishment: 'timeout',
                spamTimeoutDuration: 30, // 30 segundos
                identicalMessages: 3, // 3 mensagens idênticas em 4 segundos  
                identicalTimeWindow: 4, // 4 segundos
                identicalPunishment: 'timeout',
                identicalTimeoutDuration: 60, // 60 segundos (1 minuto)
                warningSystem: {
                    enabled: true,
                    maxWarnings: 3, // 3 avisos para kick
                    escalationActions: ['kick', 'ban'] // 3º = kick, 4º = ban
                },
                exemptUserId: '1415549624747560970'
            }
        };
        // Salvar configurações com força - garantir persistência
        const success = this.saveServerConfig(guildId, config);
        if (success) {
            console.log(`💾 Configurações e!mod salvas automaticamente para ${guildId}`);
        }
        return success;
    }
    // Atualizar configurações de automação
    updateAutomationConfig(guildId, automationConfig) {
        const config = this.getServerConfig(guildId);
        if (config.automation && automationConfig) {
            config.automation = { ...config.automation, ...automationConfig };
        }
        return this.saveServerConfig(guildId, config);
    }
    // Limpar cache (útil para desenvolvimento)
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }
    // Obter todas as configurações de servidores (para backup/debug)
    getAllConfigs() {
        return new Map(this.cache);
    }
}
// Singleton para gerenciar o storage
export const storage = new StorageManager();
// Funções de conveniência para backward compatibility
export function getServerConfig(guildId) {
    return storage.getServerConfig(guildId);
}
export function saveServerConfig(guildId, config) {
    return storage.saveServerConfig(guildId, config);
}
export function updateServerEmojis(guildId, emojis) {
    return storage.updateServerEmojis(guildId, emojis);
}
export function getServerEmojis(guildId) {
    return storage.getServerEmojis(guildId);
}
