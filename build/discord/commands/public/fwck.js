import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from "discord.js";
createCommand({
    name: "fwck",
    description: "🧹 Painel simplificado para comandos de limpeza",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões básicas para interagir com o painel
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissão **Gerenciar Mensagens** para usar este comando.",
                flags: 64
            });
            return;
        }
        await interaction.deferReply({ flags: 64 });
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildName = interaction.guild?.name || "Servidor";
        // Embed principal simplificado e transparente
        const mainEmbed = new EmbedBuilder()
            .setColor(0x2f3136) // Cor escura para transparência
            .setTitle("🧹 **FWCK** | Painel de Limpeza")
            .setDescription(`**Gerenciamento rápido de mensagens**\n\n` +
            `🗑️ **Clear Rápido** - Limpar mensagens rapidamente\n` +
            `👤 **Clear Usuário** - Remover mensagens de um usuário específico\n` +
            `🎯 **Clear Customizado** - Limpeza personalizada com filtros\n\n` +
            `💡 **Interface simplificada para máxima eficiência**`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: `${guildName} • Fwck Panel • Limpeza Eficiente`,
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        // Botões simplificados para comandos de limpeza
        const clearButtons = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId("fwck_clear_fast")
            .setLabel("Clear Rápido")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId("fwck_clear_user")
            .setLabel("Clear Usuário")
            .setEmoji("👤")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("fwck_clear_custom")
            .setLabel("Clear Custom")
            .setEmoji("🎯")
            .setStyle(ButtonStyle.Secondary));
        await interaction.editReply({
            embeds: [mainEmbed],
            components: [clearButtons]
        });
    }
});
