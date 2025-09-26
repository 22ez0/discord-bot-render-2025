import { createEvent } from "#base";
import { EmbedBuilder, ModalSubmitInteraction, PermissionsBitField } from "discord.js";

// Cache para prevenir ações duplicadas
const processedModals = new Set<string>();

// Função utilitária para parsear duração
function parseDuration(duration: string): number | null {
    const match = duration.match(/^(\d+)([smhd])$/i);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

createEvent({
    event: "interactionCreate",
    name: "Modal Handler",
    async run(interaction) {
        if (!interaction.isModalSubmit()) return;
        
        // Prevenir processamento duplicado usando interaction.id único
        const modalId = interaction.id;
        if (processedModals.has(modalId)) return;
        processedModals.add(modalId);
        
        // Limpar cache após 30 segundos
        setTimeout(() => processedModals.delete(modalId), 30000);

        try {
            switch (interaction.customId) {
                case 'ban_modal':
                    await processBanModal(interaction);
                    break;
                case 'kick_modal':
                    await processKickModal(interaction);
                    break;
                case 'timeout_modal':
                    await processTimeoutModal(interaction);
                    break;
                case 'clear_modal':
                    await processClearModal(interaction);
                    break;
                case 'spam_limits_modal':
                    await processSpamLimitsModal(interaction);
                    break;
                case 'add_link_modal':
                    await processAddLinkModal(interaction);
                    break;
                case 'welcome_message_modal':
                    await processWelcomeMessageModal(interaction);
                    break;
                case '8ball_modal':
                    await process8BallModal(interaction);
                    break;
                case 'antispam_config_modal':
                    await processAntiSpamConfigModal(interaction);
                    break;
                case 'fwck_clear_fast_modal':
                    await processFwckClearFastModal(interaction);
                    break;
                case 'fwck_clear_user_modal':
                    await processFwckClearUserModal(interaction);
                    break;
                case 'fwck_clear_custom_modal':
                    await processFwckClearCustomModal(interaction);
                    break;
                default:
                    // Não processar modals desconhecidos silenciosamente
                    return;
            }
        } catch (error) {
            console.error('Erro ao processar modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação.',
                    flags: 64
                });
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação.'
                });
            }
        }
    }
});

// Processadores de modal
async function processBanModal(interaction: ModalSubmitInteraction) {
    const userInput = interaction.fields.getTextInputValue('ban_user');
    const reason = interaction.fields.getTextInputValue('ban_reason');

    // Extrair ID do usuário
    const userId = userInput.replace(/[<@!>]/g, '');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Defer para evitar timeout durante operação de ban
    await interaction.deferReply({ flags: 64 });

    // Verificar permissões do usuário e do bot
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const botMember = interaction.guild.members.me;
    
    if (!member?.permissions.has('BanMembers')) {
        await interaction.editReply({
            content: "❌ Você não tem permissão para banir usuários!"
        });
        return;
    }

    if (!botMember?.permissions.has('BanMembers')) {
        await interaction.editReply({
            content: "❌ Eu não tenho permissão para banir usuários!"
        });
        return;
    }

    try {
        const targetUser = await interaction.guild.members.fetch(userId);
        
        if (!targetUser) {
            await interaction.editReply({
                content: "❌ Usuário não encontrado no servidor!"
            });
            return;
        }

        // Verificar se o usuário é banível
        if (!targetUser.bannable) {
            await interaction.editReply({
                content: "❌ Não posso banir este usuário (possivelmente devido à hierarquia de cargos)!"
            });
            return;
        }

        // Verificar hierarquia de cargos do moderador
        if (targetUser.roles.highest.position >= member.roles.highest.position) {
            await interaction.editReply({
                content: "❌ Você não pode banir este usuário devido à hierarquia de cargos!"
            });
            return;
        }

        await targetUser.ban({ reason: reason });

        const embed = new EmbedBuilder()
            .setColor("#ff4757")
            .setTitle("🔨 **Usuário Banido**")
            .setDescription(`**Usuário:** ${targetUser.user.tag}\n**Motivo:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });

    } catch (error) {
        await interaction.editReply({
            content: "❌ Erro ao banir usuário. Verifique as permissões e tente novamente."
        });
    }
}

async function processKickModal(interaction: ModalSubmitInteraction) {
    const userInput = interaction.fields.getTextInputValue('kick_user');
    const reason = interaction.fields.getTextInputValue('kick_reason');

    const userId = userInput.replace(/[<@!>]/g, '');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Defer para evitar timeout durante operação de kick
    await interaction.deferReply({ flags: 64 });

    // Verificar permissões do usuário e do bot
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const botMember = interaction.guild.members.me;
    
    if (!member?.permissions.has('KickMembers')) {
        await interaction.editReply({
            content: "❌ Você não tem permissão para expulsar usuários!"
        });
        return;
    }

    if (!botMember?.permissions.has('KickMembers')) {
        await interaction.editReply({
            content: "❌ Eu não tenho permissão para expulsar usuários!"
        });
        return;
    }

    try {
        const targetUser = await interaction.guild.members.fetch(userId);
        
        if (!targetUser) {
            await interaction.editReply({
                content: "❌ Usuário não encontrado no servidor!"
            });
            return;
        }

        // Verificar se o usuário é expulsável  
        if (!targetUser.kickable) {
            await interaction.editReply({
                content: "❌ Não posso expulsar este usuário (possivelmente devido à hierarquia de cargos)!"
            });
            return;
        }

        // Verificar hierarquia de cargos do moderador
        if (targetUser.roles.highest.position >= member.roles.highest.position) {
            await interaction.editReply({
                content: "❌ Você não pode expulsar este usuário devido à hierarquia de cargos!"
            });
            return;
        }

        await targetUser.kick(reason);

        const embed = new EmbedBuilder()
            .setColor("#ffa502")
            .setTitle("👢 **Usuário Expulso**")
            .setDescription(`**Usuário:** ${targetUser.user.tag}\n**Motivo:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });

    } catch (error) {
        await interaction.editReply({
            content: "❌ Erro ao expulsar usuário. Verifique as permissões e tente novamente."
        });
    }
}

