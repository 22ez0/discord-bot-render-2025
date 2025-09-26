import { createEvent } from "#base";
import { Message, EmbedBuilder, GuildMember } from "discord.js";
import { storage } from "../../lib/storage.js";

// Sistema de tracking para anti-spam
const messageTracker = new Map<string, { messages: number; timestamp: number }>();
// Sistema de tracking para mensagens idênticas
const identicalTracker = new Map<string, Map<string, { count: number; timestamp: number }>>();
// Sistema de tracking de avisos
const warningTracker = new Map<string, number>();

// Palavras proibidas específicas solicitadas
const BANNED_WORDS_CUSTOM = [
    'cp', 'child porn', 'cepe', 'sepe', 'estupro', 'estuprar', 
    'gordo', 'gorda', 'rape', 'cortes', 'lulz', 'automutilação'
];

// Padrões de idade perigosos
const AGE_PATTERNS = [
    /\b(?:tenho|sou|tenho apenas|só tenho)\s*(\d{1,2})\s*anos?\b/gi,
    /\b(\d{1,2})\s*anos?\s*(?:de idade|pra baixo|para baixo)\b/gi,
    /\b(?:menor|menina|garota|criança)\s*(?:de\s*)?(\d{1,2})\s*anos?\b/gi
];

// Domínios permitidos para links
const ALLOWED_DOMAINS = [
    'gif', 'giphy.com', 'tenor.com', 
    'tiktok.com', 'vm.tiktok.com',
    'instagram.com', 'ig.com',
    'spotify.com', 'open.spotify.com'
];

// REMOVIDO: Bypass global removido por questões de segurança
// const EXEMPT_USER_ID = '1415549624747560970';

// Lista de domínios maliciosos comuns
const maliciousDomains = [
    'discord.gg',
    'discord.com/invite',
    'discordapp.com/invite',
    'bit.ly',
    'tinyurl.com',
    'shorturl.at'
];

// Sistema de automod
createEvent({
    name: "AutoMod Message Handler",
    event: "messageCreate",
    once: false,
    async run(message: Message) {
        // Ignorar bots e mensagens DM
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const config = storage.getServerConfig(guildId);

        // Verificar se automod está habilitado
        if (!config.automod?.enabled) return;

        const member = message.member;
        if (!member) return;

        try {
            // REMOVIDO: Verificação de bypass global por segurança
            // if (message.author.id === EXEMPT_USER_ID) {
            //     return; // Usuário especial pode fazer tudo
            // }

            // Verificar se é cargo "parceiros" no canal servers (pode postar links de servidores)
            const isParceiroInServers = checkParceiroPermission(message, member);
            if (isParceiroInServers) {
                // Parceiros podem postar links no canal servers, mas ainda respeitam outras regras
                console.log(`🤝 Usuário ${message.author.tag} tem cargo parceiros no canal servers - links permitidos`);
            }

            // Sistema Anti-Spam Avançado (novo)
            if (config.automod.antiSpamAdvanced?.enabled) {
                const spamResult = await checkAdvancedAntiSpam(message, config.automod.antiSpamAdvanced);
                if (spamResult.isViolation) {
                    await handleAdvancedViolation(message, spamResult.type || 'Anti-Spam', spamResult.punishment || 'warn', spamResult.duration || 60);
                    return;
                }
            }

            // Sistema Anti-Links Customizado (exceto para parceiros no canal servers)
            if (config.automod.antiLinks?.enabled && config.automod.antiLinks.customRules?.enabled && !isParceiroInServers) {
                const linkResult = checkCustomAntiLinks(message, config.automod.antiLinks);
                if (linkResult.isViolation) {
                    await handleAdvancedViolation(message, linkResult.type || 'Anti-Links', linkResult.punishment || 'warn', linkResult.duration || 60);
                    return;
                }
            }

            // Sistema de Palavras Proibidas Customizado
            if (config.automod.bannedWords?.enabled && config.automod.bannedWords.customRules?.enabled) {
                const wordResult = checkCustomBannedWords(message, config.automod.bannedWords, member);
                if (wordResult.isViolation) {
                    await handleAdvancedViolation(message, wordResult.type || 'Palavra Proibida', wordResult.punishment || 'warn', wordResult.duration || 0);
                    return;
                }
            }

            // Sistemas antigos (fallback)
            if (config.automod.antiSpam?.enabled) {
                const isSpam = await checkAntiSpam(message, config.automod.antiSpam);
                if (isSpam) {
                    await handleViolation(message, 'Anti-Spam', config.automod.antiSpam.punishment);
                    return;
                }
            }

            if (config.automod.antiLinks?.enabled) {
                const hasIllegalLink = checkAntiLinks(message, config.automod.antiLinks);
                if (hasIllegalLink) {
                    await handleViolation(message, 'Anti-Links', config.automod.antiLinks.punishment);
                    return;
                }
            }

            if (config.automod.bannedWords?.enabled) {
                const hasBannedWord = checkBannedWords(message, config.automod.bannedWords, member);
                if (hasBannedWord) {
                    await handleViolation(message, 'Palavra Proibida', config.automod.bannedWords.punishment);
                    return;
                }
            }

            // ===== SISTEMA CL =====
            // Verificar se é comando CL
            const content = message.content.trim().toLowerCase();
            const isCLCommand = content === 'cl' || config.clSystem?.customTriggers?.includes(content);

            if (isCLCommand && config.clSystem?.enabled) {
                await handleCLCommand(message, config);
                return; // Não processar outras regras se for comando CL
            }

        } catch (error) {
            console.error('Erro no sistema de automod:', error);
        }
    }
});

