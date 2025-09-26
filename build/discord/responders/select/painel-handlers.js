import { createResponder, ResponderType } from "#base";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getServerEmojis } from "../../commands/public/config-manager.js";
// Handler para o select menu do painel principal
createResponder({
    customId: "painel_select",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                flags: 64
            });
            return;
        }
        const selectedValue = interaction.values[0];
        try {
            switch (selectedValue) {
                case 'moderation':
                    await handleModerationPanel(interaction);
                    break;
                case 'automation':
                    await handleAutomationPanel(interaction);
                    break;
                case 'logs_config':
                    await handleLogsConfigPanel(interaction);
                    break;
                case 'fun':
                    await handleFunPanel(interaction);
                    break;
                case 'utilities':
                    await handleUtilitiesPanel(interaction);
                    break;
                case 'announcement':
                    await handleAnnouncementPanel(interaction);
                    break;
                case 'voice_control':
                    await handleVoiceControlPanel(interaction);
                    break;
                case 'nuke':
                    await handleNukePanel(interaction);
                    break;
                case 'mod_manager':
                    await handleModManagerPanel(interaction);
                    break;
                default:
                    await interaction.reply({
                        content: "❌ Opção não reconhecida!",
                        flags: 64
                    });
            }
        }
        catch (error) {
            console.error('Erro ao processar seleção do painel:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                    flags: 64
                });
            }
        }
    }
});
async function handleModerationPanel(interaction) {
    const guildId = interaction.guild?.id;
    const emojis = guildId ? getServerEmojis(guildId) : {};
    const embed = new EmbedBuilder()
        .setColor("#ff4757")
        .setTitle(`${emojis.antinuke || "🛡️"} **MODERAÇÃO** | Comandos de Controle`)
        .setDescription(`> **Comandos de moderação disponíveis:**\n\n` +
        `\`/ban\` - Banir um usuário permanentemente\n` +
        `\`/kick\` - Expulsar um usuário do servidor\n` +
        `\`/timeout\` - Silenciar temporariamente\n` +
        `\`/warn\` - Advertir um usuário\n` +
        `\`/unban\` - Remover banimento\n` +
        `\`/clear\` - Limpar mensagens do canal\n` +
        `\`/purgeuser\` - Deletar mensagens de um usuário\n` +
        `\`/lockdown\` - Bloquear canal\n` +
        `\`/unlock\` - Desbloquear canal\n` +
        `\`/slowmode\` - Configurar modo lento\n\n` +
        `${emojis.alert_white || "⚠️"} **Todos os comandos requerem permissões adequadas**\n` +
        `${emojis.mod_black || "🔧"} **Use os comandos slash diretamente no chat**`)
        .setFooter({ text: "Eixo Bot • Moderação • Use os comandos diretamente!" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleAutomationPanel(interaction) {
    const guildId = interaction.guild?.id;
    const emojis = guildId ? getServerEmojis(guildId) : {};
    const embed = new EmbedBuilder()
        .setColor("#2ed573")
        .setTitle(`${emojis.clyde || "🤖"} **AUTOMAÇÃO** | Sistemas Automáticos`)
        .setDescription(`> **Selecione um sistema de automação para configurar:**\n\n` +
        `🛡️ **Anti-Spam** - Proteção contra spam de mensagens\n` +
        `🔗 **Anti-Links** - Bloqueio de links indesejados\n` +
        `🚫 **Filtro de Palavras** - Filtragem automática de conteúdo\n` +
        `🎭 **Auto-Roles** - Cargos automáticos para novos membros\n` +
        `👋 **Welcome** - Mensagens de boas-vindas e despedida\n\n` +
        `⚙️ **Configure através dos botões abaixo**`)
        .setFooter({ text: "Eixo Bot • Automação" })
        .setTimestamp();
    const automationButtons = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("auto_antispam")
        .setLabel("Anti-Spam")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId("auto_antilinks")
        .setLabel("Anti-Links")
        .setEmoji("🔗")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("auto_bannedwords")
        .setLabel("Palavras Proibidas")
        .setEmoji("🚫")
        .setStyle(ButtonStyle.Primary), new ButtonBuilder()
        .setCustomId("auto_welcome")
        .setLabel("Welcome")
        .setEmoji("👋")
        .setStyle(ButtonStyle.Success));
    const secondRow = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("auto_autoroles")
        .setLabel("Auto-Roles")
        .setEmoji("🎭")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Danger));
    await interaction.update({
        embeds: [embed],
        components: [automationButtons, secondRow]
    });
}
async function handleLogsConfigPanel(interaction) {
    const guildId = interaction.guild?.id;
    const emojis = guildId ? getServerEmojis(guildId) : {};
    const embed = new EmbedBuilder()
        .setColor("#5352ed")
        .setTitle(`${emojis.mod_black || "📋"} **LOGS & CONFIGURAÇÃO** | Ajustes do Servidor`)
        .setDescription(`> **Comandos de configuração disponíveis:**\n\n` +
        `\`/setlogs\` - Configurar canal de logs do servidor\n` +
        `\`/testlogs\` - Testar sistema de logs\n` +
        `\`/emoji-manager\` - Gerenciar emojis personalizados do bot\n\n` +
        `**📋 Eventos que serão registrados:**\n` +
        `• 🔨 Banimentos e desbanimentos\n` +
        `• 👢 Expulsões de membros\n` +
        `• 🔇 Timeouts e silenciamentos\n` +
        `• 📥📤 Entrada e saída de membros\n` +
        `• 🗑️✏️ Mensagens deletadas e editadas\n` +
        `• ⚠️ Advertências e ações de moderação\n\n` +
        `${emojis.alert_white || "⚠️"} **Requer permissões administrativas**\n` +
        `${emojis.gears || "⚙️"} **Use os comandos slash diretamente no chat**`)
        .setFooter({ text: "Eixo Bot • Configuração • Ajuste seu servidor" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleFunPanel(interaction) {
    const guildId = interaction.guild?.id;
    const emojis = guildId ? getServerEmojis(guildId) : {};
    const embed = new EmbedBuilder()
        .setColor("#ff6b81")
        .setTitle(`${emojis.A_Tada || "🎭"} **DIVERSÃO** | Entretenimento`)
        .setDescription(`> **Comandos de diversão disponíveis:**\n\n` +
        `\`/avatar\` - Ver avatar de usuários\n` +
        `\`/roll\` - Rolar dados virtuais\n` +
        `\`/coinflip\` - Cara ou coroa\n` +
        `\`/8ball\` - Bola 8 mágica\n\n` +
        `🎮 **Disponível para todos os usuários**\n` +
        `🎉 **Use os comandos slash diretamente no chat!**`)
        .setFooter({ text: "Eixo Bot • Diversão" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleUtilitiesPanel(interaction) {
    const guildId = interaction.guild?.id;
    const emojis = guildId ? getServerEmojis(guildId) : {};
    const embed = new EmbedBuilder()
        .setColor("#ffa502")
        .setTitle(`${emojis.serverowner || "🔧"} **UTILIDADES** | Ferramentas Úteis`)
        .setDescription(`> **Comandos de utilidade disponíveis:**\n\n` +
        `\`/ping\` - Verificar latência e status do bot\n` +
        `\`/serverinfo\` - Informações detalhadas do servidor\n` +
        `\`/userinfo\` - Informações completas sobre usuários\n` +
        `\`/invite\` - Gerar convite personalizado do servidor\n\n` +
        `📈 **Informações em tempo real**\n` +
        `📊 **Estatísticas detalhadas**\n` +
        `🔧 **Ferramentas administrativas**\n` +
        `💡 **Use os comandos slash diretamente no chat!**`)
        .setFooter({ text: "Eixo Bot • Utilidades • Informações úteis" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleAnnouncementPanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor("#00d2d3")
        .setTitle("📢 **SISTEMA DE AVISOS** | Embeds Personalizados")
        .setDescription(`> **Configure e envie embeds personalizados:**\n\n` +
        `📝 **Comando:** \`/aviso\`\n` +
        `🎨 **Personalize:** Cor, título, descrição, imagem\n` +
        `📍 **Destino:** Escolha o canal de destino\n` +
        `🖼️ **Suporte a imagens:** Envie embeds com imagens\n\n` +
        `💡 **Como usar:**\n` +
        `Use o comando \`/aviso\` e preencha os campos desejados.\n` +
        `Você pode escolher a cor do embed, adicionar imagens e muito mais!`)
        .setFooter({ text: "Eixo Bot • Sistema de Avisos" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleVoiceControlPanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor("#7289da")
        .setTitle("🎵 **CONTROLE DE VOZ** | Gerenciar Conexões")
        .setDescription(`> **Comandos de controle de voz disponíveis:**\n\n` +
        `\`/entrar\` - Conectar o bot ao canal de voz\n` +
        `\`/sair\` - Desconectar o bot do canal de voz\n\n` +
        `🎤 **Como usar:**\n` +
        `• **Para conectar:** Use \`/entrar #canal-de-voz\`\n` +
        `• **Para desconectar:** Use \`/sair\`\n\n` +
        `📝 **Observações:**\n` +
        `• O bot precisa de permissões para conectar ao canal\n` +
        `• O canal deve ser um canal de voz válido\n` +
        `• O bot pode ficar conectado até ser desconectado manualmente`)
        .setFooter({ text: "Eixo Bot • Controle de Voz" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleNukePanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("💥 **NUKE CHANNEL** | Deletar e Recriar Canal")
        .setDescription(`> **ATENÇÃO: Esta ação é irreversível!**\n\n` +
        `⚠️ **O que faz:**\n` +
        `• Deleta completamente o canal atual\n` +
        `• Recria um canal idêntico no mesmo local\n` +
        `• **TODO O HISTÓRICO DE MENSAGENS SERÁ PERDIDO**\n\n` +
        `🔒 **Comando:** \`/nuke\`\n\n` +
        `📋 **Requisitos:**\n` +
        `• Permissão de **Gerenciar Canais**\n` +
        `• Confirmação obrigatória\n` +
        `• Não pode ser desfeito\n\n` +
        `💡 **Use com extrema cautela!**\n` +
        `Esta função é útil para limpar completamente um canal quando necessário.`)
        .setFooter({ text: "Eixo Bot • Nuke Channel • USE COM CUIDADO!" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
async function handleModManagerPanel(interaction) {
    const embed = new EmbedBuilder()
        .setColor("#9c88ff")
        .setTitle("🎨 **MOD MANAGER** | Personalizar Painéis")
        .setDescription(`> **Personalize textos e emojis dos painéis:**\n\n` +
        `🎭 **Funcionalidades:**\n` +
        `• Editar emojis personalizados: \`/emoji-manager\`\n` +
        `• Personalizar textos dos painéis\n` +
        `• Configurar cores e estilos\n` +
        `• Resetar para configurações padrão\n\n` +
        `⚙️ **Como usar:**\n` +
        `Use \`/emoji-manager\` para gerenciar emojis dos painéis.\n` +
        `Mais opções de personalização serão adicionadas em breve!\n\n` +
        `🎨 **Categorias disponíveis:**\n` +
        `• Painel Principal • Moderação • Automação\n` +
        `• Diversão • Utilidades • Configurações`)
        .setFooter({ text: "Eixo Bot • Mod Manager • Personalize seu bot!" })
        .setTimestamp();
    const backButton = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId("painel_back")
        .setLabel("◀ Voltar ao Painel")
        .setStyle(ButtonStyle.Secondary));
    await interaction.update({
        embeds: [embed],
        components: [backButton]
    });
}
