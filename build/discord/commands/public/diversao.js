import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { getServerEmojis } from "./emoji-manager.js";
createCommand({
    name: "diversao",
    description: "Painel de comandos de entretenimento e diversão",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.deferReply({ flags: 64 });
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildId = interaction.guild?.id;
        const emojis = guildId ? getServerEmojis(guildId) : {};
        const funEmbed = new EmbedBuilder()
            .setColor("#ff6b81")
            .setTitle(`${emojis.A_Tada || "<a:A_Tada:1418647260002254981>"} **DIVERSÃO** | Entretenimento`)
            .setDescription(`> **Comandos de diversão disponíveis:**\n\n` +
            `\`/avatar\` - Ver avatar de usuários em alta qualidade\n` +
            `\`/roll\` - Rolar dados virtuais (1-100)\n` +
            `\`/coinflip\` - Cara ou coroa clássico\n` +
            `\`/8ball\` - Bola 8 mágica para suas perguntas\n\n` +
            `🎮 **Disponível para todos os usuários**\n` +
            `🎲 **Resultados aleatórios e divertidos**\n` +
            `🎨 **Use os comandos slash diretamente no chat!**`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: "Eixo Bot • Diversão • Entretenha-se!",
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        await interaction.editReply({
            embeds: [funEmbed]
        });
    }
});
