import { createResponder, ResponderType } from "#base";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } from "discord.js";
import { storage } from "../../../lib/storage.js";
import { joinVoiceChannelById, leaveVoiceChannel, isConnectedToVoice } from "../../commands/public/VoiceHandler.js";

// Handler para botões de automação
createResponder({
    customId: "auto_",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction: any) {
        console.log(`[DEBUG] Botão auto_ acionado: ${interaction.customId} por ${interaction.user.tag}`);
        
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }

        // Verificar permissões antes de processar
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ Você precisa de permissões de **Administrador** para usar este comando!",
                ephemeral: true
            });
            return;
        }

        try {
            // Deferir a resposta imediatamente para evitar timeout
            await interaction.deferUpdate();
            
            const action = interaction.customId.replace("auto_", "");
            
            switch (action) {
                case 'antispam':
                    await handleAntiSpam(interaction);
                    break;
                case 'antilinks':
                    await handleAntiLinks(interaction);
                    break;
                case 'bannedwords':
                    await handleBannedWords(interaction);
                    break;
                case 'welcome':
                    await handleWelcome(interaction);
                    break;
                case 'autoroles':
                    await handleAutoRoles(interaction);
                    break;
                case 'voice_join':
                    await handleVoiceJoin(interaction);
                    break;
                case 'voice_leave':
                    await handleVoiceLeave(interaction);
                    break;
                    
                // Handlers para botões enable/disable/config
                case 'antispam_enable':
                case 'antispam_disable':
                case 'antispam_config':
                    await handleAntiSpamAction(interaction, action.replace('antispam_', ''));
                    break;
                case 'antilinks_enable':
                case 'antilinks_disable':
                case 'antilinks_config':
                    await handleAntiLinksAction(interaction, action.replace('antilinks_', ''));
                    break;
                case 'bannedwords_enable':
                case 'bannedwords_disable':
                case 'bannedwords_config':
                    await handleBannedWordsAction(interaction, action.replace('bannedwords_', ''));
                    break;
                case 'welcome_enable':
                case 'welcome_disable':
                case 'welcome_config':
                    await handleWelcomeAction(interaction, action.replace('welcome_', ''));
                    break;
                case 'autoroles_enable':
                case 'autoroles_disable':
                case 'autoroles_config':
                    await handleAutoRolesAction(interaction, action.replace('autoroles_', ''));
                    break;
                case 'back_main':
                    // Voltar para o painel principal - será tratado pelo collector do eixo.ts
                    return;
                default:
                    await interaction.editReply({
                        content: "❌ Ação não reconhecida!",
                        embeds: [],
                        components: []
                    });
            }
        } catch (error) {
            console.error('Erro ao processar ação de automação:', error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                        embeds: [],
                        components: []
                    });
                }
            } catch (replyError) {
                console.error('Erro ao responder erro:', replyError);
            }
        }
    }
});