async function processTimeoutModal(interaction: ModalSubmitInteraction) {
    const userInput = interaction.fields.getTextInputValue('timeout_user');
    const duration = interaction.fields.getTextInputValue('timeout_duration');
    const reason = interaction.fields.getTextInputValue('timeout_reason');

    const userId = userInput.replace(/[<@!>]/g, '');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Defer para evitar timeout durante operação de timeout
    await interaction.deferReply({ flags: 64 });

    // Verificar permissões do usuário e do bot
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const botMember = interaction.guild.members.me;
    
    if (!member?.permissions.has('ModerateMembers')) {
        await interaction.editReply({
            content: "❌ Você não tem permissão para silenciar usuários!"
        });
        return;
    }

    if (!botMember?.permissions.has('ModerateMembers')) {
        await interaction.editReply({
            content: "❌ Eu não tenho permissão para silenciar usuários!"
        });
        return;
    }

    try {
        const targetUser = await interaction.guild.members.fetch(userId);
        
        if (!targetUser) {
            await interaction.editReply({
                content: "❌ Usuário não encontrado no servidor!"
            });
            return;
        }

        // Verificar se o usuário é moderável
        if (!targetUser.moderatable) {
            await interaction.editReply({
                content: "❌ Não posso silenciar este usuário (possivelmente devido à hierarquia de cargos)!"
            });
            return;
        }

        // Verificar hierarquia de cargos do moderador
        if (targetUser.roles.highest.position >= member.roles.highest.position) {
            await interaction.editReply({
                content: "❌ Você não pode silenciar este usuário devido à hierarquia de cargos!"
            });
            return;
        }

        // Converter duração para ms
        const durationMs = parseDuration(duration);
        if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) { // Max 28 dias
            await interaction.editReply({
                content: "❌ Duração inválida! Use formatos como: 10m, 1h, 2d (máximo 28 dias)"
            });
            return;
        }

        await targetUser.timeout(durationMs, reason);

        const embed = new EmbedBuilder()
            .setColor("#ff6b6b")
            .setTitle("🔇 **Usuário Silenciado**")
            .setDescription(`**Usuário:** ${targetUser.user.tag}\n**Duração:** ${duration}\n**Motivo:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });

    } catch (error) {
        await interaction.editReply({
            content: "❌ Erro ao silenciar usuário. Verifique as permissões e tente novamente."
        });
    }
}

async function processClearModal(interaction: ModalSubmitInteraction) {
    const amount = parseInt(interaction.fields.getTextInputValue('clear_amount'));
    const reason = interaction.fields.getTextInputValue('clear_reason') || 'Limpeza de mensagens';

    // Verificar dados básicos primeiro
    if (isNaN(amount) || amount < 1 || amount > 100) {
        await interaction.reply({
            content: "❌ Quantidade inválida! Use um número entre 1 e 100.",
            flags: 64
        });
        return;
    }

    // Verificar permissões do usuário e do bot
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const botMember = interaction.guild?.members.me;
    
    if (!member?.permissions.has('ManageMessages')) {
        await interaction.reply({
            content: "❌ Você não tem permissão para gerenciar mensagens!",
            flags: 64
        });
        return;
    }

    if (!botMember?.permissions.has('ManageMessages')) {
        await interaction.reply({
            content: "❌ Eu não tenho permissão para gerenciar mensagens!",
            flags: 64
        });
        return;
    }

    // Defer para evitar timeout durante bulkDelete (operação lenta)
    await interaction.deferReply({ flags: 64 });

    try {
        const channel = interaction.channel;
        if (!channel || !('bulkDelete' in channel)) {
            await interaction.editReply({
                content: "❌ Não é possível limpar mensagens neste canal!"
            });
            return;
        }

        const messages = await channel.bulkDelete(amount, true);

        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🧹 **Mensagens Limpas**")
            .setDescription(`**Quantidade:** ${messages.size} mensagens\n**Motivo:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });

    } catch (error) {
        await interaction.editReply({
            content: "❌ Erro ao limpar mensagens. Verifique as permissões e tente novamente."
        });
    }
}

