import { createResponder, ResponderType } from "#base";
import { EmbedBuilder, ChannelType, PermissionsBitField } from "discord.js";
// Handler para botões de confirmação do nuke
createResponder({
    customId: "nuke_",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.guild || !interaction.channel) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                flags: 64
            });
            return;
        }
        const action = interaction.customId.replace("nuke_", "");
        try {
            if (action === 'cancel') {
                await handleNukeCancel(interaction);
            }
            else if (action.startsWith('confirm_')) {
                const channelId = action.replace('confirm_', '');
                await handleNukeConfirm(interaction, channelId);
            }
            else {
                await interaction.reply({
                    content: "❌ Ação não reconhecida!",
                    flags: 64
                });
            }
        }
        catch (error) {
            console.error('Erro ao processar confirmação de nuke:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                    flags: 64
                });
            }
        }
    }
});
async function handleNukeCancel(interaction) {
    await interaction.deferUpdate();
    const cancelEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("✅ **OPERAÇÃO CANCELADA**")
        .setDescription(`🛡️ **O canal está seguro!**\n\n` +
        `A operação de nuke foi cancelada com sucesso.\n` +
        `Nenhuma alteração foi feita no canal ${interaction.channel}.`)
        .setFooter({ text: "Eixo Bot • Operação cancelada" })
        .setTimestamp();
    await interaction.editReply({
        embeds: [cancelEmbed],
        components: []
    });
}
async function handleNukeConfirm(interaction, channelId) {
    await interaction.deferUpdate();
    // Verificar se é o canal correto
    if (interaction.channel?.id !== channelId) {
        await interaction.editReply({
            content: "❌ **Erro!** Este canal não corresponde ao canal selecionado para nuke.",
            components: []
        });
        return;
    }
    const channel = interaction.channel;
    const guild = interaction.guild;
    // Verificar se é um canal de texto
    if (channel.type !== ChannelType.GuildText) {
        await interaction.editReply({
            content: "❌ **Erro!** Este comando só pode ser usado em canais de texto.",
            components: []
        });
        return;
    }
    // Verificar permissões novamente
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
        await interaction.editReply({
            content: "❌ **Erro de permissão!** Você não tem mais permissão para gerenciar canais.",
            components: []
        });
        return;
    }
    try {
        // Salvar informações do canal antes de deletar
        const channelData = {
            name: channel.name,
            topic: channel.topic,
            position: channel.position,
            parentId: channel.parentId,
            permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                type: overwrite.type,
                allow: overwrite.allow.bitfield.toString(),
                deny: overwrite.deny.bitfield.toString()
            })),
            rateLimitPerUser: channel.rateLimitPerUser,
            nsfw: channel.nsfw
        };
        // Notificar que o processo começou
        const processingEmbed = new EmbedBuilder()
            .setColor("#ff8c00")
            .setTitle("💥 **EXECUTANDO NUKE...**")
            .setDescription("🔄 Destruindo e recriando o canal...\n\nPor favor, aguarde...")
            .setTimestamp();
        await interaction.editReply({
            embeds: [processingEmbed],
            components: []
        });
        // Deletar o canal
        await channel.delete("Comando /nuke executado");
        // Criar novo canal
        const newChannel = await guild.channels.create({
            name: channelData.name,
            type: ChannelType.GuildText,
            topic: channelData.topic || undefined,
            position: channelData.position,
            parent: channelData.parentId || undefined,
            rateLimitPerUser: channelData.rateLimitPerUser,
            nsfw: channelData.nsfw,
            permissionOverwrites: channelData.permissionOverwrites.map(overwrite => ({
                id: overwrite.id,
                type: overwrite.type,
                allow: BigInt(overwrite.allow),
                deny: BigInt(overwrite.deny)
            }))
        });
        // Enviar mensagem de sucesso no novo canal
        const successEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("💥 **NUKE EXECUTADO COM SUCESSO!**")
            .setDescription(`✅ **Canal recriado com sucesso!**\n\n` +
            `🆕 **Novo canal:** ${newChannel}\n` +
            `👤 **Executado por:** ${interaction.user}\n` +
            `🕐 **Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
            `🧹 **O histórico anterior foi completamente removido.**\n` +
            `🔄 **O canal foi recriado com as mesmas configurações.**\n\n` +
            `📝 **Bem-vindos ao canal renovado!**`)
            .setFooter({
            text: "Eixo Bot • Nuke executado com sucesso",
            iconURL: interaction.client.user?.displayAvatarURL()
        })
            .setTimestamp();
        await newChannel.send({ embeds: [successEmbed] });
    }
    catch (error) {
        console.error("Erro ao executar nuke:", error);
        // Tentar enviar erro - como o canal pode ter sido deletado, isso pode falhar
        const errorEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("❌ **ERRO AO EXECUTAR NUKE**")
            .setDescription(`💥 **Falha na operação de nuke!**\n\n` +
            `Ocorreu um erro inesperado ao tentar deletar e recriar o canal.\n\n` +
            `**Possíveis causas:**\n` +
            `• Permissões insuficientes\n` +
            `• Limite de canais atingido\n` +
            `• Erro interno do Discord\n\n` +
            `🔧 **Contate um administrador para assistência.**`)
            .setFooter({ text: "Eixo Bot • Erro na operação" })
            .setTimestamp();
        try {
            // Tentar enviar DM para o usuário
            await interaction.user.send({ embeds: [errorEmbed] });
        }
        catch {
            console.error("Não foi possível enviar DM de erro para o usuário");
        }
    }
}