async function handleAntiSpam(interaction: any) {
    
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    const isEnabled = config.automod?.antiSpam?.enabled || false;
    
    const embed = new EmbedBuilder()
        .setColor(isEnabled ? "#2ed573" : "#ff4757")
        .setTitle("🛡️ **ANTI-SPAM** | Configurações")
        .setDescription(
            `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n\n` +
            `**Configurações Atuais:**\n` +
            `• **Máximo de mensagens:** ${config.automod?.antiSpam?.maxMessages || 5}\n` +
            `• **Janela de tempo:** ${config.automod?.antiSpam?.timeWindow || 10} segundos\n` +
            `• **Punição:** ${config.automod?.antiSpam?.punishment || 'timeout'}\n` +
            `• **Duração do timeout:** ${config.automod?.antiSpam?.punishmentDuration || 10} minutos\n\n` +
            `**Como funciona:**\n` +
            `O sistema detecta quando um usuário envia muitas mensagens em pouco tempo e aplica a punição configurada automaticamente.`
        )
        .setFooter({ text: "Use os botões abaixo para configurar" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isEnabled ? 'auto_antispam_disable' : 'auto_antispam_enable')
                .setLabel(isEnabled ? 'Desativar' : 'Ativar')
                .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                .setEmoji(isEnabled ? '🔴' : '🟢'),
            new ButtonBuilder()
                .setCustomId('auto_antispam_config')
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId('auto_back_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleAntiLinks(interaction: any) {
    
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    const isEnabled = config.automod?.antiLinks?.enabled || false;
    
    const embed = new EmbedBuilder()
        .setColor(isEnabled ? "#2ed573" : "#ff4757")
        .setTitle("🔗 **ANTI-LINKS** | Configurações")
        .setDescription(
            `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n\n` +
            `**Configurações Atuais:**\n` +
            `• **Whitelist habilitada:** ${config.automod?.antiLinks?.allowWhitelist ? 'Sim' : 'Não'}\n` +
            `• **Domínios na whitelist:** ${config.automod?.antiLinks?.whitelist?.length || 0}\n` +
            `• **Punição:** ${config.automod?.antiLinks?.punishment || 'warn'}\n\n` +
            `**Funcionalidades:**\n` +
            `• Bloqueia convites do Discord\n` +
            `• Detecta links maliciosos\n` +
            `• Sistema de whitelist para domínios permitidos\n` +
            `• Punições automáticas configuráveis`
        )
        .setFooter({ text: "Use os botões abaixo para configurar" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isEnabled ? 'auto_antilinks_disable' : 'auto_antilinks_enable')
                .setLabel(isEnabled ? 'Desativar' : 'Ativar')
                .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                .setEmoji(isEnabled ? '🔴' : '🟢'),
            new ButtonBuilder()
                .setCustomId('auto_antilinks_config')
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId('auto_back_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleWelcome(interaction: any) {
    
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    const isEnabled = config.automation?.welcome?.enabled || false;
    
    const embed = new EmbedBuilder()
        .setColor(isEnabled ? "#2ed573" : "#ff4757")
        .setTitle("👋 **BOAS-VINDAS** | Configurações")
        .setDescription(
            `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n\n` +
            `**Configurações Atuais:**\n` +
            `• **Canal:** ${config.automation?.welcome?.channelId ? `<#${config.automation.welcome.channelId}>` : 'Não configurado'}\n` +
            `• **Mensagem:** ${config.automation?.welcome?.message || 'Padrão'}\n` +
            `• **Cor do embed:** ${config.automation?.welcome?.embedColor || '#2ed573'}\n\n` +
            `**Variáveis disponíveis:**\n` +
            `• \`{user}\` - Menciona o usuário\n` +
            `• \`{server}\` - Nome do servidor\n` +
            `• \`{count}\` - Número de membros`
        )
        .setFooter({ text: "Use os botões abaixo para configurar" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isEnabled ? 'auto_welcome_disable' : 'auto_welcome_enable')
                .setLabel(isEnabled ? 'Desativar' : 'Ativar')
                .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                .setEmoji(isEnabled ? '🔴' : '🟢'),
            new ButtonBuilder()
                .setCustomId('auto_welcome_config')
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId('auto_back_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleAutoRoles(interaction: any) {
    
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    const isEnabled = config.automation?.autoRoles?.enabled || false;
    const roles = config.automation?.autoRoles?.roles || [];
    
    const embed = new EmbedBuilder()
        .setColor(isEnabled ? "#2ed573" : "#ff4757")
        .setTitle("🎭 **AUTO-ROLES** | Configurações")
        .setDescription(
            `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n\n` +
            `**Cargos Configurados:** ${roles.length}\n` +
            (roles.length > 0 ? roles.map(roleId => `• <@&${roleId}>`).join('\n') : '• Nenhum cargo configurado') +
            `\n\n**Como funciona:**\n` +
            `Novos membros recebem automaticamente os cargos configurados quando entram no servidor.`
        )
        .setFooter({ text: "Use os botões abaixo para configurar" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isEnabled ? 'auto_autoroles_disable' : 'auto_autoroles_enable')
                .setLabel(isEnabled ? 'Desativar' : 'Ativar')
                .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                .setEmoji(isEnabled ? '🔴' : '🟢'),
            new ButtonBuilder()
                .setCustomId('auto_autoroles_config')
                .setLabel('Gerenciar Cargos')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId('auto_back_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleBannedWords(interaction: any) {
    
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    const isEnabled = config.automod?.bannedWords?.enabled || false;
    const words = config.automod?.bannedWords?.words || [];
    
    const embed = new EmbedBuilder()
        .setColor(isEnabled ? "#2ed573" : "#ff4757")
        .setTitle("🚫 **PALAVRAS PROIBIDAS** | Configurações")
        .setDescription(
            `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n\n` +
            `**Palavras Configuradas:** ${words.length}\n` +
            (words.length > 0 ? `**Lista:** ${words.slice(0, 5).join(', ')}${words.length > 5 ? ' e mais...' : ''}` : '• Nenhuma palavra configurada') +
            `\n\n**Punição:** ${config.automod?.bannedWords?.punishment || 'warn'}\n\n` +
            `**Como funciona:**\n` +
            `O sistema detecta palavras proibidas nas mensagens e aplica a punição configurada automaticamente.`
        )
        .setFooter({ text: "Use os botões abaixo para configurar" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isEnabled ? 'auto_bannedwords_disable' : 'auto_bannedwords_enable')
                .setLabel(isEnabled ? 'Desativar' : 'Ativar')
                .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                .setEmoji(isEnabled ? '🔴' : '🟢'),
            new ButtonBuilder()
                .setCustomId('auto_bannedwords_config')
                .setLabel('Configurar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId('auto_back_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleVoiceJoin(interaction: any) {
    
    const guildId = interaction.guild.id;
    
    // Verificar se já está conectado
    if (isConnectedToVoice(guildId)) {
        await interaction.editReply({
            content: "🎵 O bot já está conectado em um canal de voz neste servidor!",
            embeds: [],
            components: []
        });
        return;
    }
    
    // Tentar encontrar o usuário em um canal de voz
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.voice?.channelId) {
        await interaction.editReply({
            content: "❌ Você precisa estar em um canal de voz para que eu possa me conectar!",
            embeds: [],
            components: []
        });
        return;
    }
    
    const success = await joinVoiceChannelById(guildId, member.voice.channelId, interaction.client);
    
    if (success) {
        await interaction.editReply({
            content: `✅ Conectado ao canal de voz <#${member.voice.channelId}>!`,
            embeds: [],
            components: []
        });
    } else {
        await interaction.editReply({
            content: "❌ Não foi possível se conectar ao canal de voz. Verifique as permissões do bot.",
            embeds: [],
            components: []
        });
    }
}

async function handleVoiceLeave(interaction: any) {
    
    const guildId = interaction.guild.id;
    
    const success = leaveVoiceChannel(guildId);
    
    if (success) {
        await interaction.editReply({
            content: "✅ Desconectado do canal de voz!",
            embeds: [],
            components: []
        });
    } else {
        await interaction.editReply({
            content: "❌ O bot não está conectado em nenhum canal de voz neste servidor.",
            embeds: [],
            components: []
        });
    }
}

// Legacy responders removed - now handled by main auto_ responder

// Funções para lidar com actions específicos dos botões
async function handleAntiSpamAction(interaction: any, action: string) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    switch (action) {
        case 'enable':
            const antiSpamUpdate = { 
                enabled: true,
                antiSpam: { enabled: true, maxMessages: 5, timeWindow: 10, punishment: 'timeout' as const, punishmentDuration: 10 }
            };
            storage.updateAutomodConfig(guildId, antiSpamUpdate);
            
            await interaction.editReply({
                content: "✅ **Anti-Spam ativado!** O sistema começará a monitorar mensagens automaticamente.",
                embeds: [],
                components: []
            });
            break;
            
        case 'disable':
            const currentAntiSpam = config.automod?.antiSpam || { maxMessages: 5, timeWindow: 10, punishment: 'timeout' as const, punishmentDuration: 10 };
            storage.updateAutomodConfig(guildId, {
                antiSpam: { ...currentAntiSpam, enabled: false }
            });
            
            await interaction.editReply({
                content: "🔴 **Anti-Spam desativado!** O sistema não irá mais monitorar spam.",
                embeds: [],
                components: []
            });
            break;
            
        case 'config':
            await showAntiSpamConfigModal(interaction);
            break;
    }
}

async function handleAntiLinksAction(interaction: any, action: string) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    switch (action) {
        case 'enable':
            const antiLinksUpdate = {
                enabled: true,
                antiLinks: { 
                    enabled: true, 
                    allowWhitelist: true, 
                    whitelist: [], 
                    punishment: 'warn' as const,
                    customRules: {
                        enabled: false,
                        allowedDomains: [],
                        blockDiscordInvites: true,
                        timeoutDuration: 10
                    }
                }
            };
            storage.updateAutomodConfig(guildId, antiLinksUpdate);
            
            await interaction.editReply({
                content: "✅ **Anti-Links ativado!** O sistema começará a monitorar links automaticamente.",
                embeds: [],
                components: []
            });
            break;
            
        case 'disable':
            const currentAntiLinks = config.automod?.antiLinks || { 
                allowWhitelist: true, 
                whitelist: [], 
                punishment: 'warn' as const,
                customRules: {
                    enabled: false,
                    allowedDomains: [],
                    blockDiscordInvites: true,
                    timeoutDuration: 10
                }
            };
            storage.updateAutomodConfig(guildId, {
                antiLinks: { ...currentAntiLinks, enabled: false }
            });
            
            await interaction.editReply({
                content: "🔴 **Anti-Links desativado!** O sistema não irá mais monitorar links.",
                embeds: [],
                components: []
            });
            break;
            
        case 'config':
            await interaction.reply({
                content: "⚙️ **Configuração Anti-Links**\n\nPara configurar domínios permitidos, use o comando:\n`/setup antilinks add [domínio]`\n`/setup antilinks remove [domínio]`",
                ephemeral: true
            });
            break;
    }
}

async function handleBannedWordsAction(interaction: any, action: string) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    switch (action) {
        case 'enable':
            const bannedWordsUpdate = {
                enabled: true,
                bannedWords: { 
                    enabled: true, 
                    words: ['spam', 'scam'], 
                    punishment: 'warn' as const, 
                    ignoreRoles: [],
                    customRules: {
                        enabled: false,
                        agePatterns: false,
                        strictMode: false
                    }
                }
            };
            storage.updateAutomodConfig(guildId, bannedWordsUpdate);
            
            await interaction.editReply({
                content: "✅ **Filtro de Palavras Proibidas ativado!** O sistema começará a monitorar mensagens automaticamente.",
                embeds: [],
                components: []
            });
            break;
            
        case 'disable':
            const currentBannedWords = config.automod?.bannedWords || { 
                words: [], 
                punishment: 'warn' as const, 
                ignoreRoles: [],
                customRules: {
                    enabled: false,
                    agePatterns: false,
                    strictMode: false
                }
            };
            storage.updateAutomodConfig(guildId, {
                bannedWords: { ...currentBannedWords, enabled: false }
            });
            
            await interaction.editReply({
                content: "🔴 **Filtro de Palavras Proibidas desativado!** O sistema não irá mais monitorar palavras proibidas.",
                embeds: [],
                components: []
            });
            break;
            
        case 'config':
            await interaction.reply({
                content: "⚙️ **Configuração Palavras Proibidas**\n\nPara configurar palavras proibidas, use os comandos:\n`/automod bannedwords add [palavra]`\n`/automod bannedwords remove [palavra]`\n`/automod bannedwords list`",
                ephemeral: true
            });
            break;
    }
}

async function handleWelcomeAction(interaction: any, action: string) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    switch (action) {
        case 'enable':
            storage.updateAutomationConfig(guildId, {
                welcome: { enabled: true, message: 'Bem-vindo(a) {user} ao servidor {server}!', embedColor: '#2ed573' }
            });
            
            await interaction.editReply({
                content: "✅ **Sistema de Boas-vindas ativado!** Configure o canal com `/setup welcome`.",
                embeds: [],
                components: []
            });
            break;
            
        case 'disable':
            storage.updateAutomationConfig(guildId, {
                welcome: { ...config.automation?.welcome, enabled: false }
            });
            
            await interaction.editReply({
                content: "🔴 **Sistema de Boas-vindas desativado!**",
                embeds: [],
                components: []
            });
            break;
            
        case 'config':
            await interaction.reply({
                content: "⚙️ **Configuração Welcome**\n\nPara configurar as boas-vindas, use:\n`/setup welcome channel #canal`\n`/setup welcome message [mensagem]`",
                ephemeral: true
            });
            break;
    }
}

async function handleAutoRolesAction(interaction: any, action: string) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    switch (action) {
        case 'enable':
            storage.updateAutomationConfig(guildId, {
                autoRoles: { enabled: true, roles: [] }
            });
            
            await interaction.editReply({
                content: "✅ **Auto-Roles ativado!** Configure os cargos com `/setup autoroles`.",
                embeds: [],
                components: []
            });
            break;
            
        case 'disable':
            const currentAutoRoles = config.automation?.autoRoles || { roles: [] };
            storage.updateAutomationConfig(guildId, {
                autoRoles: { ...currentAutoRoles, enabled: false }
            });
            
            await interaction.editReply({
                content: "🔴 **Auto-Roles desativado!**",
                embeds: [],
                components: []
            });
            break;
            
        case 'config':
            await interaction.reply({
                content: "⚙️ **Configuração Auto-Roles**\n\nPara configurar cargos automáticos, use:\n`/setup autoroles add @cargo`\n`/setup autoroles remove @cargo`",
                ephemeral: true
            });
            break;
    }
}

async function showAntiSpamConfigModal(interaction: any) {
    const guildId = interaction.guild.id;
    const config = storage.getServerConfig(guildId);
    
    const modal = new ModalBuilder()
        .setCustomId('antispam_config_modal')
        .setTitle('⚙️ Configurar Anti-Spam');

    const maxMessagesInput = new TextInputBuilder()
        .setCustomId('max_messages')
        .setLabel('Máximo de mensagens')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('5')
        .setValue(String(config.automod?.antiSpam?.maxMessages || 5))
        .setRequired(true);

    const timeWindowInput = new TextInputBuilder()
        .setCustomId('time_window')
        .setLabel('Janela de tempo (segundos)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('10')
        .setValue(String(config.automod?.antiSpam?.timeWindow || 10))
        .setRequired(true);

    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(maxMessagesInput);
    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(timeWindowInput);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
}

// Legacy antilinks_ responder removed

// Legacy welcome_ responder removed

// Legacy autoroles_ responder removed