async function processSpamLimitsModal(interaction: ModalSubmitInteraction) {
    const messageLimit = interaction.fields.getTextInputValue('message_limit');
    const timeWindow = interaction.fields.getTextInputValue('time_window');

    // Validar valores
    const maxMessagesNum = parseInt(messageLimit);
    const timeWindowNum = parseInt(timeWindow);

    if (isNaN(maxMessagesNum) || maxMessagesNum < 1 || maxMessagesNum > 20) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nO máximo de mensagens deve ser um número entre 1 e 20.",
            flags: 64
        });
        return;
    }

    if (isNaN(timeWindowNum) || timeWindowNum < 5 || timeWindowNum > 300) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nA janela de tempo deve ser um número entre 5 e 300 segundos.",
            flags: 64
        });
        return;
    }

    // Verificar permissões
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (!member?.permissions.has('ManageGuild')) {
        await interaction.reply({
            content: "❌ Você não tem permissão para gerenciar configurações do servidor!",
            flags: 64
        });
        return;
    }

    // Salvar configurações usando storage
    if (interaction.guild) {
        const { storage } = await import("../../lib/storage.js");
        const guildId = interaction.guild.id;
        const config = storage.getServerConfig(guildId);
        
        storage.updateAutomodConfig(guildId, {
            enabled: true,
            antiSpam: { 
                enabled: true, 
                maxMessages: maxMessagesNum, 
                timeWindow: timeWindowNum, 
                punishment: config.automod?.antiSpam?.punishment || 'timeout',
                punishmentDuration: config.automod?.antiSpam?.punishmentDuration || 10
            }
        });
    }

    await interaction.reply({
        content: `✅ **Limites Anti-Spam Atualizados**\n\n**Novas configurações:**\n• Máximo: ${maxMessagesNum} mensagens\n• Período: ${timeWindowNum} segundos\n\n🛡️ Sistema ativo e configurado!`,
        flags: 64
    });
}

