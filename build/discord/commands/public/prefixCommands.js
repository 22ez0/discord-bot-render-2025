import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionsBitField } from "discord.js";
// Sistema de comandos com prefix
export function setupPrefixCommands(client) {
    client.on('messageCreate', async (message) => {
        if (message.author.bot)
            return;
        if (!message.guild)
            return;
        const prefix = 'e?';
        if (!message.content.startsWith(prefix))
            return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        if (command === 'limpar') {
            await handleLimparCommand(message);
        }
    });
}
async function handleLimparCommand(message) {
    // Verificar permissões administrativas
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await message.reply({
            content: '❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.',
            allowedMentions: { repliedUser: false }
        });
        return;
    }
    const botAvatarURL = message.client.user?.displayAvatarURL();
    const mainEmbed = buildLimparMainEmbed(botAvatarURL, message.guild?.name);
    const buttons = buildLimparMainButtons();
    const reply = await message.reply({
        embeds: [mainEmbed],
        components: buttons,
        allowedMentions: { repliedUser: false }
    });
    // Collector para botões
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000, // 5 minutos
        filter: (i) => i.message.id === reply.id && i.user.id === message.author.id
    });
    collector.on('collect', async (buttonInteraction) => {
        try {
            if (buttonInteraction.customId.startsWith('limpar_')) {
                await handleLimparCategorySelection(buttonInteraction, botAvatarURL, message.guild?.name);
            }
        }
        catch (error) {
            console.error('Erro ao processar interação de botão em limpar:', error);
            try {
                const errorMessage = '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente em alguns momentos.';
                if (buttonInteraction.replied || buttonInteraction.deferred) {
                    await buttonInteraction.followUp({
                        content: errorMessage,
                        flags: 64
                    });
                }
                else {
                    await buttonInteraction.reply({
                        content: errorMessage,
                        flags: 64
                    });
                }
            }
            catch (err) {
                console.error('Erro ao enviar mensagem de erro:', err);
            }
        }
    });
    collector.on('end', () => {
        reply.edit({
            components: []
        }).catch(() => null);
    });
    // Collector para outros usuários
    const globalCollector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
        filter: (i) => i.message.id === reply.id && i.user.id !== message.author.id
    });
    globalCollector.on('collect', async (buttonInteraction) => {
        try {
            await buttonInteraction.reply({
                content: 'Somente o administrador que executou o comando pode usar este painel. Use `e?limpar` para criar seu próprio painel.',
                flags: 64
            });
        }
        catch (error) {
            console.error('Erro ao responder para usuário não autorizado em limpar:', error);
        }
    });
}
function buildLimparMainEmbed(botAvatarURL, serverName) {
    return new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("🛠️ **PAINEL DE CONFIGURAÇÃO** | e?limpar")
        .setDescription(`> **Central de configurações do servidor ${serverName || 'atual'}**\n` +
        `> Selecione uma categoria abaixo para configurar os sistemas.\n\n` +
        `🤖 **Auto-Moderação** - Anti-spam, filtros, limites\n` +
        `👋 **Boas-vindas** - Mensagens de entrada/saída\n` +
        `🎭 **Auto-Roles** - Cargos automáticos\n` +
        `📝 **Logs** - Sistema de registros\n` +
        `⚙️ **Geral** - Configurações gerais do bot\n` +
        `🎯 **Reaction Roles** - Cargos por reação\n\n` +
        `⚠️ **Requer permissões administrativas**`)
        .setThumbnail(botAvatarURL || null)
        .setFooter({
        text: "Eixo Bot • Sistema de Configuração",
        iconURL: botAvatarURL || undefined
    })
        .setTimestamp();
}
function buildLimparMainButtons() {
    const row1 = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("limpar_automod")
        .setLabel("Auto-Moderação")
        .setEmoji("🤖")
        .setStyle(ButtonStyle.Danger), new ButtonBuilder()
        .setCustomId("limpar_welcome")
        .setLabel("Boas-vindas")
        .setEmoji("👋")
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId("limpar_autoroles")
        .setLabel("Auto-Roles")
        .setEmoji("🎭")
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId("limpar_logs")
        .setLabel("Logs")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("limpar_general")
        .setLabel("Geral")
        .setEmoji("⚙️")
        .setStyle(ButtonStyle.Secondary));
    const row2 = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("limpar_reactionroles")
        .setLabel("Reaction Roles")
        .setEmoji("🎯")
        .setStyle(ButtonStyle.Primary));
    return [row1, row2];
}
async function handleLimparCategorySelection(interaction, botAvatarURL, serverName) {
    let embed;
    let actionRow;
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("limpar_back")
        .setLabel("◀ Voltar")
        .setStyle(ButtonStyle.Secondary));
    switch (interaction.customId) {
        case 'limpar_automod':
            embed = new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("🤖 **AUTO-MODERAÇÃO** | Configurações")
                .setDescription(`> **Configure os sistemas de moderação automática:**\n\n` +
                `🛡️ **Anti-Spam**\n` +
                `• Limite de mensagens por segundo\n` +
                `• Detecção de mensagens idênticas\n` +
                `• Punições automáticas\n\n` +
                `🔗 **Anti-Links**\n` +
                `• Bloqueio de convites Discord\n` +
                `• Filtro de links maliciosos\n` +
                `• Lista de domínios permitidos\n\n` +
                `💬 **Filtro de Palavras**\n` +
                `• Lista de palavras proibidas\n` +
                `• Detecção inteligente\n` +
                `• Ações por violação\n\n` +
                `📊 **Status:** Sistema ativo\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Auto-Moderação" });
            actionRow = backButton;
            break;
        case 'limpar_welcome':
            embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("👋 **BOAS-VINDAS** | Configurações")
                .setDescription(`> **Configure mensagens de entrada e saída:**\n\n` +
                `📥 **Mensagens de Entrada**\n` +
                `• Canal de boas-vindas\n` +
                `• Mensagem personalizada\n` +
                `• Embed com avatar do usuário\n\n` +
                `📤 **Mensagens de Saída**\n` +
                `• Canal de despedida\n` +
                `• Mensagem de saída\n` +
                `• Notificação discreta\n\n` +
                `🎨 **Personalização**\n` +
                `• Cores customizadas\n` +
                `• Variáveis disponíveis: {user}, {server}, {count}\n` +
                `• Imagens de fundo\n\n` +
                `📊 **Status:** Sistema ativo\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Boas-vindas" });
            actionRow = backButton;
            break;
        case 'limpar_autoroles':
            embed = new EmbedBuilder()
                .setColor("#5352ed")
                .setTitle("🎭 **AUTO-ROLES** | Configurações")
                .setDescription(`> **Configure cargos automáticos:**\n\n` +
                `🚪 **Cargos de Entrada**\n` +
                `• Cargo dado automaticamente\n` +
                `• Múltiplos cargos por entrada\n` +
                `• Delay configurável\n\n` +
                `🤖 **Cargos por Bot**\n` +
                `• Cargo especial para bots\n` +
                `• Separação automática\n` +
                `• Permissões específicas\n\n` +
                `⏰ **Cargos Temporários**\n` +
                `• Cargos com expiração\n` +
                `• Renovação automática\n` +
                `• Notificações de expiração\n\n` +
                `📊 **Status:** Sistema ativo\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Auto-Roles" });
            actionRow = backButton;
            break;
        case 'limpar_logs':
            embed = new EmbedBuilder()
                .setColor("#ffa502")
                .setTitle("📝 **LOGS** | Configurações")
                .setDescription(`> **Configure sistema de registros:**\n\n` +
                `🔨 **Logs de Moderação**\n` +
                `• Bans, kicks, timeouts\n` +
                `• Warnings e histórico\n` +
                `• Ações dos moderadores\n\n` +
                `💬 **Logs de Mensagens**\n` +
                `• Mensagens deletadas\n` +
                `• Mensagens editadas\n` +
                `• Bulk delete\n\n` +
                `👤 **Logs de Usuários**\n` +
                `• Entrada/saída do servidor\n` +
                `• Mudanças de nickname\n` +
                `• Mudanças de cargo\n\n` +
                `🔊 **Logs de Voz**\n` +
                `• Entrada/saída de voice\n` +
                `• Mute/deafen\n` +
                `• Mudanças de canal\n\n` +
                `📊 **Status:** Sistema ativo\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Logs" });
            actionRow = backButton;
            break;
        case 'limpar_general':
            embed = new EmbedBuilder()
                .setColor("#a4b0be")
                .setTitle("⚙️ **CONFIGURAÇÕES GERAIS** | Geral")
                .setDescription(`> **Configure comportamento geral do bot:**\n\n` +
                `🎛️ **Prefix**\n` +
                `• Prefix atual: \`e?\`\n` +
                `• Múltiplos prefixes\n` +
                `• Menção como prefix\n\n` +
                `🚫 **Canais Ignorados**\n` +
                `• Lista de canais onde bot não responde\n` +
                `• Exceções por cargo\n` +
                `• Comandos permitidos\n\n` +
                `🔧 **Permissões**\n` +
                `• Cargos de moderador\n` +
                `• Bypass de cooldown\n` +
                `• Comandos por cargo\n\n` +
                `🎨 **Personalização**\n` +
                `• Cor das embeds\n` +
                `• Emoji personalizado\n` +
                `• Mensagens customizadas\n\n` +
                `📊 **Status:** Configurações padrão ativas\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Configurações Gerais" });
            actionRow = backButton;
            break;
        case 'limpar_reactionroles':
            embed = new EmbedBuilder()
                .setColor("#ff6b81")
                .setTitle("🎯 **REACTION ROLES** | Configurações")
                .setDescription(`> **Configure cargos por reação:**\n\n` +
                `🎭 **Sistema de Reações**\n` +
                `• Mensagens com reações\n` +
                `• Cargos por emoji\n` +
                `• Múltiplos cargos por usuário\n\n` +
                `⚙️ **Configurações**\n` +
                `• Limite de cargos por usuário\n` +
                `• Cargos exclusivos ou cumulativos\n` +
                `• Verificação de permissões\n\n` +
                `🎨 **Personalização**\n` +
                `• Emojis customizados\n` +
                `• Mensagens em embeds\n` +
                `• Cores personalizadas\n\n` +
                `📊 **Status:** Sistema ativo\n` +
                `🔧 **Para configurar:** Use /eixo > Automação ou configure através dos comandos`)
                .setFooter({ text: "Eixo Bot • Reaction Roles" });
            actionRow = backButton;
            break;
        case 'limpar_back':
            embed = buildLimparMainEmbed(botAvatarURL, serverName);
            const components = buildLimparMainButtons();
            await interaction.update({
                embeds: [embed],
                components: components
            });
            return;
        default:
            return;
    }
    await interaction.update({
        embeds: [embed],
        components: [actionRow]
    });
}
