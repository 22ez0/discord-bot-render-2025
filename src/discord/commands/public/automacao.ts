import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, InteractionDeferReplyOptions } from "discord.js";

createCommand({
    name: "automacao",
    description: "Painel de sistemas automáticos e configurações do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            // Verificar permissões antes de defer
            if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({
                    content: "❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.",
                    flags: 64 // Ephemeral flag moderna
                });
                return;
            }

            // Usar flags modernas para defer
            const deferOptions: InteractionDeferReplyOptions = { flags: 64 }; // Ephemeral
            await interaction.deferReply(deferOptions);
            
            const botAvatarURL = interaction.client.user?.displayAvatarURL();

            const automationEmbed = new EmbedBuilder()
                .setColor(0x2ed573)
                .setTitle("🤖 **AUTOMAÇÃO** | Sistemas Automáticos")
                .setDescription(
                    `> **Selecione um sistema de automação para configurar:**\n\n` +
                    `🛡️ **Anti-Spam** - Proteção contra spam de mensagens\n` +
                    `🔗 **Anti-Links** - Bloqueio de links indesejados\n` +
                    `🚫 **Filtro de Palavras** - Filtragem automática de conteúdo\n` +
                    `🎭 **Auto-Roles** - Cargos automáticos para novos membros\n` +
                    `👋 **Welcome** - Mensagens de boas-vindas e despedida\n` +
                    `🎵 **Voice Join/Leave** - Conectar/desconectar do canal de voz\n\n` +
                    `⚙️ **Configure através dos botões abaixo**`
                )
                .setThumbnail(botAvatarURL || null)
                .setFooter({ 
                    text: "Eixo Bot • Automação", 
                    iconURL: botAvatarURL || undefined 
                })
                .setTimestamp();

            // Primeira linha de botões (4 botões - limite do Discord)
            const row1 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("auto_antispam")
                        .setLabel("Anti-Spam")
                        .setEmoji("🛡️")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("auto_antilinks")
                        .setLabel("Anti-Links")
                        .setEmoji("🔗")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("auto_bannedwords")
                        .setLabel("Palavras Proibidas")
                        .setEmoji("🚫")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("auto_welcome")
                        .setLabel("Welcome")
                        .setEmoji("👋")
                        .setStyle(ButtonStyle.Success)
                );

            // Segunda linha de botões (3 botões)
            const row2 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("auto_autoroles")
                        .setLabel("Auto-Roles")
                        .setEmoji("🎭")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("auto_voice_join")
                        .setLabel("Entrar Voice")
                        .setEmoji("🎵")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("auto_voice_leave")
                        .setLabel("Sair Voice")
                        .setEmoji("🔇")
                        .setStyle(ButtonStyle.Danger)
                );

            // Aguardar um pouco antes de responder para evitar timeout no Replit
            await new Promise(resolve => setTimeout(resolve, 500));

            await interaction.editReply({
                embeds: [automationEmbed],
                components: [row1, row2]
            });

        } catch (error) {
            console.error('❌ Erro crítico no comando /automacao:', error);
            
            // Resposta de erro mais robusta
            const errorMessage = "❌ Erro interno do servidor. Tente novamente em alguns segundos.";
            
            try {
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMessage });
                } else if (!interaction.replied) {
                    await interaction.reply({ 
                        content: errorMessage, 
                        flags: 64 // Ephemeral moderna
                    });
                }
            } catch (criticalError) {
                console.error('❌ Erro crítico ao responder:', criticalError);
                // Se nem isso funcionar, pelo menos logamos
            }
        }
    }
});