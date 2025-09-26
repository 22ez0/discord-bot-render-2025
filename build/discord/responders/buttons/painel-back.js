import { createResponder, ResponderType } from "#base";
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { getServerEmojis } from "../../commands/public/config-manager.js";
// Handler para o botão de voltar ao painel principal
createResponder({
    customId: "painel_back",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }
        const botAvatarURL = interaction.client.user?.displayAvatarURL();
        const guildId = interaction.guild?.id;
        const emojis = guildId ? getServerEmojis(guildId) : {};
        const guildName = interaction.guild?.name || "Servidor";
        // Recriar o embed principal
        const mainEmbed = new EmbedBuilder()
            .setColor("#2f3136")
            .setTitle(`${emojis.mod_black || "🎛️"} **PAINEL DE ADMINISTRAÇÃO**`)
            .setDescription(`**Bem-vindo ao sistema de administração completo!**\n\n` +
            `Configure todos os aspectos do seu servidor de forma fácil e intuitiva.\n\n` +
            `**Membros Permitidos:** Administradores\n` +
            `**Comandos Personalizados:** Habilitados\n\n` +
            `${emojis.alert_white || "💡"} Em caso de dúvidas ou bugs, não hesite em entrar em contato com o suporte para que nossa equipe possa lhe ajudar.`)
            .setThumbnail(botAvatarURL || null)
            .setFooter({
            text: `Servidor: ${guildName} • Eixo Bot`,
            iconURL: botAvatarURL || undefined
        })
            .setTimestamp();
        // Recriar o dropdown select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("painel_select")
            .setPlaceholder("Selecione os cargos desejados")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
            new StringSelectMenuOptionBuilder()
                .setLabel("🛡️ Moderação")
                .setDescription("Comandos de moderação e controle do servidor")
                .setValue("moderation")
                .setEmoji(emojis.antinuke || "🛡️"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🤖 Automação")
                .setDescription("Sistemas automáticos (Anti-spam, Auto-role, Boas-vindas)")
                .setValue("automation")
                .setEmoji(emojis.clyde || "🤖"),
            new StringSelectMenuOptionBuilder()
                .setLabel("📋 Logs & Configuração")
                .setDescription("Configurar logs e ajustes gerais do servidor")
                .setValue("logs_config")
                .setEmoji(emojis.mod_black || "📋"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🎭 Diversão")
                .setDescription("Comandos de entretenimento e diversão")
                .setValue("fun")
                .setEmoji(emojis.A_Tada || "🎭"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🔧 Utilidades")
                .setDescription("Ferramentas úteis para administração")
                .setValue("utilities")
                .setEmoji(emojis.serverowner || "🔧"),
            new StringSelectMenuOptionBuilder()
                .setLabel("💬 Sistema de Avisos")
                .setDescription("Enviar embeds personalizados para canais")
                .setValue("announcement")
                .setEmoji("📢"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🎵 Controle de Voz")
                .setDescription("Conectar/desconectar bot de canais de voz")
                .setValue("voice_control")
                .setEmoji("🎵"),
            new StringSelectMenuOptionBuilder()
                .setLabel("💥 Nuke Channel")
                .setDescription("Deletar e recriar canal (use com cuidado!)")
                .setValue("nuke")
                .setEmoji("💥"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🎨 Mod Manager")
                .setDescription("Personalizar textos e emojis dos painéis")
                .setValue("mod_manager")
                .setEmoji("🎨")
        ]);
        const row = new ActionRowBuilder()
            .addComponents(selectMenu);
        await interaction.update({
            embeds: [mainEmbed],
            components: [row]
        });
    }
});
