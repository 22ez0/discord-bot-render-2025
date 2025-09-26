import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { updateServerEmoji } from "../../commands/public/config-manager.js";
createResponder({
    customId: "emoji_modal_",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                flags: 64
            });
            return;
        }
        // Verificar permissões de administrador
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.permissions.has('Administrator')) {
            await interaction.reply({
                content: "❌ Você precisa de permissões de **Administrador** para usar este comando!",
                flags: 64
            });
            return;
        }
        // Extrair informações do customId
        const parts = interaction.customId.split('_');
        const emojiId = parts[2];
        const category = parts[3];
        const newEmoji = interaction.fields.getTextInputValue('new_emoji');
        // Validar se é um emoji válido
        const emojiRegex = /^<a?:\w+:\d+>$|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        if (!emojiRegex.test(newEmoji)) {
            await interaction.reply({
                content: "❌ **Emoji inválido!**\n\nO formato deve ser:\n• `<:nome:123456789>` para emojis personalizados\n• `😀` para emojis padrão do Discord",
                flags: 64
            });
            return;
        }
        try {
            // Atualizar o emoji
            updateServerEmoji(interaction.guild.id, emojiId, newEmoji);
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("✅ **Emoji Atualizado com Sucesso!**")
                .setDescription(`**Emoji:** ${emojiId}\n` +
                `**Categoria:** ${getCategoryName(category)}\n` +
                `**Novo valor:** ${newEmoji}\n\n` +
                `🎉 O emoji foi atualizado e já está disponível nos painéis do bot!`)
                .setFooter({ text: "Use /config-manager tipo:emojis acao:list para ver todos os emojis configurados" })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], flags: 64 });
        }
        catch (error) {
            console.error('Erro ao atualizar emoji:', error);
            await interaction.reply({
                content: "❌ Ocorreu um erro ao atualizar o emoji. Tente novamente.",
                flags: 64
            });
        }
    }
});
function getCategoryName(category) {
    switch (category) {
        case 'main_panel': return 'Painel Principal';
        case 'moderation': return 'Moderação';
        case 'automation': return 'Automação';
        default: return 'Categoria';
    }
}