async function processAddLinkModal(interaction: ModalSubmitInteraction) {
    const linkDomain = interaction.fields.getTextInputValue('link_domain');
    const linkReason = interaction.fields.getTextInputValue('link_reason') || 'Link adicionado via painel';

    // Validar domínio
    if (!linkDomain || linkDomain.length < 3) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nPor favor, forneça um domínio válido.",
            flags: 64
        });
        return;
    }

    // Salvar configurações usando storage
    if (interaction.guild) {
        const { storage } = await import("../../lib/storage.js");
        const guildId = interaction.guild.id;
        const config = storage.getServerConfig(guildId);
        
        // Inicializar antiLinks se não existir
        const currentWhitelist = config.automod?.antiLinks?.whitelist || [];
        
        // Adicionar domínio se não estiver na lista
        if (!currentWhitelist.includes(linkDomain)) {
            currentWhitelist.push(linkDomain);
            
            storage.updateAutomodConfig(guildId, {
                enabled: true,
                antiLinks: {
                    enabled: true,
                    allowWhitelist: true,
                    whitelist: currentWhitelist,
                    punishment: config.automod?.antiLinks?.punishment || 'warn',
                    customRules: {
                        enabled: config.automod?.antiLinks?.customRules?.enabled || false,
                        allowedDomains: config.automod?.antiLinks?.customRules?.allowedDomains || [],
                        blockDiscordInvites: config.automod?.antiLinks?.customRules?.blockDiscordInvites || true,
                        timeoutDuration: config.automod?.antiLinks?.customRules?.timeoutDuration || 10
                    }
                }
            });
        }
    }

    await interaction.reply({
        content: `✅ **Link Adicionado à Lista Permitida**\n\n**Domínio:** ${linkDomain}\n**Motivo:** ${linkReason}\n\n🔗 Link autorizado no sistema anti-links!`,
        flags: 64
    });
}

async function processWelcomeMessageModal(interaction: ModalSubmitInteraction) {
    const welcomeText = interaction.fields.getTextInputValue('welcome_text');

    // Validar mensagem
    if (!welcomeText || welcomeText.length < 5) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nA mensagem de boas-vindas deve ter pelo menos 5 caracteres.",
            flags: 64
        });
        return;
    }

    // Salvar configurações usando storage
    if (interaction.guild) {
        const { storage } = await import("../../lib/storage.js");
        const guildId = interaction.guild.id;
        const config = storage.getServerConfig(guildId);
        
        storage.updateAutomationConfig(guildId, {
            welcome: {
                enabled: true,
                channelId: config.automation?.welcome?.channelId,
                message: welcomeText,
                embedColor: config.automation?.welcome?.embedColor || '#2ed573'
            }
        });
    }

    await interaction.reply({
        content: `✅ **Mensagem de Boas-vindas Atualizada**\n\n**Nova mensagem:**\n> ${welcomeText}\n\n👋 Configuração salva com sucesso!`,
        flags: 64
    });
}

