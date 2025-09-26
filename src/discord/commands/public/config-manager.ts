import { createCommand } from "#base";
import { 
    ApplicationCommandType,
    ApplicationCommandOptionType,
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionsBitField 
} from "discord.js";
import { storage } from "../../../lib/storage.js";

// Configurações de emojis padrão - TODOS os emojis do bot
export const defaultEmojis = {
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
    
    // Emojis padrão do Discord
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

createCommand({
    name: "config-manager",
    description: "🎨 Gerenciar todas as configurações do bot (textos, emojis e cores)",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tipo",
            description: "Tipo de configuração a gerenciar",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "🎭 Gerenciar Emojis", value: "emojis" },
                { name: "📝 Editar Textos dos Painéis", value: "textos" },
                { name: "🎨 Personalizar Cores", value: "cores" },
                { name: "📋 Ver Todas as Configurações", value: "view" },
                { name: "🔄 Resetar Configurações", value: "reset" }
            ]
        },
        {
            name: "acao",
            description: "Ação específica para emojis",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "📋 Listar Emojis", value: "list" },
                { name: "✏️ Editar Emojis", value: "edit" },
                { name: "🔄 Resetar Emojis", value: "reset_emojis" }
            ]
        }
    ],
    async run(interaction) {
        // Verificar permissões de administrador
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }

        const tipo = interaction.options.getString("tipo", true);
        const acao = interaction.options.getString("acao");

        // Se o tipo é emoji e há uma ação específica
        if (tipo === "emojis" && acao) {
            switch (acao) {
                case "list":
                    await handleListEmojis(interaction);
                    break;
                case "edit":
                    await handleEditEmojis(interaction);
                    break;
                case "reset_emojis":
                    await handleResetEmojis(interaction);
                    break;
            }
            return;
        }

        // Casos principais
        switch (tipo) {
            case "emojis":
                await handleEmojiMenu(interaction);
                break;
            case "textos":
                await handleEditTexts(interaction);
                break;
            case "cores":
                await handleCustomizeColors(interaction);
                break;
            case "view":
                await handleViewConfig(interaction);
                break;
            case "reset":
                await handleResetAll(interaction);
                break;
        }
    }
});