async function checkAntiSpam(message: Message, antiSpamConfig: any): Promise<boolean> {
    const userId = message.author.id;
    const now = Date.now();
    const timeWindow = antiSpamConfig.timeWindow * 1000; // converter para ms
    
    const userTracker = messageTracker.get(userId) || { messages: 0, timestamp: now };
    
    // Resetar contador se passou do tempo limite
    if (now - userTracker.timestamp > timeWindow) {
        userTracker.messages = 1;
        userTracker.timestamp = now;
    } else {
        userTracker.messages++;
    }
    
    messageTracker.set(userId, userTracker);
    
    // Verificar se ultrapassou o limite
    if (userTracker.messages > antiSpamConfig.maxMessages) {
        console.log(`🛡️ Anti-Spam ativado para ${message.author.tag} (${userTracker.messages} mensagens)`);
        return true;
    }
    
    return false;
}

function checkAntiLinks(message: Message, antiLinksConfig: any): boolean {
    const content = message.content.toLowerCase();
    
    // Verificar convites do Discord
    const discordInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+/gi;
    if (discordInviteRegex.test(content)) {
        console.log(`🛡️ Anti-Links ativado para ${message.author.tag} (convite Discord)`);
        return true;
    }
    
    // Verificar domínios maliciosos
    for (const domain of maliciousDomains) {
        if (content.includes(domain)) {
            // Verificar whitelist se habilitada
            if (antiLinksConfig.allowWhitelist && antiLinksConfig.whitelist.includes(domain)) {
                continue;
            }
            console.log(`🛡️ Anti-Links ativado para ${message.author.tag} (domínio: ${domain})`);
            return true;
        }
    }
    
    return false;
}

function checkBannedWords(message: Message, bannedWordsConfig: any, member: GuildMember): boolean {
    const content = message.content.toLowerCase();
    
    // Verificar se o usuário tem roles que ignoram o filtro
    if (bannedWordsConfig.ignoreRoles?.some((roleId: string) => member.roles.cache.has(roleId))) {
        return false;
    }
    
    // Verificar palavras proibidas
    for (const word of bannedWordsConfig.words) {
        if (content.includes(word.toLowerCase())) {
            console.log(`🛡️ Palavra proibida detectada de ${message.author.tag}: ${word}`);
            return true;
        }
    }
    
    return false;
}

