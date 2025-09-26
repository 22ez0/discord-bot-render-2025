import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ChannelType, PermissionsBitField } from "discord.js";

// Lista de cores disponíveis para o embed
const colorOptions = [
    { name: "🔴 Vermelho", value: "RED" },
    { name: "🟠 Laranja", value: "ORANGE" },
    { name: "🟡 Amarelo", value: "YELLOW" },
    { name: "🟢 Verde", value: "GREEN" },
    { name: "🔵 Azul", value: "BLUE" },
    { name: "🟣 Roxo", value: "PURPLE" },
    { name: "🟤 Marrom", value: "BROWN" },
    { name: "⚫ Preto", value: "BLACK" },
    { name: "⚪ Branco", value: "WHITE" },
    { name: "🩷 Rosa", value: "PINK" },
    { name: "🩵 Azul Claro", value: "LIGHT_BLUE" },
    { name: "💚 Verde Claro", value: "LIGHT_GREEN" }
];

// Mapeamento de cores para valores hexadecimais
const colorMap: { [key: string]: number } = {
    "RED": 0xff0000,
    "ORANGE": 0xff8c00,
    "YELLOW": 0xffff00,
    "GREEN": 0x00ff00,
    "BLUE": 0x0000ff,
    "PURPLE": 0x800080,
    "BROWN": 0xa0522d,
    "BLACK": 0x000000,
    "WHITE": 0xffffff,
    "PINK": 0xffc0cb,
    "LIGHT_BLUE": 0x87ceeb,
    "LIGHT_GREEN": 0x90ee90
};

createCommand({
    name: "aviso",
    description: "📢 Enviar embed personalizado para um canal específico",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Canal onde o embed será enviado",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
            required: true
        },
        {
            name: "titulo",
            description: "Título do embed",
            type: ApplicationCommandOptionType.String,
            required: true,
            maxLength: 256
        },
        {
            name: "descricao",
            description: "Descrição/conteúdo principal do embed",
            type: ApplicationCommandOptionType.String,
            required: true,
            maxLength: 4000
        },
        {
            name: "cor",
            description: "Cor do embed",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: colorOptions
        },
        {
            name: "imagem",
            description: "URL da imagem para o embed (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "thumbnail",
            description: "URL da thumbnail para o embed (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "footer",
            description: "Texto do rodapé (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 2048
        },
        {
            name: "ping",
            description: "Mencionar @everyone ou @here (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "@everyone", value: "everyone" },
                { name: "@here", value: "here" },
                { name: "Sem menção", value: "none" }
            ]
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Mensagens** para usar este comando.",
                flags: 64
            });
            return;
        }

        const targetChannel = interaction.options.getChannel("canal", true);
        const titulo = interaction.options.getString("titulo", true);
        const descricao = interaction.options.getString("descricao", true);
        const cor = interaction.options.getString("cor") || "BLUE";
        const imagem = interaction.options.getString("imagem");
        const thumbnail = interaction.options.getString("thumbnail");
        const footer = interaction.options.getString("footer");
        const ping = interaction.options.getString("ping") || "none";

        // Verificar se é um canal de texto
        if (targetChannel.type !== ChannelType.GuildText && targetChannel.type !== ChannelType.GuildAnnouncement) {
            await interaction.reply({
                content: "❌ **Erro!** O canal deve ser um canal de texto ou de anúncios.",
                flags: 64
            });
            return;
        }

        // Verificar permissões do bot no canal de destino
        const botPermissions = targetChannel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            await interaction.reply({
                content: "❌ **Erro de permissão!** Não tenho permissão para enviar mensagens ou embeds no canal especificado.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });

        try {
            // Validar URLs de imagem (básico)
            if (imagem && !isValidImageUrl(imagem)) {
                await interaction.editReply({
                    content: "❌ **URL de imagem inválida!** Certifique-se de que a URL da imagem é válida e termina com uma extensão de imagem (.png, .jpg, .jpeg, .gif, .webp)."
                });
                return;
            }

            if (thumbnail && !isValidImageUrl(thumbnail)) {
                await interaction.editReply({
                    content: "❌ **URL de thumbnail inválida!** Certifique-se de que a URL da thumbnail é válida e termina com uma extensão de imagem (.png, .jpg, .jpeg, .gif, .webp)."
                });
                return;
            }

            // Criar embed
            const embed = new EmbedBuilder()
                .setTitle(titulo)
                .setDescription(descricao)
                .setColor(colorMap[cor] || 0x0000ff)
                .setTimestamp();

            // Adicionar elementos opcionais
            if (imagem) {
                embed.setImage(imagem);
            }

            if (thumbnail) {
                embed.setThumbnail(thumbnail);
            }

            if (footer) {
                embed.setFooter({ 
                    text: footer,
                    iconURL: interaction.client.user?.displayAvatarURL()
                });
            } else {
                embed.setFooter({ 
                    text: `Enviado por ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            }

            // Preparar conteúdo com ping e configurar allowedMentions
            let content = "";
            let allowedMentions;
            
            if (ping === "everyone") {
                content = "@everyone";
                allowedMentions = { parse: ["everyone" as const] };
            } else if (ping === "here") {
                content = "@here";
                allowedMentions = { parse: ["roles" as const, "users" as const] }; // Permite @here mas não @everyone
            } else {
                allowedMentions = { parse: [] }; // Nenhuma menção permitida
            }

            // Enviar embed para o canal
            await targetChannel.send({
                content: content || undefined,
                embeds: [embed],
                allowedMentions: allowedMentions
            });

            // Confirmar sucesso
            await interaction.editReply({
                content: `✅ **Embed enviado com sucesso!**\n\n📍 **Canal:** ${targetChannel}\n🎨 **Cor:** ${colorOptions.find(c => c.value === cor)?.name || "Azul"}\n📝 **Título:** ${titulo}\n\n💡 O embed foi enviado no canal especificado.`
            });

        } catch (error) {
            console.error("Erro ao enviar embed:", error);
            await interaction.editReply({
                content: "❌ **Erro ao enviar embed!** Verifique se:\n• As URLs das imagens são válidas\n• O bot tem permissões no canal\n• O conteúdo não excede os limites do Discord"
            });
        }
    }
});

// Função para validar URLs de imagem
function isValidImageUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const pathname = parsedUrl.pathname.toLowerCase();
        return validExtensions.some(ext => pathname.endsWith(ext)) || 
               pathname.includes('cdn.discordapp.com') ||
               pathname.includes('media.discordapp.net') ||
               pathname.includes('imgur.com');
    } catch {
        return false;
    }
}