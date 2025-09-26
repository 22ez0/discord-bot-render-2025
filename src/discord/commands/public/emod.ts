import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { storage } from "../../../lib/storage.js";

createCommand({
    name: "emod",
    description: "🛡️ Ativar sistema de auto-moderação e!mod com regras específicas",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });
        
        const guildId = interaction.guild!.id;
        
        try {
            // Inicializar automod e!mod com configurações específicas
            const success = storage.initializeEmodAutomod(guildId);
            
            if (success) {
                const embed = new EmbedBuilder()
                    .setColor("#2ed573")
                    .setTitle("🛡️ **SISTEMA e!mod ATIVADO**")
                    .setDescription(
                        `**Sistema de auto-moderação ativado com sucesso!**\n\n` +
                        `🚫 **Palavras Proibidas:** cp, child porn, cepe, sepe, estupro, rape, etc.\n` +
                        `👶 **Detecção de Idade:** Bane automaticamente padrões de idade ≤17 anos\n` +
                        `📨 **Anti-Spam:** 8 mensagens em 4s = timeout 30s\n` +
                        `📋 **Anti-Idênticas:** 3 mensagens iguais em 4s = timeout 1min\n` +
                        `🔗 **Anti-Links:** Permite apenas gif, tiktok, instagram, spotify\n` +
                        `⚠️ **Sistema de Avisos:** 3 avisos = kick, 4 avisos = ban\n` +
                        `👑 **Usuário Especial:** <@1415549624747560970> autorizado para tudo\n\n` +
                        `📊 **Aplica para todos os canais, inclusive canais de texto em voz**\n` +
                        `📋 **Todas as ações são registradas nos logs automaticamente**`
                    )
                    .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
                    .setFooter({ 
                        text: "e!mod • Auto-Moderação Ativa • Proteção Total", 
                        iconURL: interaction.client.user?.displayAvatarURL() || undefined 
                    })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                
                console.log(`🛡️ Sistema e!mod ativado no servidor ${interaction.guild!.name} (${guildId})`);
            } else {
                await interaction.editReply({
                    content: "❌ **Erro!** Não foi possível ativar o sistema e!mod. Tente novamente."
                });
            }
        } catch (error) {
            console.error('Erro ao ativar e!mod:', error);
            await interaction.editReply({
                content: "❌ **Erro interno!** Não foi possível ativar o sistema e!mod."
            });
        }
    }
});