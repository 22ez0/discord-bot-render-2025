import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, ChannelType } from "discord.js";
// Sistema unificado de configuração de logs (em memória) 
const guildLogChannels = new Map();
function setGuildLogChannel(guildId, channelId) {
    guildLogChannels.set(guildId, channelId);
    console.log(`[LOGS] Canal configurado para guild ${guildId}: ${channelId}`);
}
async function getLogChannel(guildId, client) {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            return null;
        // Primeiro tentar configuração salva
        const savedChannelId = guildLogChannels.get(guildId);
        if (savedChannelId) {
            const savedChannel = guild.channels.cache.get(savedChannelId);
            if (savedChannel && savedChannel.isTextBased()) {
                const botPermissions = savedChannel.permissionsFor(guild.members.me);
                if (botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    return savedChannel;
                }
                console.warn(`[LOGS] Bot sem permissões no canal configurado: ${savedChannelId}`);
            }
        }
        // Fallback: procurar por nome
        const fallbackChannel = guild.channels.cache.find((ch) => ch.type === ChannelType.GuildText &&
            (ch.name.includes('log') || ch.name.includes('audit') || ch.name.includes('moderação')));
        if (fallbackChannel) {
            const botPermissions = fallbackChannel.permissionsFor(guild.members.me);
            if (botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                return fallbackChannel;
            }
        }
        return null;
    }
    catch (error) {
        console.error('[LOGS] Erro ao obter canal:', error);
        return null;
    }
}
// Exportar funções para outros módulos (se necessário)
globalThis.eixoLogConfig = { setGuildLogChannel, getLogChannel };
// Comando para configurar canal de logs
createCommand({
    name: "setlogs",
    description: "Configurar canal para logs de moderação e eventos do servidor",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
    options: [
        {
            name: "canal",
            description: "Canal onde os logs serão enviados",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [0], // Apenas canais de texto
            required: true
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }
        const logChannel = interaction.options.getChannel("canal", true);
        if (logChannel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "❌ **Erro!** O canal de logs deve ser um canal de texto.",
                flags: 64
            });
            return;
        }
        try {
            // Verificar permissões do bot no canal
            const botPermissions = logChannel.permissionsFor(interaction.client.user);
            if (!botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                await interaction.reply({
                    content: "❌ **Erro de permissão!** Não tenho permissão para enviar mensagens ou embeds no canal especificado.",
                    flags: 64
                });
                return;
            }
            // Salvar configuração persistente
            setGuildLogChannel(interaction.guild.id, logChannel.id);
            // Testar se o bot pode enviar mensagens no canal
            const testEmbed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("✅ **SISTEMA DE LOGS CONFIGURADO**")
                .setDescription(`**Canal de logs configurado:** ${logChannel}\n\n` +
                `**📋 Eventos que serão registrados:**\n` +
                `• 🔨 Banimentos e desbanimentos\n` +
                `• 👢 Expulsões de membros\n` +
                `• 🔇 Timeouts e silenciamentos\n` +
                `• 📥📤 Entrada e saída de membros\n` +
                `• 🗑️✏️ Mensagens deletadas e editadas\n` +
                `• ⚠️ Advertências e ações de moderação\n\n` +
                `**Configurado por:** ${interaction.user.tag}`)
                .setTimestamp()
                .setFooter({ text: "Sistema de logs ativo • Eixo Bot" });
            await logChannel.send({ embeds: [testEmbed] });
            // Confirmar configuração
            const successEmbed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("✅ **CONFIGURAÇÃO CONCLUÍDA**")
                .setDescription(`O canal ${logChannel} foi configurado como canal de logs!\n\n` +
                `**📝 Nota:** Certifique-se de que o canal tenha um nome com 'log', 'audit' ou 'moderação'.\n` +
                `**⚙️ Use /testlogs para testar o funcionamento.**`)
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        catch (error) {
            console.error("Erro ao configurar canal de logs:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível enviar mensagem no canal especificado. Verifique se tenho permissão para escrever nele.",
                flags: 64
            });
        }
    }
});
// Comando para testar o sistema de logs
createCommand({
    name: "testlogs",
    description: "Testar o sistema de logs com uma mensagem de exemplo",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }
        try {
            // Encontrar canal de logs usando sistema unificado
            const logChannel = await getLogChannel(interaction.guild.id, interaction.client);
            if (!logChannel) {
                await interaction.reply({
                    content: "❌ **Erro!** Nenhum canal de logs encontrado. Configure um com `/setlogs` ou crie um canal com 'log', 'audit' ou 'moderação' no nome.",
                    flags: 64
                });
                return;
            }
            // Enviar mensagem de teste
            const testEmbed = new EmbedBuilder()
                .setColor("#4834d4")
                .setTitle("🧪 **TESTE DO SISTEMA DE LOGS**")
                .setDescription(`**Teste executado por:** ${interaction.user.tag} \`(${interaction.user.id})\`\n` +
                `**Canal:** ${interaction.channel}\n` +
                `**Horário:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                `✅ **Sistema de logs funcionando corretamente!**\n` +
                `Os eventos de moderação serão registrados neste canal.`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: "Teste do sistema • Eixo Bot" });
            await logChannel.send({ embeds: [testEmbed] });
            await interaction.reply({
                content: `✅ **Teste concluído!** Mensagem de teste enviada para ${logChannel}.`,
                flags: 64
            });
        }
        catch (error) {
            console.error("Erro ao testar logs:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível testar o sistema de logs.",
                flags: 64
            });
        }
    }
});
