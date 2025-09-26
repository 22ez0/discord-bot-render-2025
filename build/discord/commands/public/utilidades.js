import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { getServerEmojis } from "./config-manager.js";
createCommand({
    name: "utilidades",
    description: "Painel de ferramentas úteis e comandos informativos",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildId = interaction.guild?.id;
        const emojis = guildId ? getServerEmojis(guildId) : {};
        const utilsEmbed = new EmbedBuilder()
            .setColor("#ffa502")
            .setTitle(`${emojis.serverowner || "<:serverowner:1418752887768481792>"} **UTILIDADES** | Ferramentas Úteis`)
            .setDescription(`> **Comandos de utilidade disponíveis:**\n\n` +
            `\`/ping\` - Verificar latência e status do bot\n` +
            `\`/serverinfo\` - Informações detalhadas do servidor\n` +
            `\`/userinfo\` - Informações completas sobre usuários\n` +
            `\`/invite\` - Gerar convite personalizado do servidor\n\n` +
            `📈 **Informações em tempo real**\n` +
            `📊 **Estatísticas detalhadas**\n` +
            `🔧 **Ferramentas administrativas**\n` +
            `💡 **Use os comandos slash diretamente no chat!**`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: "Eixo Bot • Utilidades • Informações úteis",
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        await interaction.editReply({
            embeds: [utilsEmbed]
        });
    }
});