// Menu principal para emojis (quando não há ação específica)
async function handleEmojiMenu(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor("#9c88ff")
        .setTitle("🎭 **GERENCIAR EMOJIS**")
        .setDescription(
            `> **Escolha uma ação para gerenciar os emojis do bot:**\n\n` +
            `📋 **Listar Emojis** - Ver todos os emojis configurados\n` +
            `✏️ **Editar Emojis** - Personalizar emojis por categoria\n` +
            `🔄 **Resetar Emojis** - Voltar aos emojis padrão\n\n` +
            `💡 **Use os botões abaixo para continuar**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Gerenciamento de Emojis" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("config_emoji_list")
                .setLabel("📋 Listar")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("config_emoji_edit")
                .setLabel("✏️ Editar")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("config_emoji_reset")
                .setLabel("🔄 Resetar")
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
}

// Listar todos os emojis configurados
async function handleListEmojis(interaction: any) {
    await interaction.deferReply({ flags: 64 });
    
    const guildId = interaction.guild!.id;
    const customEmojis = storage.getServerEmojis(guildId);
    const currentEmojis = customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
    
    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📋 **EMOJIS CONFIGURADOS**")
        .setDescription("Aqui estão todos os emojis personalizados configurados:")
        .addFields(
            {
                name: "🎯 **Painel Principal**",
                value: 
                    `**mod_black:** ${currentEmojis.mod_black}\n` +
                    `**antinuke:** ${currentEmojis.antinuke}\n` +
                    `**clyde:** ${currentEmojis.clyde}\n` +
                    `**A_Tada:** ${currentEmojis.A_Tada}\n` +
                    `**serverowner:** ${currentEmojis.serverowner}`,
                inline: true
            },
            {
                name: "🛡️ **Moderação**",
                value: 
                    `**crossss:** ${currentEmojis.crossss}\n` +
                    `**waving:** ${currentEmojis.waving}\n` +
                    `**Y_SgarTime:** ${currentEmojis.Y_SgarTime}\n` +
                    `**Y_survey:** ${currentEmojis.Y_survey}\n` +
                    `**downtime:** ${currentEmojis.downtime}`,
                inline: true
            },
            {
                name: "🤖 **Automação**",
                value: 
                    `**Antinuke:** ${currentEmojis.Antinuke}\n` +
                    `**reloadlk:** ${currentEmojis.reloadlk}\n` +
                    `**channels:** ${currentEmojis.channels}\n` +
                    `**invite:** ${currentEmojis.invite}\n` +
                    `**gears:** ${currentEmojis.gears}`,
                inline: true
            }
        )
        .setFooter({ 
            text: `${interaction.guild!.name} • Eixo Bot • Emojis Configurados`, 
            iconURL: interaction.client.user?.displayAvatarURL() 
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

// Editar emojis por categoria
async function handleEditEmojis(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("✏️ **EDITAR EMOJIS**")
        .setDescription(
            `> **Selecione uma categoria para personalizar:**\n\n` +
            `🎯 **Painel Principal** - Emojis da tela inicial\n` +
            `🛡️ **Moderação** - Emojis dos comandos de moderação\n` +
            `🤖 **Automação** - Emojis dos sistemas automáticos\n` +
            `🎭 **Diversos** - Emojis gerais e utilidades\n\n` +
            `💡 **Escolha uma categoria abaixo**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Edição de Emojis" })
        .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("config_emoji_category")
        .setPlaceholder("Selecione a categoria para editar")
        .addOptions([
            new StringSelectMenuOptionBuilder()
                .setLabel("🎯 Painel Principal")
                .setDescription("Editar emojis da tela principal")
                .setValue("main"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🛡️ Moderação")
                .setDescription("Personalizar emojis de moderação")
                .setValue("moderation"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🤖 Automação")
                .setDescription("Editar emojis dos sistemas automáticos")
                .setValue("automation"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🎭 Diversos")
                .setDescription("Personalizar emojis gerais")
                .setValue("misc")
        ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
}

// Resetar emojis para padrão
async function handleResetEmojis(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const guildId = interaction.guild!.id;
    // Resetar emojis removendo configurações personalizadas
    const config = storage.getServerConfig(guildId);
    delete config.emojis;
    const success = storage.saveServerConfig(guildId, config);

    if (success) {
        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🔄 **EMOJIS RESETADOS**")
            .setDescription(
                `✅ **Todos os emojis foram resetados para o padrão!**\n\n` +
                `🎯 Todos os painéis agora usam os emojis originais\n` +
                `💾 Configurações salvas automaticamente\n\n` +
                `💡 Use \`/config-manager tipo:emojis acao:edit\` para personalizar novamente`
            )
            .setFooter({ text: "Eixo Bot • Config Manager • Reset Concluído" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply({
            content: "❌ **Erro!** Não foi possível resetar os emojis. Tente novamente."
        });
    }
}

// Editar textos dos painéis
async function handleEditTexts(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor("#9c88ff")
        .setTitle("📝 **EDITAR TEXTOS DOS PAINÉIS**")
        .setDescription(
            `> **Selecione qual painel você deseja personalizar:**\n\n` +
            `🎛️ **Painel Principal** - Texto de boas-vindas e descrição\n` +
            `🛡️ **Painel Moderação** - Textos dos comandos de moderação\n` +
            `🤖 **Painel Automação** - Descrições dos sistemas automáticos\n` +
            `📋 **Painel Logs** - Textos de configuração e logs\n` +
            `🎭 **Painel Diversão** - Descrições dos comandos de diversão\n` +
            `🔧 **Painel Utilidades** - Textos das ferramentas úteis\n\n` +
            `💡 **Selecione uma opção abaixo para continuar**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Personalização de Textos" })
        .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("config_text_select")
        .setPlaceholder("Selecione o painel para editar")
        .addOptions([
            new StringSelectMenuOptionBuilder()
                .setLabel("🎛️ Painel Principal")
                .setDescription("Editar texto de boas-vindas e descrição principal")
                .setValue("main_panel"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🛡️ Painel Moderação")
                .setDescription("Personalizar textos dos comandos de moderação")
                .setValue("moderation_panel"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🤖 Painel Automação")
                .setDescription("Editar descrições dos sistemas automáticos")
                .setValue("automation_panel"),
            new StringSelectMenuOptionBuilder()
                .setLabel("📋 Painel Logs & Config")
                .setDescription("Personalizar textos de configuração")
                .setValue("logs_panel"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🎭 Painel Diversão")
                .setDescription("Editar descrições dos comandos de diversão")
                .setValue("fun_panel"),
            new StringSelectMenuOptionBuilder()
                .setLabel("🔧 Painel Utilidades")
                .setDescription("Personalizar textos das ferramentas")
                .setValue("utilities_panel")
        ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
}

// Personalizar cores
async function handleCustomizeColors(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("🎨 **PERSONALIZAR CORES DOS PAINÉIS**")
        .setDescription(
            `> **Personalize as cores dos embeds de cada painel:**\n\n` +
            `🎛️ **Painel Principal:** Cinza Escuro (#2f3136)\n` +
            `🛡️ **Moderação:** Vermelho (#ff4757)\n` +
            `🤖 **Automação:** Verde (#2ed573)\n` +
            `📋 **Logs & Config:** Roxo (#5352ed)\n` +
            `🎭 **Diversão:** Rosa (#ff6b81)\n` +
            `🔧 **Utilidades:** Laranja (#ffa502)\n` +
            `📢 **Avisos:** Ciano (#00d2d3)\n` +
            `🎵 **Voz:** Azul Discord (#7289da)\n` +
            `💥 **Nuke:** Vermelho Intenso (#ff0000)\n` +
            `🎨 **Config Manager:** Roxo Claro (#9c88ff)\n\n` +
            `🔧 **Função em desenvolvimento!**\n` +
            `Em breve você poderá personalizar as cores de cada painel individualmente.`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Personalização de Cores" })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

// Ver todas as configurações
async function handleViewConfig(interaction: any) {
    await interaction.deferReply({ flags: 64 });
    
    const guildId = interaction.guild!.id;
    const customEmojis = storage.getServerEmojis(guildId);
    
    // Pegar configurações personalizadas (se existirem)
    const customTexts = {}; // TODO: Implementar sistema de textos personalizados
    const customColors = {}; // TODO: Implementar sistema de cores personalizadas

    const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📋 **CONFIGURAÇÕES ATUAIS DO BOT**")
        .setDescription(
            `> **Visão geral das personalizações aplicadas:**\n\n` +
            `🎭 **Emojis Personalizados:** ${customEmojis && Object.keys(customEmojis).length > 0 ? "✅ Configurados" : "❌ Usando padrão"}\n` +
            `📝 **Textos Personalizados:** ${Object.keys(customTexts).length > 0 ? "✅ Configurados" : "❌ Usando padrão"}\n` +
            `🎨 **Cores Personalizadas:** ${Object.keys(customColors).length > 0 ? "✅ Configuradas" : "❌ Usando padrão"}\n\n` +
            `**📊 Estatísticas:**\n` +
            `• **Emojis customizados:** ${customEmojis ? Object.keys(customEmojis).length : 0}\n` +
            `• **Painéis personalizados:** ${Object.keys(customTexts).length}\n` +
            `• **Cores alteradas:** ${Object.keys(customColors).length}\n\n` +
            `🔧 **Para fazer alterações:**\n` +
            `• Use \`/config-manager tipo:emojis\` para emojis\n` +
            `• Use \`/config-manager tipo:textos\` para textos\n` +
            `• Use \`/config-manager tipo:cores\` para cores\n` +
            `• Use \`/config-manager tipo:reset\` para resetar tudo`
        )
        .addFields(
            {
                name: "🎛️ **Status dos Painéis**",
                value: 
                    `🛡️ Moderação: Padrão\n` +
                    `🤖 Automação: Padrão\n` +
                    `📋 Logs: Padrão\n` +
                    `🎭 Diversão: Padrão\n` +
                    `🔧 Utilidades: Padrão`,
                inline: true
            },
            {
                name: "🎨 **Cores Aplicadas**",
                value:
                    `Principal: Padrão\n` +
                    `Moderação: Padrão\n` +
                    `Automação: Padrão\n` +
                    `Diversão: Padrão\n` +
                    `Utilidades: Padrão`,
                inline: true
            }
        )
        .setFooter({ 
            text: `Servidor: ${interaction.guild!.name} • Eixo Bot • Config Manager`, 
            iconURL: interaction.client.user?.displayAvatarURL() 
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

// Resetar todas as configurações
async function handleResetAll(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
        .setColor("#ff9f43")
        .setTitle("🔄 **RESETAR TODAS AS CONFIGURAÇÕES**")
        .setDescription(
            `⚠️ **ATENÇÃO: Esta ação irá resetar TODAS as personalizações!**\n\n` +
            `**O que será resetado:**\n` +
            `🎭 Todos os emojis personalizados\n` +
            `📝 Todos os textos personalizados\n` +
            `🎨 Todas as cores personalizadas\n` +
            `⚙️ Configurações de personalização\n\n` +
            `**O que NÃO será afetado:**\n` +
            `✅ Configurações de automação (boas-vindas, auto-role, etc.)\n` +
            `✅ Configurações de logs\n` +
            `✅ Configurações de moderação\n` +
            `✅ Dados dos usuários\n\n` +
            `🔧 **Use os botões abaixo para confirmar ou cancelar**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Reset de Configurações" })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("config_reset_confirm")
                .setLabel("🔄 Confirmar Reset")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("config_reset_cancel")
                .setLabel("❌ Cancelar")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [embed],
        components: [row]
    });
}

// Função para obter emojis do servidor (compatibilidade)
export function getServerEmojis(guildId: string) {
    const customEmojis = storage.getServerEmojis(guildId);
    return customEmojis ? { ...defaultEmojis, ...customEmojis } : defaultEmojis;
}

// Função para atualizar emoji individual (compatibilidade)
export function updateServerEmoji(guildId: string, emojiKey: string, emojiValue: string): boolean {
    const customEmojis = storage.getServerEmojis(guildId) || {};
    customEmojis[emojiKey] = emojiValue;
    return storage.updateServerEmojis(guildId, customEmojis);
}

// defaultEmojis já foi exportado acima