async function handleViolation(message: Message, violationType: string, punishment: string) {
    try {
        // Deletar a mensagem
        await message.delete().catch(() => null);
        
        const member = message.member!;
        const logChannel = await getLogChannel(message.guild!.id, message.client);
        
        // Aplicar punição
        switch (punishment) {
            case 'warn':
                await sendWarning(member, violationType);
                break;
            case 'timeout':
                await timeoutMember(member, violationType);
                break;
            case 'kick':
                await kickMember(member, violationType);
                break;
            case 'ban':
                await banMember(member, violationType);
                break;
        }
        
        // Log da ação
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("🛡️ **AUTO-MODERAÇÃO** | Violação Detectada")
                .setDescription(
                    `**Usuário:** ${member.user.tag} (${member.id})\n` +
                    `**Tipo:** ${violationType}\n` +
                    `**Punição:** ${punishment}\n` +
                    `**Canal:** ${message.channel}\n` +
                    `**Conteúdo:** \`${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\``
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
                
            await logChannel.send({ embeds: [embed] }).catch(() => null);
        }
        
    } catch (error) {
        console.error(`Erro ao processar violação de ${violationType}:`, error);
    }
}

async function sendWarning(member: GuildMember, violationType: string) {
    try {
        const embed = new EmbedBuilder()
            .setColor("#ff9f43")
            .setTitle("⚠️ **AVISO** | Auto-Moderação")
            .setDescription(
                `Você recebeu um aviso por violação das regras:\n\n` +
                `**Tipo:** ${violationType}\n` +
                `**Servidor:** ${member.guild.name}\n\n` +
                `Por favor, respeite as regras do servidor para evitar punições mais severas.`
            )
            .setTimestamp();
            
        await member.send({ embeds: [embed] }).catch(() => null);
        console.log(`⚠️ Aviso enviado para ${member.user.tag} por ${violationType}`);
    } catch (error) {
        console.error('Erro ao enviar aviso:', error);
    }
}

async function timeoutMember(member: GuildMember, violationType: string) {
    try {
        const config = storage.getServerConfig(member.guild.id);
        const duration = config.automod?.antiSpam?.punishmentDuration || 10; // 10 minutos padrão
        
        await member.timeout(duration * 60 * 1000, `Auto-Mod: ${violationType}`);
        console.log(`🔇 ${member.user.tag} foi colocado em timeout por ${duration}min - ${violationType}`);
    } catch (error) {
        console.error('Erro ao aplicar timeout:', error);
    }
}

async function kickMember(member: GuildMember, violationType: string) {
    try {
        await member.kick(`Auto-Mod: ${violationType}`);
        console.log(`👢 ${member.user.tag} foi expulso por ${violationType}`);
    } catch (error) {
        console.error('Erro ao expulsar membro:', error);
    }
}

async function banMember(member: GuildMember, violationType: string) {
    try {
        await member.ban({ reason: `Auto-Mod: ${violationType}`, deleteMessageDays: 1 });
        console.log(`🔨 ${member.user.tag} foi banido por ${violationType}`);
    } catch (error) {
        console.error('Erro ao banir membro:', error);
    }
}

// Função para obter canal de logs
async function getLogChannel(guildId: string, client: any) {
    const logConfig = (globalThis as any).eixoLogConfig;
    if (logConfig?.getLogChannel) {
        return await logConfig.getLogChannel(guildId, client);
    }
    return null;
}

