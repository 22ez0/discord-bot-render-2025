import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { getServerEmojis } from "./emoji-manager.js";
createCommand({
    name: "configuracao",
    description: "Painel de configurações e ajustes do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões primeiro
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }
        // Defer com flags modernas
        await interaction.deferReply({ flags: 64 });
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildId = interaction.guild?.id;
        const emojis = guildId ? getServerEmojis(guildId) : {};
        const configEmbed = new EmbedBuilder()
            .setColor("#5352ed")
            .setTitle(`${emojis.mod_black || "<:mod_black:1418647219246075964>"} **CONFIGURAÇÃO** | Ajustes do Servidor`)
            .setDescription(`> **Comandos de configuração disponíveis:**\n\n` +
            `\`/setlogs\` - Configurar canal de logs do servidor\n` +
            `\`/testlogs\` - Testar sistema de logs\n` +
            `\`/emoji-manager\` - Gerenciar emojis personalizados do bot\n\n` +
            `**Configurações automáticas:**\n` +
            `• Use o comando \`/automacao\` para configurar sistemas automáticos\n` +
            `• Anti-spam, anti-links, filtros de palavras\n` +
            `• Auto-roles, mensagens de boas-vindas\n` +
            `• Configurações de canal de voz\n\n` +
            `${emojis.alert_white || "<a:alert_white:1419215644435681421>"} **Requer permissões administrativas**\n` +
            `${emojis.gears || "<a:gears:1419216984188387329>"} **Use os comandos slash diretamente no chat**`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: "Eixo Bot • Configuração • Ajuste seu servidor",
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        await interaction.editReply({
            embeds: [configEmbed]
        });
    }
});