async function process8BallModal(interaction: ModalSubmitInteraction) {
    const question = interaction.fields.getTextInputValue('8ball_question');
    
    const responses = [
        "🎯 Certamente!",
        "✨ É decidido!",
        "🌟 Sem dúvida alguma!",
        "⭐ Sim, definitivamente!",
        "🎭 Você pode contar com isso!",
        "💫 Como eu vejo, sim!",
        "🔮 Sinais apontam que sim!",
        "💎 A resposta é sim!",
        "🤔 Resposta nebulosa, tente novamente",
        "🌀 Pergunte novamente mais tarde",
        "⚡ Melhor não te contar agora",
        "❓ Não é possível prever agora",
        "🔄 Concentre-se e pergunte de novo",
        "❌ Não conte com isso",
        "🚫 Minha resposta é não",
        "⛔ Minhas fontes dizem não",
        "😬 As perspectivas não são boas",
        "💭 Muito duvidoso"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
        .setColor("#1e1e2e")
        .setTitle("🎱 **Bola 8 Mágica**")
        .setDescription(
            `**Sua pergunta:** ${question}\n\n` +
            `🔮 **Resposta:** ${randomResponse}\n\n` +
            `*A bola mágica falou! Faça uma nova pergunta quando quiser.*`
        )
        .setFooter({ 
            text: `Pergunta feita por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function processAntiSpamConfigModal(interaction: ModalSubmitInteraction) {
    const maxMessages = interaction.fields.getTextInputValue('max_messages');
    const timeWindow = interaction.fields.getTextInputValue('time_window');

    // Validar valores
    const maxMessagesNum = parseInt(maxMessages);
    const timeWindowNum = parseInt(timeWindow);

    if (isNaN(maxMessagesNum) || maxMessagesNum < 1 || maxMessagesNum > 20) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nO máximo de mensagens deve ser um número entre 1 e 20.",
            flags: 64
        });
        return;
    }

    if (isNaN(timeWindowNum) || timeWindowNum < 5 || timeWindowNum > 300) {
        await interaction.reply({
            content: "❌ **Erro de validação!**\n\nA janela de tempo deve ser um número entre 5 e 300 segundos.",
            flags: 64
        });
        return;
    }

    // Salvar configurações usando funções específicas do storage
    if (interaction.guild) {
        const { storage } = await import("../../lib/storage.js");
        const guildId = interaction.guild.id;
        const config = storage.getServerConfig(guildId);
        
        storage.updateAutomodConfig(guildId, {
            enabled: true,
            antiSpam: {
                enabled: true,
                maxMessages: maxMessagesNum,
                timeWindow: timeWindowNum,
                punishment: config.automod?.antiSpam?.punishment || 'timeout',
                punishmentDuration: config.automod?.antiSpam?.punishmentDuration || 10
            }
        });
    }

    await interaction.reply({
        content: `✅ **Configuração Anti-Spam Atualizada**\n\n**Máximo de mensagens:** ${maxMessagesNum}\n**Janela de tempo:** ${timeWindowNum} segundos\n\n🛡️ Sistema configurado com sucesso!`,
        flags: 64
    });
}

// Processadores para modals do Fwck
async function processFwckClearFastModal(interaction: ModalSubmitInteraction) {
    const quantity = interaction.fields.getTextInputValue('quantity');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Verificar permissões do usuário
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
        await interaction.reply({
            content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Mensagens**.",
            flags: 64
        });
        return;
    }

    await interaction.deferReply({ flags: 64 });

    const amount = parseInt(quantity);
    if (isNaN(amount) || amount < 1 || amount > 100) {
        await interaction.editReply({
            content: "❌ **Erro!** A quantidade deve ser um número entre 1 e 100."
        });
        return;
    }

    try {
        // Verificar se é um canal de texto válido
        if (!interaction.channel || !('bulkDelete' in interaction.channel)) {
            await interaction.editReply("❌ **Erro!** Este comando só funciona em canais de texto.");
            return;
        }

        // Verificar permissões do bot
        const botPermissions = interaction.channel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.editReply("❌ **Erro!** Não tenho permissão para gerenciar mensagens neste canal.");
            return;
        }

        // Buscar mensagens
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        
        if (!messages || messages.size === 0) {
            await interaction.editReply("❌ **Erro!** Não encontrei mensagens para deletar.");
            return;
        }

        // Filtrar mensagens antigas (Discord não permite deletar mensagens com mais de 14 dias em bulk)
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const messagesToDelete = Array.from(messages.values()).filter(msg => msg.createdTimestamp > twoWeeksAgo);

        if (messagesToDelete.length === 0) {
            await interaction.editReply("❌ **Erro!** Não encontrei mensagens válidas para deletar (mensagens devem ter menos de 14 dias).");
            return;
        }

        // Deletar mensagens
        if (messagesToDelete.length === 1) {
            await messagesToDelete[0].delete();
        } else {
            // bulkDelete aceita array de IDs ou Collection
            const messageIds = messagesToDelete.map(msg => msg.id);
            await interaction.channel.bulkDelete(messageIds);
        }

        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🧹 **LIMPEZA CONCLUÍDA**")
            .setDescription(
                `**${messagesToDelete.length} mensagens** foram deletadas com sucesso.\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Canal:** ${interaction.channel}`
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error("Erro ao limpar mensagens:", error);
        await interaction.editReply({
            content: "❌ **Erro!** Não foi possível deletar as mensagens. Algumas podem ter mais de 14 dias."
        });
    }
}

async function processFwckClearUserModal(interaction: ModalSubmitInteraction) {
    const userId = interaction.fields.getTextInputValue('user_id');
    const quantity = interaction.fields.getTextInputValue('quantity');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Verificar permissões do usuário
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
        await interaction.reply({
            content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Mensagens**.",
            flags: 64
        });
        return;
    }

    await interaction.deferReply({ flags: 64 });

    const amount = parseInt(quantity);
    if (isNaN(amount) || amount < 1 || amount > 100) {
        await interaction.editReply({
            content: "❌ **Erro!** A quantidade deve ser um número entre 1 e 100."
        });
        return;
    }

    try {
        // Verificar se o usuário existe
        const targetUser = await interaction.client.users.fetch(userId).catch(() => null);
        if (!targetUser) {
            await interaction.editReply({
                content: "❌ **Erro!** Usuário não encontrado com esse ID."
            });
            return;
        }

        // Buscar mensagens
        const messages = await interaction.channel?.messages.fetch({ limit: amount });
        const userMessages = messages?.filter(msg => msg.author.id === userId && 
            Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

        if (!userMessages || userMessages.size === 0) {
            await interaction.editReply({
                content: `❌ **Nenhuma mensagem encontrada** de ${targetUser.tag} nas últimas ${amount} mensagens (últimas 14 dias).`
            });
            return;
        }

        // Verificar se é um canal de texto válido
        if (!interaction.channel || !('bulkDelete' in interaction.channel)) {
            await interaction.editReply("❌ **Erro!** Este comando só funciona em canais de texto.");
            return;
        }

        // Verificar permissões do bot
        const botPermissions = interaction.channel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.editReply("❌ **Erro!** Não tenho permissão para gerenciar mensagens neste canal.");
            return;
        }

        // Deletar mensagens
        if (userMessages.size === 1) {
            await userMessages.first()?.delete();
        } else {
            await interaction.channel.bulkDelete(userMessages);
        }

        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🧹 **LIMPEZA POR USUÁRIO CONCLUÍDA**")
            .setDescription(
                `**${userMessages.size} mensagens** de ${targetUser.tag} foram deletadas.\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Canal:** ${interaction.channel}`
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error("Erro ao limpar mensagens do usuário:", error);
        await interaction.editReply({
            content: "❌ **Erro!** Não foi possível deletar as mensagens."
        });
    }
}

async function processFwckClearCustomModal(interaction: ModalSubmitInteraction) {
    const quantity = interaction.fields.getTextInputValue('quantity');
    const filterWord = interaction.fields.getTextInputValue('filter_word');
    
    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando só pode ser usado em servidores!",
            flags: 64
        });
        return;
    }

    // Verificar permissões do usuário
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
        await interaction.reply({
            content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Mensagens**.",
            flags: 64
        });
        return;
    }

    await interaction.deferReply({ flags: 64 });

    const amount = parseInt(quantity);
    if (isNaN(amount) || amount < 1 || amount > 100) {
        await interaction.editReply({
            content: "❌ **Erro!** A quantidade deve ser um número entre 1 e 100."
        });
        return;
    }

    try {
        // Buscar mensagens
        const messages = await interaction.channel?.messages.fetch({ limit: amount });
        
        if (!messages || messages.size === 0) {
            await interaction.editReply("❌ **Erro!** Não encontrei mensagens para deletar.");
            return;
        }

        let messagesToDelete = Array.from(messages.values());

        // Aplicar filtro se especificado
        if (filterWord && filterWord.trim()) {
            const filter = filterWord.toLowerCase().trim();
            messagesToDelete = messagesToDelete.filter(msg => 
                msg.content.toLowerCase().includes(filter)
            );
        }

        // Filtrar mensagens antigas
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);

        if (messagesToDelete.length === 0) {
            await interaction.editReply("❌ **Erro!** Não encontrei mensagens válidas para deletar com os filtros aplicados.");
            return;
        }

        // Verificar se é um canal de texto válido
        if (!interaction.channel || !('bulkDelete' in interaction.channel)) {
            await interaction.editReply("❌ **Erro!** Este comando só funciona em canais de texto.");
            return;
        }

        // Verificar permissões do bot
        const botPermissions = interaction.channel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.editReply("❌ **Erro!** Não tenho permissão para gerenciar mensagens neste canal.");
            return;
        }

        // Deletar mensagens
        if (messagesToDelete.length === 1) {
            await messagesToDelete[0].delete();
        } else {
            // bulkDelete aceita array de IDs ou Collection
            const messageIds = messagesToDelete.map(msg => msg.id);
            await interaction.channel.bulkDelete(messageIds);
        }

        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🎯 **LIMPEZA CUSTOMIZADA CONCLUÍDA**")
            .setDescription(
                `**${messagesToDelete.length} mensagens** foram deletadas com sucesso.\n` +
                `**Filtro usado:** ${filterWord || "Nenhum"}\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Canal:** ${interaction.channel}`
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error("Erro ao limpar mensagens customizadas:", error);
        await interaction.editReply({
            content: "❌ **Erro!** Não foi possível deletar as mensagens."
        });
    }
}