// Funções customizadas para as regras específicas
async function checkAdvancedAntiSpam(message: Message, config: any): Promise<{isViolation: boolean, type?: string, punishment?: string, duration?: number}> {
    const userId = message.author.id;
    const now = Date.now();
    const content = message.content;
    
    // Verificar spam de mensagens (8 mensagens em 4 segundos)
    const userTracker = messageTracker.get(userId) || { messages: 0, timestamp: now };
    
    if (now - userTracker.timestamp > config.spamTimeWindow * 1000) {
        userTracker.messages = 1;
        userTracker.timestamp = now;
    } else {
        userTracker.messages++;
    }
    
    messageTracker.set(userId, userTracker);
    
    if (userTracker.messages >= config.spamMessages) {
        console.log(`🛡️ Anti-Spam Avançado: ${message.author.tag} - ${userTracker.messages} mensagens em ${config.spamTimeWindow}s`);
        return {
            isViolation: true,
            type: 'Spam de Mensagens',
            punishment: 'timeout',
            duration: config.spamTimeoutDuration
        };
    }
    
    // Verificar mensagens idênticas (3 idênticas em 4 segundos)
    if (!identicalTracker.has(userId)) {
        identicalTracker.set(userId, new Map());
    }
    
    const userIdenticalMap = identicalTracker.get(userId)!;
    const contentHash = content.toLowerCase().trim();
    
    if (contentHash.length > 0) { // Rastrear todas as mensagens
        const identicalData = userIdenticalMap.get(contentHash) || { count: 0, timestamp: now };
        
        if (now - identicalData.timestamp > config.identicalTimeWindow * 1000) {
            identicalData.count = 1;
            identicalData.timestamp = now;
        } else {
            identicalData.count++;
        }
        
        userIdenticalMap.set(contentHash, identicalData);
        
        if (identicalData.count >= config.identicalMessages) {
            console.log(`🛡️ Anti-Spam Idêntico: ${message.author.tag} - ${identicalData.count} mensagens idênticas`);
            return {
                isViolation: true,
                type: 'Mensagens Idênticas',
                punishment: 'timeout',
                duration: config.identicalTimeoutDuration
            };
        }
    }
    
    return { isViolation: false };
}

function checkCustomAntiLinks(message: Message, config: any): {isViolation: boolean, type?: string, punishment?: string, duration?: number} {
    const content = message.content.toLowerCase();
    
    // Verificar convites do Discord
    const discordInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+/gi;
    if (config.customRules.blockDiscordInvites && discordInviteRegex.test(content)) {
        // Verificar se é convite do próprio servidor
        const guildInviteRegex = new RegExp(`discord\\.gg\\/${message.guild?.vanityURLCode}`, 'gi');
        if (!guildInviteRegex.test(content)) {
            console.log(`🛡️ Anti-Links Customizado: ${message.author.tag} - convite externo`);
            return {
                isViolation: true,
                type: 'Convite Externo',
                punishment: 'timeout',
                duration: config.customRules.timeoutDuration * 60 // converter para segundos
            };
        }
    }
    
    // Verificar links não permitidos com validação segura de hostname
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = content.match(urlRegex);
    
    if (urls) {
        for (const urlStr of urls) {
            try {
                const url = new URL(urlStr);
                const hostname = url.hostname.toLowerCase();
                let isAllowed = false;
                
                // Verificar se o hostname é exatamente um dos domínios permitidos ou subdomínio válido
                for (const allowedDomain of ALLOWED_DOMAINS) {
                    if (hostname === allowedDomain || hostname.endsWith('.' + allowedDomain)) {
                        isAllowed = true;
                        break;
                    }
                }
                
                if (!isAllowed) {
                    console.log(`🛡️ Anti-Links Customizado: ${message.author.tag} - domínio não permitido: ${hostname} (url: ${urlStr})`);
                    return {
                        isViolation: true,
                        type: `Link Não Permitido (${hostname})`,
                        punishment: 'timeout',
                        duration: 60 // 1 minuto
                    };
                }
            } catch (error) {
                // URL malformada - bloquear por segurança
                console.log(`🛡️ Anti-Links Customizado: ${message.author.tag} - URL malformada: ${urlStr}`);
                return {
                    isViolation: true,
                    type: 'URL Malformada',
                    punishment: 'timeout',
                    duration: 60
                };
            }
        }
    }
    
    return { isViolation: false };
}

