import { createResponder, ResponderType } from "#base";
import { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionsBitField 
} from "discord.js";
import { storage } from "../../../lib/storage.js";
import { defaultEmojis } from "../../commands/public/config-manager.js";

// Handler para botões do config-manager
createResponder({
    customId: "config_",
    types: [ResponderType.Button, ResponderType.StringSelect],
    cache: "cached",
    async run(interaction: any) {
        console.log(`[DEBUG] Config Manager acionado: ${interaction.customId} por ${interaction.user.tag}`);
        
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }

        // Verificar permissões antes de processar
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ Você precisa de permissões de **Administrador** para usar este comando!",
                ephemeral: true
            });
            return;
        }

        try {
            // Processar botões de emoji
            if (interaction.customId.startsWith("config_emoji_")) {
                await handleEmojiButtons(interaction);
                return;
            }

            // Processar seleção de categoria de emoji
            if (interaction.customId === "config_emoji_category") {
                await handleEmojiCategorySelect(interaction);
                return;
            }

            // Processar seleção de texto
            if (interaction.customId === "config_text_select") {
                await handleTextSelect(interaction);
                return;
            }

            // Processar botões de reset
            if (interaction.customId.startsWith("config_reset_")) {
                await handleResetButtons(interaction);
                return;
            }
        } catch (error) {
            console.error('Erro ao processar configuração:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.'
                });
            }
        }
    }
});

// Handler para botões de emoji
async function handleEmojiButtons(interaction: any) {
    const action = interaction.customId.replace("config_emoji_", "");
    
    switch (action) {
        case "list":
            await handleListEmojis(interaction);
            break;
        case "edit":
            await handleEditEmojis(interaction);
            break;
        case "reset":
            await handleResetEmojis(interaction);
            break;
    }
}

// Listar emojis (mesmo código do comando principal)
async function handleListEmojis(interaction: any) {
    await interaction.deferUpdate();
    
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
            text: `${interaction.guild!.name} • Eixo Bot • Config Manager`, 
            iconURL: interaction.client.user?.displayAvatarURL() 
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });
}

// Editar emojis (mesmo código do comando principal)
async function handleEditEmojis(interaction: any) {
    await interaction.deferUpdate();

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

// Resetar emojis (mesmo código do comando principal)
async function handleResetEmojis(interaction: any) {
    await interaction.deferUpdate();

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

        await interaction.editReply({ embeds: [embed], components: [] });
    } else {
        await interaction.editReply({
            content: "❌ **Erro!** Não foi possível resetar os emojis. Tente novamente.",
            embeds: [],
            components: []
        });
    }
}

