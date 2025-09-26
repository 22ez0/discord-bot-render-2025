import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from "discord.js";
import { storage } from "../../../lib/storage.js";
// Configurações de emojis padrão - TODOS os emojis do bot
const defaultEmojis = {
    // Painel principal
    mod_black: "<:mod_black:1418647219246075964>",
    antinuke: "<:antinuke:1418647215542370415>",
    clyde: "<:clyde:1418752850711805975>",
    A_Tada: "<a:A_Tada:1418647260002254981>",
    serverowner: "<:serverowner:1418752887768481792>",
    // Moderação  
    crossss: "<:crossss:1418647224929489102>",
    waving: "<a:waving:1419215651880439889>",
    Y_SgarTime: "<:Y_SgarTime:1419134144092307556>",
    Y_survey: "<:Y_survey:1419134117882232902>",
    downtime: "<a:downtime:1419215634721669130>",
    uptimer: "<a:uptimer:1419215637540110336>",
    cooldown: "<:cooldown:1418752911587938457>",
    alert_white: "<a:alert_white:1419215644435681421>",
    Y_left: "<a:Y_left:1419134147926032558>",
    // Automação
    Antinuke: "<:Antinuke:1419248675200172083>",
    reloadlk: "<:reloadlk:1418752934916915370>",
    channels: "<:channels:1418752827462778952>",
    invite: "<a:invite:1419216990601609316>",
    Y_just_a_wave: "<a:Y_just_a_wave:1419134146420146267>",
    gears: "<a:gears:1419216984188387329>",
    // Emojis padrão do Discord usados em diversão, utilidades, etc
    dice: "🎲",
    coin: "🪙",
    lightning: "⚡",
    picture: "🖼️",
    eight_ball: "🎱",
    computer: "🖥️",
    person: "👤",
    signal: "📡",
    envelope: "📨",
    gear: "⚙️",
    robot: "🤖",
    wave: "👋",
    masks: "🎭",
    memo: "📝",
    target: "🎯",
    hammer: "🔨",
    boot: "👢",
    mute: "🔇",
    broom: "🧹",
    musical_note: "🎵",
    tools: "🛠️",
    warning: "⚠️",
    check_mark: "✅",
    x_mark: "❌",
    ping_pong: "🏓",
    shield: "🛡️",
    link: "🔗",
    pencil: "✏️",
    repeat: "🔄",
    art: "🎨",
    list: "📋",
    // Emojis de status/feedback
    green_circle: "🟢",
    yellow_circle: "🟡",
    red_circle: "🔴",
    tada: "🎉",
    thinking: "🤔",
    eyes: "👀",
    point_right: "👉",
    point_left: "👈",
    arrow_left: "◀",
    arrow_right: "▶"
};
// O armazenamento agora é feito via sistema de storage persistente
export default createCommand({
    name: "emoji-manager",
    description: "🎨 Gerenciar emojis personalizados do painel do bot",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "list",
            description: "📋 Listar todos os emojis configurados",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "edit",
            description: "✏️ Editar emojis do painel",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "reset",
            description: "🔄 Resetar para emojis padrão",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    async run(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }
        // Verificar permissões de administrador
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.permissions.has('Administrator')) {
            await interaction.reply({
                content: "❌ Você precisa de permissões de **Administrador** para usar este comando!",
                ephemeral: true
            });
            return;
        }
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'list':
                await handleListEmojis(interaction);
                break;
            case 'edit':
                await handleEditEmojis(interaction);
                break;
            case 'reset':
                await handleResetEmojis(interaction);
                break;
        }
    }
});
async function handleListEmojis(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guildId = interaction.guild.id;
    const customEmojis = storage.getServerEmojis(guildId);
    const currentEmojis = customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📋 **Lista de Emojis Configurados**")
        .setDescription("Aqui estão todos os emojis personalizados configurados para o painel:")
        .addFields({
        name: "🎯 **Painel Principal**",
        value: `**mod_black:** ${currentEmojis.mod_black}\n` +
            `**antinuke:** ${currentEmojis.antinuke}\n` +
            `**clyde:** ${currentEmojis.clyde}\n` +
            `**A_Tada:** ${currentEmojis.A_Tada}\n` +
            `**serverowner:** ${currentEmojis.serverowner}`,
        inline: true
    }, {
        name: "🛡️ **Moderação**",
        value: `**crossss:** ${currentEmojis.crossss}\n` +
            `**waving:** ${currentEmojis.waving}\n` +
            `**Y_SgarTime:** ${currentEmojis.Y_SgarTime}\n` +
            `**Y_survey:** ${currentEmojis.Y_survey}\n` +
            `**downtime:** ${currentEmojis.downtime}`,
        inline: true
    }, {
        name: "🤖 **Automação**",
        value: `**Antinuke:** ${currentEmojis.Antinuke}\n` +
            `**reloadlk:** ${currentEmojis.reloadlk}\n` +
            `**channels:** ${currentEmojis.channels}\n` +
            `**invite:** ${currentEmojis.invite}\n` +
            `**gears:** ${currentEmojis.gears}`,
        inline: true
    })
        .setFooter({ text: "Use /emoji-manager edit para alterar os emojis" })
        .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
}
async function handleEditEmojis(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const embed = new EmbedBuilder()
        .setColor("#ff6b81")
        .setTitle("✏️ **Editor de Emojis**")
        .setDescription("**Selecione uma categoria para editar:**\n\n" +
        "🎯 **Painel Principal** - Emojis do menu principal\n" +
        "🛡️ **Moderação** - Emojis dos comandos de moderação\n" +
        "🤖 **Automação** - Emojis dos sistemas automáticos\n\n" +
        "**Como usar:**\n" +
        "1. Selecione a categoria\n" +
        "2. Escolha o emoji a alterar\n" +
        "3. Cole o novo emoji personalizado\n" +
        "4. Confirme a alteração")
        .setFooter({ text: "💡 Dica: Use emojis do seu servidor para melhor funcionamento" })
        .setTimestamp();
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('emoji_category_select')
        .setPlaceholder('📝 Selecione uma categoria para editar')
        .addOptions(new StringSelectMenuOptionBuilder()
        .setLabel('Painel Principal')
        .setDescription('Emojis do menu principal do /eixo')
        .setValue('main_panel')
        .setEmoji('🎯'), new StringSelectMenuOptionBuilder()
        .setLabel('Moderação')
        .setDescription('Emojis dos comandos de moderação')
        .setValue('moderation')
        .setEmoji('🛡️'), new StringSelectMenuOptionBuilder()
        .setLabel('Automação')
        .setDescription('Emojis dos sistemas automáticos')
        .setValue('automation')
        .setEmoji('🤖'), new StringSelectMenuOptionBuilder()
        .setLabel('Diversão & Utilidades')
        .setDescription('Emojis de comandos de diversão e utilitários')
        .setValue('fun_utils')
        .setEmoji('🎮'), new StringSelectMenuOptionBuilder()
        .setLabel('Status & Feedback')
        .setDescription('Emojis de status, avisos e feedback')
        .setValue('status_feedback')
        .setEmoji('📊'));
    const row = new ActionRowBuilder()
        .addComponents(selectMenu);
    const reply = await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
    // Collector para o select menu
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300000,
        filter: (i) => i.user.id === interaction.user.id
    });
    collector.on('collect', async (selectInteraction) => {
        const category = selectInteraction.values[0];
        await handleCategorySelection(selectInteraction, category);
    });
    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => null);
    });
}
async function handleCategorySelection(interaction, category) {
    let emojiOptions = [];
    const guildId = interaction.guild.id;
    const customEmojis = storage.getServerEmojis(guildId);
    const currentEmojis = customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
    switch (category) {
        case 'main_panel':
            emojiOptions = [
                { name: 'Moderação Icon', id: 'mod_black', current: currentEmojis.mod_black },
                { name: 'Anti-Nuke Icon', id: 'antinuke', current: currentEmojis.antinuke },
                { name: 'Clyde Icon', id: 'clyde', current: currentEmojis.clyde },
                { name: 'Celebração Icon', id: 'A_Tada', current: currentEmojis.A_Tada },
                { name: 'Servidor Owner Icon', id: 'serverowner', current: currentEmojis.serverowner }
            ];
            break;
        case 'moderation':
            emojiOptions = [
                { name: 'Ban Icon', id: 'crossss', current: currentEmojis.crossss },
                { name: 'Kick Icon', id: 'waving', current: currentEmojis.waving },
                { name: 'Timeout Icon', id: 'Y_SgarTime', current: currentEmojis.Y_SgarTime },
                { name: 'Clear Icon', id: 'Y_survey', current: currentEmojis.Y_survey },
                { name: 'Lock Icon', id: 'downtime', current: currentEmojis.downtime },
                { name: 'Unlock Icon', id: 'uptimer', current: currentEmojis.uptimer },
                { name: 'Slowmode Icon', id: 'cooldown', current: currentEmojis.cooldown },
                { name: 'Alert Icon', id: 'alert_white', current: currentEmojis.alert_white },
                { name: 'Voltar Icon', id: 'Y_left', current: currentEmojis.Y_left },
                { name: 'Hammer Ban', id: 'hammer', current: currentEmojis.hammer },
                { name: 'Boot Kick', id: 'boot', current: currentEmojis.boot },
                { name: 'Shield Mod', id: 'shield', current: currentEmojis.shield }
            ];
            break;
        case 'automation':
            emojiOptions = [
                { name: 'Anti-Nuke System', id: 'Antinuke', current: currentEmojis.Antinuke },
                { name: 'Anti-Links Icon', id: 'reloadlk', current: currentEmojis.reloadlk },
                { name: 'Channels Icon', id: 'channels', current: currentEmojis.channels },
                { name: 'Invite Icon', id: 'invite', current: currentEmojis.invite },
                { name: 'Wave Icon', id: 'Y_just_a_wave', current: currentEmojis.Y_just_a_wave },
                { name: 'Gears Icon', id: 'gears', current: currentEmojis.gears },
                { name: 'Robot Auto', id: 'robot', current: currentEmojis.robot },
                { name: 'Wave Welcome', id: 'wave', current: currentEmojis.wave },
                { name: 'Tools Config', id: 'tools', current: currentEmojis.tools }
            ];
            break;
        case 'fun_utils':
            emojiOptions = [
                { name: 'Dados/Dice', id: 'dice', current: currentEmojis.dice },
                { name: 'Moeda/Coin', id: 'coin', current: currentEmojis.coin },
                { name: 'Raio/Lightning', id: 'lightning', current: currentEmojis.lightning },
                { name: 'Foto/Picture', id: 'picture', current: currentEmojis.picture },
                { name: 'Bola 8', id: 'eight_ball', current: currentEmojis.eight_ball },
                { name: 'Computador', id: 'computer', current: currentEmojis.computer },
                { name: 'Pessoa/Person', id: 'person', current: currentEmojis.person },
                { name: 'Sinal/Signal', id: 'signal', current: currentEmojis.signal },
                { name: 'Envelope', id: 'envelope', current: currentEmojis.envelope },
                { name: 'Ping Pong', id: 'ping_pong', current: currentEmojis.ping_pong }
            ];
            break;
        case 'status_feedback':
            emojiOptions = [
                { name: 'Check/Sucesso', id: 'check_mark', current: currentEmojis.check_mark },
                { name: 'X/Erro', id: 'x_mark', current: currentEmojis.x_mark },
                { name: 'Aviso/Warning', id: 'warning', current: currentEmojis.warning },
                { name: 'Verde/Ótimo', id: 'green_circle', current: currentEmojis.green_circle },
                { name: 'Amarelo/Bom', id: 'yellow_circle', current: currentEmojis.yellow_circle },
                { name: 'Vermelho/Ruim', id: 'red_circle', current: currentEmojis.red_circle },
                { name: 'Festa/Tada', id: 'tada', current: currentEmojis.tada },
                { name: 'Pensando', id: 'thinking', current: currentEmojis.thinking }
            ];
            break;
    }
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`emoji_edit_${category}`)
        .setPlaceholder('✏️ Selecione um emoji para editar')
        .addOptions(emojiOptions.map(emoji => new StringSelectMenuOptionBuilder()
        .setLabel(emoji.name)
        .setDescription(`Atual: ${emoji.current}`)
        .setValue(emoji.id)
        .setEmoji('✏️')));
    const embed = new EmbedBuilder()
        .setColor("#ffa502")
        .setTitle(`✏️ **Editando: ${getCategoryName(category)}**`)
        .setDescription("**Selecione o emoji que deseja alterar:**\n\n" +
        emojiOptions.map(emoji => `**${emoji.name}:** ${emoji.current}`).join('\n') +
        "\n\n💡 **Dica:** Você pode usar emojis do seu servidor ou emojis padrão do Discord")
        .setTimestamp();
    const row = new ActionRowBuilder()
        .addComponents(selectMenu);
    await interaction.update({ embeds: [embed], components: [row] });
    // Novo collector para edição específica
    const editCollector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300000,
        filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('emoji_edit_')
    });
    editCollector.on('collect', async (editInteraction) => {
        const emojiId = editInteraction.values[0];
        await showEmojiEditModal(editInteraction, emojiId, category);
    });
}
async function showEmojiEditModal(interaction, emojiId, category) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import("discord.js");
    const guildId = interaction.guild.id;
    const customEmojis = storage.getServerEmojis(guildId);
    const currentEmojis = customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
    const currentEmoji = currentEmojis[emojiId];
    const modal = new ModalBuilder()
        .setCustomId(`emoji_modal_${emojiId}_${category}`)
        .setTitle(`✏️ Editar Emoji: ${emojiId}`);
    const emojiInput = new TextInputBuilder()
        .setCustomId('new_emoji')
        .setLabel('Novo Emoji')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Cole aqui o emoji personalizado (ex: <:nome:123456789>)')
        .setValue(currentEmoji)
        .setMaxLength(100);
    const actionRow = new ActionRowBuilder()
        .addComponents(emojiInput);
    modal.addComponents(actionRow);
    await interaction.showModal(modal);
}
async function handleResetEmojis(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guildId = interaction.guild.id;
    const embed = new EmbedBuilder()
        .setColor("#ff4757")
        .setTitle("🔄 **Resetar Emojis**")
        .setDescription("⚠️ **Atenção!** Esta ação irá resetar **todos** os emojis personalizados para os padrão.\n\n" +
        "**Você tem certeza que deseja continuar?**\n" +
        "Esta ação não pode ser desfeita.")
        .setFooter({ text: "Clique em Confirmar para prosseguir ou Cancelar para voltar" })
        .setTimestamp();
    const row = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
        .setCustomId('reset_confirm')
        .setLabel('Confirmar Reset')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔄'), new ButtonBuilder()
        .setCustomId('reset_cancel')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌'));
    const reply = await interaction.editReply({ embeds: [embed], components: [row] });
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id
    });
    collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'reset_confirm') {
            storage.updateServerEmojis(guildId, {});
            const successEmbed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("✅ **Emojis Resetados**")
                .setDescription("Todos os emojis foram resetados para os padrão com sucesso!")
                .setTimestamp();
            await buttonInteraction.update({ embeds: [successEmbed], components: [] });
        }
        else {
            const cancelEmbed = new EmbedBuilder()
                .setColor("#747d8c")
                .setTitle("❌ **Reset Cancelado**")
                .setDescription("O reset foi cancelado. Seus emojis personalizados permanecem inalterados.")
                .setTimestamp();
            await buttonInteraction.update({ embeds: [cancelEmbed], components: [] });
        }
    });
    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => null);
    });
}
function getCategoryName(category) {
    switch (category) {
        case 'main_panel': return 'Painel Principal';
        case 'moderation': return 'Moderação';
        case 'automation': return 'Automação';
        case 'fun_utils': return 'Diversão & Utilidades';
        case 'status_feedback': return 'Status & Feedback';
        default: return 'Categoria';
    }
}
// Função para obter emojis do servidor
export function getServerEmojis(guildId) {
    const customEmojis = storage.getServerEmojis(guildId);
    return customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
}
// Função para atualizar emoji
export function updateServerEmoji(guildId, emojiId, newEmoji) {
    const customEmojis = storage.getServerEmojis(guildId) || {};
    customEmojis[emojiId] = newEmoji;
    storage.updateServerEmojis(guildId, customEmojis);
}