function checkCustomBannedWords(message: Message, config: any, _member: GuildMember): {isViolation: boolean, type?: string, punishment?: string, duration?: number} {
    const content = message.content.toLowerCase();
    
    // Verificar palavras proibidas customizadas
    for (const word of BANNED_WORDS_CUSTOM) {
        if (content.includes(word.toLowerCase())) {
            console.log(`🛡️ Palavra Proibida Customizada: ${message.author.tag} - ${word}`);
            return {
                isViolation: true,
                type: `Palavra Proibida: ${word}`,
                punishment: 'warn',
                duration: 0
            };
        }
    }
    
    // Verificar padrões de idade perigosos
    if (config.customRules.agePatterns) {
        for (const pattern of AGE_PATTERNS) {
            let match;
            // Reset regex lastIndex para evitar problemas com global flag
            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
                // Tentar extrair idade de diferentes grupos de captura
                const ageStr = match[1] || match[2] || match[3] || '0';
                const age = parseInt(ageStr);
                if (!isNaN(age) && age <= 17) {
                    console.log(`🛡️ Padrão de Idade Detectado: ${message.author.tag} - ${age} anos - "${match[0]}"`);
                    return {
                        isViolation: true,
                        type: `Padrão de Idade Suspeito (${age} anos)`,
                        punishment: 'ban',
                        duration: 0
                    };
                }
                // Break para evitar loop infinito com regex global
                if (!pattern.global) break;
            }
        }
    }
    
    return { isViolation: false };
}

async function handleAdvancedViolation(message: Message, violationType: string, punishment: string, duration?: number) {
    try {
        // Deletar a mensagem
        await message.delete().catch(() => null);
        
        const member = message.member!;
        const logChannel = await getLogChannel(message.guild!.id, message.client);
        
        // Aplicar punição específica
        switch (punishment) {
            case 'timeout':
                if (duration) {
                    await member.timeout(duration * 1000, `Auto-Mod e!mod: ${violationType}`);
                    console.log(`🔇 ${member.user.tag} foi colocado em timeout por ${duration}s - ${violationType}`);
                }
                break;
            case 'warn':
                await handleWarningSystem(member, violationType);
                break;
            case 'kick':
                await member.kick(`Auto-Mod e!mod: ${violationType}`);
                console.log(`👢 ${member.user.tag} foi expulso por ${violationType}`);
                break;
            case 'ban':
                await member.ban({ reason: `Auto-Mod e!mod: ${violationType}`, deleteMessageDays: 1 });
                console.log(`🔨 ${member.user.tag} foi banido por ${violationType}`);
                break;
        }
        
        // Log da ação
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("🛡️ **AUTO-MODERAÇÃO e!mod** | Violação Detectada")
                .setDescription(
                    `**Usuário:** ${member.user.tag} (${member.id})\n` +
                    `**Tipo:** ${violationType}\n` +
                    `**Punição:** ${punishment}${duration ? ` (${duration}s)` : ''}\n` +
                    `**Canal:** ${message.channel}\n` +
                    `**Conteúdo:** \`${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\``
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
                
            await logChannel.send({ embeds: [embed] }).catch(() => null);
        }
        
    } catch (error) {
        console.error(`Erro ao processar violação avançada de ${violationType}:`, error);
    }
}