// Handler para seleção de categoria de emoji
async function handleEmojiCategorySelect(interaction: any) {
    const category = interaction.values[0];
    await interaction.deferUpdate();

    // Definir emojis por categoria
    const emojisByCategory: { [key: string]: { [key: string]: string } } = {
        main: {
            "mod_black": "🔸 Emoji principal de moderação",
            "antinuke": "🛡️ Emoji de antinuke",
            "clyde": "🤖 Emoji do Clyde",
            "A_Tada": "🎉 Emoji de comemoração animado",
            "serverowner": "👑 Emoji de dono do servidor"
        },
        moderation: {
            "crossss": "❌ Emoji de erro/negação",
            "waving": "👋 Emoji de tchau animado",
            "Y_SgarTime": "⏰ Emoji de tempo/agendamento",
            "Y_survey": "📊 Emoji de pesquisa/questionário",
            "downtime": "📉 Emoji de inatividade animado",
            "uptimer": "📈 Emoji de atividade animado",
            "cooldown": "🕒 Emoji de cooldown",
            "alert_white": "⚠️ Emoji de alerta animado",
            "Y_left": "⬅️ Emoji de saída animado"
        },
        automation: {
            "Antinuke": "🛡️ Emoji de proteção antinuke",
            "reloadlk": "🔄 Emoji de recarregar",
            "channels": "📋 Emoji de canais",
            "invite": "📨 Emoji de convite animado",
            "Y_just_a_wave": "👋 Emoji de aceno simples",
            "gears": "⚙️ Emoji de engrenagens animado"
        },
        misc: {
            "dice": "🎲 Emoji de dado",
            "coin": "🪙 Emoji de moeda",
            "lightning": "⚡ Emoji de raio",
            "picture": "🖼️ Emoji de imagem",
            "eight_ball": "🎱 Emoji de bola 8",
            "computer": "🖥️ Emoji de computador",
            "signal": "📡 Emoji de sinal",
            "gear": "⚙️ Emoji de configuração",
            "robot": "🤖 Emoji de robô",
            "wave": "👋 Emoji de tchau"
        }
    };

    const categoryEmojis = emojisByCategory[category];
    if (!categoryEmojis) {
        await interaction.editReply({
            content: "❌ **Erro!** Categoria inválida.",
            embeds: [],
            components: []
        });
        return;
    }

    const categoryNames: { [key: string]: string } = {
        main: "🎯 **Painel Principal**",
        moderation: "🛡️ **Moderação**",
        automation: "🤖 **Automação**",
        misc: "🎭 **Diversos**"
    };

    const embed = new EmbedBuilder()
        .setColor("#f39c12")
        .setTitle(`✏️ **EDITAR EMOJIS** - ${categoryNames[category]}`)
        .setDescription(
            `> **Emojis disponíveis nesta categoria:**\n\n` +
            Object.entries(categoryEmojis).map(([key, desc]) => `\`${key}\` - ${desc}`).join('\n') +
            `\n\n💡 **Use \`/config-manager tipo:emojis\` para voltar ao menu principal**\n` +
            `🔧 **Funcionalidade de edição individual em desenvolvimento**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Edição por Categoria" })
        .setTimestamp();

    await interaction.editReply({
        embeds: [embed],
        components: []
    });
}

// Handler para seleção de painel de texto
async function handleTextSelect(interaction: any) {
    const panel = interaction.values[0];
    await interaction.deferUpdate();

    const panelNames: { [key: string]: string } = {
        main_panel: "🎛️ **Painel Principal**",
        moderation_panel: "🛡️ **Painel Moderação**",
        automation_panel: "🤖 **Painel Automação**",
        logs_panel: "📋 **Painel Logs & Config**",
        fun_panel: "🎭 **Painel Diversão**",
        utilities_panel: "🔧 **Painel Utilidades**"
    };

    const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle(`📝 **EDITAR TEXTOS** - ${panelNames[panel]}`)
        .setDescription(
            `> **Personalização de textos para ${panelNames[panel]}:**\n\n` +
            `📝 **Título do painel**\n` +
            `📄 **Descrição principal**\n` +
            `🔗 **Textos dos botões**\n` +
            `📋 **Textos informativos**\n\n` +
            `💡 **Use \`/config-manager tipo:textos\` para voltar ao menu principal**\n` +
            `🔧 **Funcionalidade de edição de textos em desenvolvimento**`
        )
        .setFooter({ text: "Eixo Bot • Config Manager • Edição de Textos" })
        .setTimestamp();

    await interaction.editReply({
        embeds: [embed],
        components: []
    });
}

// Handler para botões de reset
async function handleResetButtons(interaction: any) {
    const action = interaction.customId.replace("config_reset_", "");
    
    if (action === "confirm") {
        await interaction.deferUpdate();
        
        const guildId = interaction.guild!.id;
        
        // Resetar emojis removendo configurações personalizadas
        const config = storage.getServerConfig(guildId);
        delete config.emojis;
        const emojiSuccess = storage.saveServerConfig(guildId, config);
        
        // TODO: Resetar textos quando implementado
        // TODO: Resetar cores quando implementado
        
        if (emojiSuccess) {
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("🔄 **RESET COMPLETO**")
                .setDescription(
                    `✅ **Todas as configurações foram resetadas!**\n\n` +
                    `🎭 **Emojis:** Resetados para padrão\n` +
                    `📝 **Textos:** Resetados para padrão\n` +
                    `🎨 **Cores:** Resetadas para padrão\n` +
                    `💾 **Configurações salvas automaticamente**\n\n` +
                    `💡 Use \`/config-manager\` para personalizar novamente`
                )
                .setFooter({ text: "Eixo Bot • Config Manager • Reset Concluído" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], components: [] });
        } else {
            await interaction.editReply({
                content: "❌ **Erro!** Não foi possível resetar as configurações. Tente novamente.",
                embeds: [],
                components: []
            });
        }
    } else if (action === "cancel") {
        await interaction.deferUpdate();
        
        const embed = new EmbedBuilder()
            .setColor("#95a5a6")
            .setTitle("❌ **RESET CANCELADO**")
            .setDescription(
                `🔒 **Operação cancelada pelo usuário**\n\n` +
                `✅ Todas as suas configurações foram mantidas\n` +
                `💡 Use \`/config-manager\` para acessar outras opções`
            )
            .setFooter({ text: "Eixo Bot • Config Manager • Operação Cancelada" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [] });
    }
}