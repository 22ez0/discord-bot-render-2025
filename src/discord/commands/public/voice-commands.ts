import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, ChannelType, PermissionsBitField } from "discord.js";
import { joinVoiceChannelById, leaveVoiceChannel, isConnectedToVoice } from "./VoiceHandler.js";

// Comando /entrar para conectar o bot a um canal de voz
createCommand({
    name: "entrar",
    description: "🎵 Conectar o bot a um canal de voz específico",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Canal de voz onde o bot deve se conectar",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildVoice],
            required: true
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Gerenciar Canais** para usar este comando.",
                flags: 64
            });
            return;
        }

        const voiceChannel = interaction.options.getChannel("canal", true);
        const guildId = interaction.guild!.id;

        // Verificar se é um canal de voz
        if (voiceChannel.type !== ChannelType.GuildVoice) {
            await interaction.reply({
                content: "❌ **Erro!** O canal especificado deve ser um canal de voz.",
                flags: 64
            });
            return;
        }

        // Verificar se já está conectado
        if (isConnectedToVoice(guildId)) {
            await interaction.reply({
                content: "🎵 **O bot já está conectado em um canal de voz neste servidor!**\n\nUse `/sair` primeiro para desconectar.",
                flags: 64
            });
            return;
        }

        // Verificar permissões do bot no canal de voz
        const botPermissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!botPermissions?.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
            await interaction.reply({
                content: "❌ **Erro de permissão!** Não tenho permissão para conectar ou falar no canal de voz especificado.\n\nVerifique se o bot tem as permissões **Conectar** e **Falar** no canal.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });

        try {
            const success = await joinVoiceChannelById(guildId, voiceChannel.id, interaction.client);
            
            if (success) {
                await interaction.editReply({
                    content: `✅ **Conectado com sucesso!**\n\n🎵 O bot agora está conectado ao canal <#${voiceChannel.id}>.\n\n💡 Use \`/sair\` para desconectar quando necessário.`
                });
            } else {
                await interaction.editReply({
                    content: "❌ **Erro ao conectar!**\n\nNão foi possível se conectar ao canal de voz. Verifique se:\n• O bot tem permissões para entrar no canal\n• O canal é válido e acessível\n• Não há limite de usuários atingido"
                });
            }
        } catch (error) {
            console.error("Erro ao conectar no canal de voz:", error);
            await interaction.editReply({
                content: "❌ **Erro interno!** Ocorreu um problema ao tentar conectar no canal de voz."
            });
        }
    }
});

// Comando /sair para desconectar o bot do canal de voz
createCommand({
    name: "sair",
    description: "🔇 Desconectar o bot do canal de voz atual",
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

        const guildId = interaction.guild!.id;

        // Verificar se está conectado
        if (!isConnectedToVoice(guildId)) {
            await interaction.reply({
                content: "❌ **O bot não está conectado em nenhum canal de voz neste servidor.**\n\nUse `/entrar` para conectar a um canal primeiro.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });

        try {
            const success = leaveVoiceChannel(guildId);
            
            if (success) {
                await interaction.editReply({
                    content: "✅ **Desconectado com sucesso!**\n\n🔇 O bot foi desconectado do canal de voz.\n\n💡 Use `/entrar` para conectar novamente quando necessário."
                });
            } else {
                await interaction.editReply({
                    content: "❌ **Erro ao desconectar!** Ocorreu um problema interno ao tentar desconectar do canal de voz."
                });
            }
        } catch (error) {
            console.error("Erro ao desconectar do canal de voz:", error);
            await interaction.editReply({
                content: "❌ **Erro interno!** Ocorreu um problema ao tentar desconectar do canal de voz."
            });
        }
    }
});