async function handleWarningSystem(member: GuildMember, violationType: string) {
    const userId = member.id;
    const currentWarnings = warningTracker.get(userId) || 0;
    const newWarnings = currentWarnings + 1;
    
    warningTracker.set(userId, newWarnings);
    
    console.log(`⚠️ ${member.user.tag} recebeu aviso ${newWarnings} por ${violationType}`);
    
    // Sistema de escalação
    if (newWarnings >= 4) {
        // 4º aviso = ban por IP
        await member.ban({ reason: `Auto-Mod e!mod: ${newWarnings} avisos - ${violationType}`, deleteMessageDays: 1 });
        console.log(`🔨 ${member.user.tag} foi banido por acumular ${newWarnings} avisos`);
        warningTracker.delete(userId);
    } else if (newWarnings >= 3) {
        // 3º aviso = kick
        await member.kick(`Auto-Mod e!mod: ${newWarnings} avisos - ${violationType}`);
        console.log(`👢 ${member.user.tag} foi expulso por acumular ${newWarnings} avisos`);
    } else {
        // Enviar aviso
        try {
            const embed = new EmbedBuilder()
                .setColor("#ff9f43")
                .setTitle("⚠️ **AVISO** | Auto-Moderação e!mod")
                .setDescription(
                    `Você recebeu um aviso por violação das regras:\n\n` +
                    `**Tipo:** ${violationType}\n` +
                    `**Avisos:** ${newWarnings}/3\n` +
                    `**Servidor:** ${member.guild.name}\n\n` +
                    `**Próximas punições:**\n` +
                    `• 3º aviso: Expulsão\n` +
                    `• 4º aviso: Banimento permanente\n\n` +
                    `Por favor, respeite as regras do servidor.`
                )
                .setTimestamp();
                
            await member.send({ embeds: [embed] }).catch(() => null);
        } catch (error) {
            console.error('Erro ao enviar aviso:', error);
        }
    }
}

// Função para verificar se usuário tem cargo parceiros no canal servers específico
function checkParceiroPermission(message: Message, member: GuildMember): boolean {
    const guildId = message.guild?.id;
    if (!guildId) return false;
    
    // Obter configuração do servidor
    const config = storage.getServerConfig(guildId);
    const parceirosConfig = config.parceiros;
    
    if (!parceirosConfig?.enabled || !parceirosConfig.serversChannelId || !parceirosConfig.roleId) {
        return false; // Sistema de parceiros não configurado
    }
    
    // Verificar se é exatamente o canal servers configurado
    if (message.channel.id !== parceirosConfig.serversChannelId) {
        return false; // Não é o canal servers específico
    }
    
    // Verificar se o usuário tem o cargo parceiros específico
    const hasParceirosRole = member.roles.cache.has(parceirosConfig.roleId);
    
    if (hasParceirosRole) {
        console.log(`🤝 ${member.user.tag} tem cargo parceiros no canal servers configurado (${message.channel.id}) - permissões especiais aplicadas`);
        return true;
    }
    
    return false;
}

// Limpeza periódica dos trackers (a cada 5 minutos)
setInterval(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // Limpar tracker de mensagens
    for (const [userId, data] of messageTracker.entries()) {
        if (now - data.timestamp > fiveMinutes) {
            messageTracker.delete(userId);
        }
    }
    
    // Limpar tracker de mensagens idênticas
    for (const [userId, userMap] of identicalTracker.entries()) {
        for (const [content, data] of userMap.entries()) {
            if (now - data.timestamp > fiveMinutes) {
                userMap.delete(content);
            }
        }
        if (userMap.size === 0) {
            identicalTracker.delete(userId);
        }
    }
}, 5 * 60 * 1000);

// Sistema de cooldowns para CL
const clCooldowns = new Map<string, number>();

