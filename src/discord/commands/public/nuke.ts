import { createCommand } from "#base";
import { ApplicationCommandType, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "nuke",
    description: "💥 Deletar e recriar o canal atual (AÇÃO IRREVERSÍVEL!)",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Canais** para usar este comando.",
                flags: 64
            });
            return;
        }

        // Verificar se é um canal válido para nuke
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "❌ **Erro!** Este comando só pode ser usado em canais de texto do servidor.",
                flags: 64
            });
            return;
        }

        const channel = interaction.channel;
        const guild = interaction.guild!;

        // Verificar permissões do bot
        const botPermissions = channel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has([PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ViewChannel])) {
            await interaction.reply({
                content: "❌ **Erro de permissão!** Não tenho permissão para gerenciar canais neste servidor.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });

        // Criar embed de confirmação
        const confirmEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("💥 **CONFIRMAÇÃO DE NUKE**")
            .setDescription(
                `⚠️ **ATENÇÃO: Esta ação é IRREVERSÍVEL!**\n\n` +
                `**Canal a ser destruído:** ${channel}\n` +
                `**Nome do canal:** \`${channel.name}\`\n\n` +
                `🗑️ **O que acontecerá:**\n` +
                `• O canal atual será completamente deletado\n` +
                `• Um novo canal idêntico será criado no mesmo local\n` +
                `• **TODO O HISTÓRICO DE MENSAGENS SERÁ PERDIDO PERMANENTEMENTE**\n` +
                `• Configurações básicas serão mantidas (nome, tópico, posição)\n\n` +
                `❓ **Tem certeza que deseja continuar?**\n` +
                `Esta ação não pode ser desfeita de forma alguma.`
            )
            .setFooter({ 
                text: "Você tem 30 segundos para decidir • Eixo Bot", 
                iconURL: interaction.client.user?.displayAvatarURL() 
            })
            .setTimestamp();

        // Botões de confirmação
        const confirmButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`nuke_confirm_${channel.id}`)
                    .setLabel("💥 SIM, DESTRUIR CANAL")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("nuke_cancel")
                    .setLabel("❌ Cancelar")
                    .setStyle(ButtonStyle.Secondary)
            );

        const confirmMessage = await interaction.editReply({
            embeds: [confirmEmbed],
            components: [confirmButtons]
        });

        // Collector para os botões
        const collector = confirmMessage.createMessageComponentCollector({
            time: 30000,
            filter: (i) => i.user.id === interaction.user.id
        });

        collector.on('collect', async (buttonInteraction) => {
            await buttonInteraction.deferUpdate();

            if (buttonInteraction.customId === 'nuke_cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setTitle("✅ **OPERAÇÃO CANCELADA**")
                    .setDescription(
                        `🛡️ **O canal está seguro!**\n\n` +
                        `A operação de nuke foi cancelada com sucesso.\n` +
                        `Nenhuma alteração foi feita no canal ${channel}.`
                    )
                    .setFooter({ text: "Eixo Bot • Operação cancelada" })
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [cancelEmbed],
                    components: []
                });
                return;
            }

            if (buttonInteraction.customId === `nuke_confirm_${channel.id}`) {
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
                        .setDescription(
                            `✅ **Canal recriado com sucesso!**\n\n` +
                            `🆕 **Novo canal:** ${newChannel}\n` +
                            `👤 **Executado por:** ${interaction.user}\n` +
                            `🕐 **Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                            `🧹 **O histórico anterior foi completamente removido.**\n` +
                            `🔄 **O canal foi recriado com as mesmas configurações.**\n\n` +
                            `📝 **Bem-vindos ao canal renovado!**`
                        )
                        .setFooter({ 
                            text: "Eixo Bot • Nuke executado com sucesso", 
                            iconURL: interaction.client.user?.displayAvatarURL() 
                        })
                        .setTimestamp();

                    await newChannel.send({ embeds: [successEmbed] });

                } catch (error) {
                    console.error("Erro ao executar nuke:", error);
                    
                    // Tentar enviar erro no canal original (se ainda existir) ou DM para o usuário
                    const errorEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setTitle("❌ **ERRO AO EXECUTAR NUKE**")
                        .setDescription(
                            `💥 **Falha na operação de nuke!**\n\n` +
                            `Ocorreu um erro inesperado ao tentar deletar e recriar o canal.\n\n` +
                            `**Possíveis causas:**\n` +
                            `• Permissões insuficientes\n` +
                            `• Limite de canais atingido\n` +
                            `• Erro interno do Discord\n\n` +
                            `🔧 **Tente novamente ou contate um administrador.**`
                        )
                        .setFooter({ text: "Eixo Bot • Erro na operação" })
                        .setTimestamp();

                    try {
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        });
                    } catch {
                        // Se não conseguir editar, tentar DM
                        await interaction.user.send({ embeds: [errorEmbed] }).catch(() => {});
                    }
                }
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor("#ff8c00")
                    .setTitle("⏰ **TEMPO ESGOTADO**")
                    .setDescription(
                        `🛡️ **Operação cancelada por timeout!**\n\n` +
                        `Você não confirmou a operação dentro do tempo limite.\n` +
                        `O canal ${channel} permanece intacto.\n\n` +
                        `💡 Execute o comando novamente se ainda desejar fazer o nuke.`
                    )
                    .setFooter({ text: "Eixo Bot • Timeout de segurança" })
                    .setTimestamp();

                interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                }).catch(() => {});
            }
        });
    }
});