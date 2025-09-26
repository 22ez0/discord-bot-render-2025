import { createResponder, ResponderType } from "#base";
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } from "discord.js";

// Handler para botões do painel Fwck
createResponder({
    customId: "fwck_",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction: any) {
        console.log(`[DEBUG] Botão fwck_ acionado: ${interaction.customId} por ${interaction.user.tag}`);
        
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }

        // Verificar permissões antes de continuar
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({
                content: "❌ Você precisa de permissão **Gerenciar Mensagens** para usar este comando!",
                ephemeral: true
            });
            return;
        }

        const action = interaction.customId.replace("fwck_", "");
        
        switch (action) {
            case 'clear_fast':
                await handleClearFast(interaction);
                break;
            case 'clear_user':
                await handleClearUser(interaction);
                break;
            case 'clear_custom':
                await handleClearCustom(interaction);
                break;
            default:
                await interaction.reply({
                    content: "❌ Ação não reconhecida!",
                    ephemeral: true
                });
        }
    }
});

async function handleClearFast(interaction: any) {
    const modal = new ModalBuilder()
        .setCustomId('fwck_clear_fast_modal')
        .setTitle('🗑️ Clear Rápido');

    const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Quantidade de mensagens (1-100)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 50')
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput)
    );

    await interaction.showModal(modal);
}

async function handleClearUser(interaction: any) {
    const modal = new ModalBuilder()
        .setCustomId('fwck_clear_user_modal')
        .setTitle('👤 Clear Usuário');

    const userInput = new TextInputBuilder()
        .setCustomId('user_id')
        .setLabel('ID do usuário')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 123456789012345678')
        .setMinLength(10)
        .setMaxLength(25)
        .setRequired(true);

    const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Quantidade para verificar (1-100)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 100')
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(userInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput)
    );

    await interaction.showModal(modal);
}

async function handleClearCustom(interaction: any) {
    const modal = new ModalBuilder()
        .setCustomId('fwck_clear_custom_modal')
        .setTitle('🎯 Clear Customizado');

    const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Quantidade de mensagens (1-100)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 30')
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true);

    const filterInput = new TextInputBuilder()
        .setCustomId('filter_word')
        .setLabel('Palavra/termo para filtrar (opcional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: spam, @everyone')
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(filterInput)
    );

    await interaction.showModal(modal);
}