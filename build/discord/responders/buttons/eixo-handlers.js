import { createResponder, ResponderType } from "#base";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getServerEmojis } from "../../commands/public/config-manager.js";
// Handler para botões do painel eixo
createResponder({
    customId: "eixo_",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }
        const action = interaction.customId.replace("eixo_", "");
        try {
            switch (action) {
                case 'moderation':
                    await handleModerationPanel(interaction);
                    break;
                case 'automation':
                    await handleAutomationPanel(interaction);
                    break;
                case 'config':
                    await handleConfigPanel(interaction);
                    break;
                case 'fun':
                    await handleFunPanel(interaction);
                    break;
                case 'utils':
                    await handleUtilsPanel(interaction);
                    break;
                case 'back':
                    await handleBackToMain(interaction);
                    break;
                default:
                    await interaction.reply({
                        content: "❌ Opção não reconhecida!",
                        ephemeral: true
                    });
            }
        }
        catch (error) {
            console.error('Erro ao processar botão eixo:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                    ephemeral: true
                });
            }
        }
    }
});
function buildMainEmbed(botAvatarURL, guildId) {
    const emojis = guildId ? getServerEmojis(guildId) : {};
    return new EmbedBuilder()
        .setColor("#00070b")
        .setTitle(`${emojis.mod_black || "<:mod_black:1418647219246075964>"} **PAINEL EIXO** | Dashboard Principal`)
        .setDescription(`> Bem-vindo ao painel principal do **Eixo**!\n` +
        `> Selecione uma categoria abaixo para ver os comandos disponíveis.\n\n` +
        `${emojis.antinuke || "<:antinuke:1418647215542370415>"} **Moderação** - Comandos de moderação e controle\n` +
        `${emojis.clyde || "<:clyde:1418752850711805975>"} **Automação** - Sistemas automáticos do servidor\n` +
        `${emojis.mod_black || "<:mod_black:1418647219246075964>"} **Configuração** - Ajustes e configurações\n` +
        `${emojis.A_Tada || "<a:A_Tada:1418647260002254981>"} **Diversão** - Comandos de entretenimento\n` +
        `${emojis.serverowner || "<:serverowner:1418752887768481792>"} **Utilidades** - Ferramentas úteis para o servidor`)
        .setThumbnail(botAvatarURL || null)
        .setFooter({
        text: "Eixo Bot • Desenvolvido por vegas!",
        iconURL: botAvatarURL || undefined
    })
        .setTimestamp();
}
function buildMainButtons(guildId) {
    const emojis = guildId ? getServerEmojis(guildId) : {};
    return new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("eixo_moderation")
        .setLabel("Moderação")
        .setEmoji(emojis.antinuke || "<:antinuke:1418647215542370415>")
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId("eixo_automation")
        .setLabel("Automação")
        .setEmoji(emojis.clyde || "<:clyde:1418752850711805975>")
        .setStyle(ButtonStyle.Success), new ButtonBuilder()
        .setCustomId("eixo_config")
        .setLabel("Configuração")
        .setEmoji(emojis.mod_black || "<:mod_black:1418647219246075964>")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("eixo_fun")
        .setLabel("Diversão")
        .setEmoji(emojis.A_Tada || "<a:A_Tada:1418647260002254981>")
        .setStyle(ButtonStyle.Danger), new ButtonBuilder()
        .setCustomId("eixo_utils")
        .setLabel("Utilidades")
        .setEmoji(emojis.serverowner || "<:serverowner:1418752887768481792>")
        .setStyle(ButtonStyle.Secondary));
}
async function handleModerationPanel(interaction) {
    await interaction.update({
        embeds: [new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("<:antinuke:1418647215542370415> **MODERAÇÃO** | Comandos de Controle")
                .setDescription(`> **Comandos de moderação disponíveis:**\n\n` +
                `\`/ban\` - Banir um usuário permanentemente\n` +
                `\`/kick\` - Expulsar um usuário do servidor\n` +
                `\`/timeout\` - Silenciar temporariamente\n` +
                `\`/clear\` - Limpar mensagens do canal\n` +
                `\`/lockdown\` - Bloquear canal\n` +
                `\`/unlock\` - Desbloquear canal\n` +
                `\`/slowmode\` - Configurar modo lento\n\n` +
                `<a:alert_white:1419215644435681421> **Requer permissões de moderação**`)
                .setFooter({ text: "Use os comandos slash diretamente no chat" })],
        components: [new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("eixo_back")
                .setLabel("◀ Voltar")
                .setStyle(ButtonStyle.Secondary))]
    });
}
async function handleAutomationPanel(interaction) {
    await interaction.update({
        embeds: [new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("<:clyde:1418752850711805975> **AUTOMAÇÃO** | Sistemas Automáticos")
                .setDescription(`> **Selecione um sistema de automação:**\n\n` +
                `<:Antinuke:1419248675200172083> **Anti-Spam** - Proteção contra spam\n` +
                `<:reloadlk:1418752934916915370> **Anti-Links** - Bloqueio de links indesejados\n` +
                `<:channels:1418752827462778952> **Filtro de Palavras** - Filtragem automática\n` +
                `<a:invite:1419216990601609316> **Auto-Roles** - Cargos automáticos\n` +
                `<a:Y_just_a_wave:1419134146420146267> **Welcome** - Mensagens de boas-vindas\n\n` +
                `<a:gears:1419216984188387329> **Configure através dos botões abaixo**`)
                .setFooter({ text: "Eixo Bot • Automação" })],
        components: [
            new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("auto_antispam")
                .setLabel("Anti-Spam")
                .setEmoji("<:Antinuke:1419248675200172083>")
                .setStyle(ButtonStyle.Primary), new ButtonBuilder()
                .setCustomId("auto_antilinks")
                .setLabel("Anti-Links")
                .setEmoji("<:reloadlk:1418752934916915370>")
                .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
                .setCustomId("auto_bannedwords")
                .setLabel("Palavras Proibidas")
                .setEmoji("<:channels:1418752827462778952>")
                .setStyle(ButtonStyle.Primary), new ButtonBuilder()
                .setCustomId("auto_welcome")
                .setLabel("Welcome")
                .setEmoji("<a:Y_just_a_wave:1419134146420146267>")
                .setStyle(ButtonStyle.Success)),
            new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("auto_autoroles")
                .setLabel("Auto-Roles")
                .setEmoji("<a:invite:1419216990601609316>")
                .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
                .setCustomId("eixo_back")
                .setLabel("◀ Voltar")
                .setStyle(ButtonStyle.Danger))
        ]
    });
}
async function handleConfigPanel(interaction) {
    await interaction.update({
        embeds: [new EmbedBuilder()
                .setColor("#5352ed")
                .setTitle("<:mod_black:1418647219246075964> **CONFIGURAÇÃO** | Ajustes do Servidor")
                .setDescription(`> **Comandos de configuração:**\n\n` +
                `\`/setlogs\` - Configurar canal de logs\n` +
                `\`/emoji-manager\` - Gerenciar emojis do bot\n` +
                `\`/testlogs\` - Testar sistema de logs\n\n` +
                `**Configurações automáticas:**\n` +
                `Use a seção **Automação** para configurar sistemas automáticos\n\n` +
                `<a:alert_white:1419215644435681421> **Requer permissões administrativas**`)
                .setFooter({ text: "Eixo Bot • Configuração" })],
        components: [new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("eixo_back")
                .setLabel("◀ Voltar")
                .setStyle(ButtonStyle.Secondary))]
    });
}
async function handleFunPanel(interaction) {
    await interaction.update({
        embeds: [new EmbedBuilder()
                .setColor("#ff6b81")
                .setTitle("<a:A_Tada:1418647260002254981> **DIVERSÃO** | Entretenimento")
                .setDescription(`> **Comandos de diversão disponíveis:**\n\n` +
                `\`/avatar\` - Ver avatar de usuários\n` +
                `\`/roll\` - Rolar dados virtuais\n` +
                `\`/coinflip\` - Cara ou coroa\n` +
                `\`/8ball\` - Bola 8 mágica\n\n` +
                `🎮 **Disponível para todos os usuários**\n` +
                `Use os comandos slash diretamente no chat!`)
                .setFooter({ text: "Eixo Bot • Diversão" })],
        components: [new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("eixo_back")
                .setLabel("◀ Voltar")
                .setStyle(ButtonStyle.Secondary))]
    });
}
async function handleUtilsPanel(interaction) {
    await interaction.update({
        embeds: [new EmbedBuilder()
                .setColor("#ffa502")
                .setTitle("<:serverowner:1418752887768481792> **UTILIDADES** | Ferramentas Úteis")
                .setDescription(`> **Comandos de utilidade disponíveis:**\n\n` +
                `\`/ping\` - Verificar latência do bot\n` +
                `\`/serverinfo\` - Informações detalhadas do servidor\n` +
                `\`/userinfo\` - Informações sobre usuários\n` +
                `\`/invite\` - Gerar convite personalizado\n\n` +
                `📈 **Informações em tempo real**\n` +
                `Use os comandos slash diretamente no chat!`)
                .setFooter({ text: "Eixo Bot • Utilidades" })],
        components: [new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId("eixo_back")
                .setLabel("◀ Voltar")
                .setStyle(ButtonStyle.Secondary))]
    });
}
async function handleBackToMain(interaction) {
    const botAvatarURL = interaction.client.user?.displayAvatarURL();
    const guildId = interaction.guild?.id;
    const mainEmbed = buildMainEmbed(botAvatarURL, guildId);
    const buttons = buildMainButtons(guildId);
    await interaction.update({
        embeds: [mainEmbed],
        components: [buttons]
    });
}
