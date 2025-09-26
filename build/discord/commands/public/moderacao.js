import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { getServerEmojis } from "./config-manager.js";
createCommand({
    name: "moderacao",
    description: "Painel de comandos de moderação e controle do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões primeiro
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissões de moderação para usar este comando.",
                ephemeral: true
            });
            return;
        }
        // Defer com flags modernas
        await interaction.deferReply({ ephemeral: true });
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildId = interaction.guild?.id;
        const emojis = guildId ? getServerEmojis(guildId) : {};
        const moderationEmbed = new EmbedBuilder()
            .setColor("#ff4757")
            .setTitle(`${emojis.antinuke || "<:antinuke:1418647215542370415>"} **MODERAÇÃO** | Comandos de Controle`)
            .setDescription(`> **Comandos de moderação disponíveis:**\n\n` +
            `\`/ban\` - Banir um usuário permanentemente\n` +
            `\`/kick\` - Expulsar um usuário do servidor\n` +
            `\`/timeout\` - Silenciar temporariamente\n` +
            `\`/warn\` - Advertir um usuário\n` +
            `\`/unban\` - Remover banimento\n` +
            `\`/clear\` - Limpar mensagens do canal\n` +
            `\`/purgeuser\` - Deletar mensagens de um usuário\n` +
            `\`/lockdown\` - Bloquear canal\n` +
            `\`/unlock\` - Desbloquear canal\n` +
            `\`/slowmode\` - Configurar modo lento\n\n` +
            `${emojis.alert_white || "<a:alert_white:1419215644435681421>"} **Todos os comandos requerem permissões adequadas**\n` +
            `${emojis.mod_black || "<:mod_black:1418647219246075964>"} **Use os comandos slash diretamente no chat**`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: "Eixo Bot • Moderação • Use os comandos diretamente!",
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        await interaction.editReply({
            embeds: [moderationEmbed]
        });
    }
});