// Função para tratar comandos CL
async function handleCLCommand(message: Message, config: any) {
    try {
        const userId = message.author.id;
        const member = message.member;
        
        if (!member) return;
        
        // Verificar permissões de usuário
        const hasPermission = member.permissions.has('ManageMessages') || 
                             config.clSystem?.allowedUsers?.includes(userId) ||
                             config.clSystem?.allowedRoles?.some((roleId: string) => member.roles.cache.has(roleId));
        
        if (!hasPermission) {
            await message.react('❌');
            return;
        }
        
        // Verificar cooldown (30 segundos)
        const now = Date.now();
        const cooldownTime = clCooldowns.get(userId);
        
        if (cooldownTime && now < cooldownTime) {
            const timeLeft = Math.ceil((cooldownTime - now) / 1000);
            await message.reply(`⏰ Aguarde ${timeLeft}s antes de usar "cl" novamente.`).catch(() => {});
            return;
        }
        
        // Verificar se o bot tem permissões necessárias
        const botMember = message.guild?.members.me;
        if (!botMember?.permissions.has(['ManageMessages', 'ReadMessageHistory', 'AddReactions'])) {
            await message.reply('❌ Não tenho permissões necessárias (Gerenciar Mensagens, Histórico de Mensagens, Adicionar Reações).').catch(() => {});
            return;
        }
        
        // Reagir com emoji de limpeza
        await message.react('🧹').catch(() => {});
        
        // Apagar a própria mensagem do comando se configurado
        if (config.clSystem?.deleteOwnMessage) {
            try {
                await message.delete();
            } catch (error) {
                console.error('Erro ao deletar mensagem do comando CL:', error);
            }
        }
        
        // Definir cooldown
        clCooldowns.set(userId, now + 30000); // 30 segundos
        
        // Verificar se é um canal de texto onde podemos deletar mensagens
        if (!('bulkDelete' in message.channel)) {
            await message.reply('❌ Comando "cl" só funciona em canais de texto do servidor.').catch(() => {});
            return;
        }
        
        const channel = message.channel as any;
        let deletedCount = 0;
        let checkedCount = 0;
        const maxChecked = 1000; // Limitar busca
        let lastMessageId = message.id;
        
        // Buscar e deletar mensagens do usuário
        while (checkedCount < maxChecked && deletedCount < 100) {
            const options: any = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }
            
            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;
            
            const userMessages = messages.filter((msg: any) => 
                msg.author.id === userId && 
                msg.id !== message.id && // Não deletar a mensagem do comando
                (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000 // 14 dias
            );
            
            if (userMessages.size > 0) {
                try {
                    // Deletar mensagens em lote se possível
                    if (userMessages.size > 1 && userMessages.every((msg: any) => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000)) {
                        await channel.bulkDelete(userMessages);
                        deletedCount += userMessages.size;
                    } else {
                        // Deletar uma por uma se não puder usar bulkDelete
                        for (const msg of userMessages.values()) {
                            try {
                                await msg.delete();
                                deletedCount++;
                                await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay
                            } catch (deleteError) {
                                console.error('Erro ao deletar mensagem individual:', deleteError);
                            }
                        }
                    }
                } catch (bulkError) {
                    console.error('Erro ao deletar mensagens em lote:', bulkError);
                    // Tentar deletar uma por uma
                    for (const msg of userMessages.values()) {
                        try {
                            await msg.delete();
                            deletedCount++;
                            await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (deleteError) {
                            console.error('Erro ao deletar mensagem individual:', deleteError);
                        }
                    }
                }
            }
            
            checkedCount += messages.size;
            lastMessageId = messages.last()?.id;
            
            if (!lastMessageId) break;
        }
        
        // Confirmar limpeza
        const confirmMessage = await message.channel.send(
            `🧹 **Limpeza concluída!** ${deletedCount} mensagem(ns) de ${member.user.username} foram removidas.`
        ).catch(() => null);
        
        // Auto-deletar confirmação após 5 segundos
        if (confirmMessage) {
            setTimeout(() => {
                confirmMessage.delete().catch(() => {});
            }, 5000);
        }
        
        console.log(`🧹 Sistema CL: ${member.user.tag} limpou ${deletedCount} mensagens no canal ${message.channel.id}`);
        
    } catch (error) {
        console.error('Erro no sistema CL:', error);
        await message.reply('❌ Erro ao executar comando CL. Tente novamente.').catch(() => {});
    }
}