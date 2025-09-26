import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Estrutura de dados para configurações do servidor
export interface ServerConfig {
    guildId: string;
    emojis?: Record<string, string>;
    automod?: {
        enabled: boolean;
        antiSpam: {
            enabled: boolean;
            maxMessages: number;
            timeWindow: number; // em segundos
            punishment: 'warn' | 'timeout' | 'kick' | 'ban';
            punishmentDuration?: number; // em minutos para timeout
        };
        antiLinks: {
            enabled: boolean;
            allowWhitelist: boolean;
            whitelist: string[];
            punishment: 'warn' | 'timeout' | 'kick' | 'ban';
            customRules: {
                enabled: boolean;
                allowedDomains: string[]; // gif, tiktok, instagram, spotify
                blockDiscordInvites: boolean;
                exemptUserId?: string; // ID do usuário especial
                timeoutDuration: number; // 10 minutos para invites
            };
        };
        bannedWords: {
            enabled: boolean;
            words: string[];
            punishment: 'warn' | 'timeout' | 'kick' | 'ban';
            ignoreRoles: string[]; // roles que ignoram filtro
            customRules: {
                enabled: boolean;
                agePatterns: boolean; // detectar padrões de idade
                strictMode: boolean; // modo rigoroso
                exemptUserId?: string; // ID do usuário especial
            };
        };
        antiSpamAdvanced: {
            enabled: boolean;
            spamMessages: number; // 8 mensagens em X segundos
            spamTimeWindow: number; // 4 segundos
            spamPunishment: 'timeout';
            spamTimeoutDuration: number; // 30 segundos
            identicalMessages: number; // 3 mensagens idênticas
            identicalTimeWindow: number; // 4 segundos
            identicalPunishment: 'timeout';
            identicalTimeoutDuration: number; // 60 segundos
            warningSystem: {
                enabled: boolean;
                maxWarnings: number; // 3 avisos
                escalationActions: ('kick' | 'ban')[];
            };
            exemptUserId?: string; // ID do usuário especial
        };
    };
    clSystem?: {
        enabled: boolean;
        allowedUsers: string[];
        allowedRoles: string[];
        customTriggers: string[];
        deleteOwnMessage: boolean;
    };
    automation?: {
        welcome: {
            enabled: boolean;
            channelId?: string;
            message?: string;
            embedColor?: string;
        };
        goodbye: {
            enabled: boolean;
            channelId?: string;
            message?: string;
        };
        autoRoles: {
            enabled: boolean;
            roles: string[];
        };
        voiceChannels?: {
            enabled: boolean;
            joinChannelId?: string;
            leaveChannelId?: string;
        };
    };
    logs?: {
        channelId?: string;
        events: {
            moderation: boolean;
            members: boolean;
            messages: boolean;
            voice: boolean;
        };
    };
    parceiros?: {
        roleId?: string;
        serversChannelId?: string; // ID específico do canal servers
        enabled: boolean;
    };
}

class StorageManager {
    private dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : './data';
    private cache = new Map<string, ServerConfig>();

    constructor() {
        this.ensureDataDir();
    }

    private ensureDataDir() {
        if (!existsSync(this.dataDir)) {
            mkdirSync(this.dataDir, { recursive: true });
            console.log('📁 Diretório de dados criado');
        }
    }

    private getFilePath(guildId: string): string {
        return join(this.dataDir, `${guildId}.json`);
    }

    // Carregar configurações do servidor
    getServerConfig(guildId: string): ServerConfig {
        // Verificar cache primeiro
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId)!;
        }

        const filePath = this.getFilePath(guildId);
        
        try {
            if (existsSync(filePath)) {
                const data = readFileSync(filePath, 'utf-8');
                const config = JSON.parse(data) as ServerConfig;
                this.cache.set(guildId, config);
                return config;
            }
        } catch (error) {
            console.error(`Erro ao carregar configurações do servidor ${guildId}:`, error);
        }

        // Configuração padrão
        const defaultConfig: ServerConfig = {
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
    saveServerConfig(guildId: string, config: Partial<ServerConfig>): boolean {
        try {
            const currentConfig = this.getServerConfig(guildId);
            const updatedConfig = { ...currentConfig, ...config };
            
            const filePath = this.getFilePath(guildId);
            writeFileSync(filePath, JSON.stringify(updatedConfig, null, 2));
            
            // Atualizar cache
            this.cache.set(guildId, updatedConfig);
            
            console.log(`💾 Configurações salvas para servidor ${guildId}`);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar configurações do servidor ${guildId}:`, error);
            return false;
        }
    }

    // Atualizar emojis do servidor
    updateServerEmojis(guildId: string, emojis: Record<string, string>): boolean {
        const config = this.getServerConfig(guildId);
        config.emojis = { ...config.emojis, ...emojis };
        return this.saveServerConfig(guildId, config);
    }

    // Obter emojis do servidor
    getServerEmojis(guildId: string): Record<string, string> | undefined {
        const config = this.getServerConfig(guildId);
        return config.emojis;
    }

    // Atualizar configurações de automod
    updateAutomodConfig(guildId: string, automodConfig: Partial<ServerConfig['automod']>): boolean {
        const config = this.getServerConfig(guildId);
        if (config.automod && automodConfig) {
            config.automod = { ...config.automod, ...automodConfig };
        }
        return this.saveServerConfig(guildId, config);
    }

    // Função para inicializar automod e!mod com configurações padrão
    initializeEmodAutomod(guildId: string): boolean {
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
    updateAutomationConfig(guildId: string, automationConfig: Partial<ServerConfig['automation']>): boolean {
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
    getAllConfigs(): Map<string, ServerConfig> {
        return new Map(this.cache);
    }
}

// Singleton para gerenciar o storage
export const storage = new StorageManager();

// Funções de conveniência para backward compatibility
export function getServerConfig(guildId: string): ServerConfig {
    return storage.getServerConfig(guildId);
}

export function saveServerConfig(guildId: string, config: Partial<ServerConfig>): boolean {
    return storage.saveServerConfig(guildId, config);
}

export function updateServerEmojis(guildId: string, emojis: Record<string, string>): boolean {
    return storage.updateServerEmojis(guildId, emojis);
}

export function getServerEmojis(guildId: string): Record<string, string> | undefined {
    return storage.getServerEmojis(guildId);
}