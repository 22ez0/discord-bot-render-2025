import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";
// Comando /ban
createCommand({
    name: "ban",
    description: "Banir um usuário do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário a ser banido",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "motivo",
            description: "Motivo do banimento",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "dias",
            description: "Dias de mensagens para deletar (0-7)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 0,
            maxValue: 7
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Banir Membros** para usar este comando.",
                flags: 64
            });
            return;
        }
        const target = interaction.options.getUser("usuário", true);
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        const deleteMessageDays = interaction.options.getInteger("dias") || 0;
        try {
            // Verificar se o usuário pode ser banido
            const member = interaction.guild?.members.cache.get(target.id);
            if (member && !member.bannable) {
                await interaction.reply({
                    content: "❌ **Erro!** Não posso banir este usuário. Ele pode ter permissões superiores às minhas.",
                    flags: 64
                });
                return;
            }
            // Banir usuário
            await interaction.guild?.members.ban(target, {
                reason: `${reason} | Banido por: ${interaction.user.tag}`,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });
            const embed = new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("🔨 **USUÁRIO BANIDO**")
                .setDescription(`**Usuário:** ${target.tag} \`(${target.id})\`\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}\n` +
                `**Mensagens deletadas:** ${deleteMessageDays} dia(s)`)
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao banir usuário:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível banir o usuário. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /kick
createCommand({
    name: "kick",
    description: "Expulsar um usuário do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário a ser expulso",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "motivo",
            description: "Motivo da expulsão",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Expulsar Membros** para usar este comando.",
                flags: 64
            });
            return;
        }
        const target = interaction.options.getUser("usuário", true);
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        try {
            const member = interaction.guild?.members.cache.get(target.id);
            if (!member) {
                await interaction.reply({
                    content: "❌ **Erro!** Usuário não encontrado no servidor.",
                    flags: 64
                });
                return;
            }
            if (!member.kickable) {
                await interaction.reply({
                    content: "❌ **Erro!** Não posso expulsar este usuário. Ele pode ter permissões superiores às minhas.",
                    flags: 64
                });
                return;
            }
            // Expulsar usuário
            await member.kick(`${reason} | Expulso por: ${interaction.user.tag}`);
            const embed = new EmbedBuilder()
                .setColor("#ff9f43")
                .setTitle("👢 **USUÁRIO EXPULSO**")
                .setDescription(`**Usuário:** ${target.tag} \`(${target.id})\`\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}`)
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao expulsar usuário:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível expulsar o usuário. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /timeout
createCommand({
    name: "timeout",
    description: "Silenciar temporariamente um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário a ser silenciado",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "duração",
            description: "Duração do timeout em minutos (máx: 40320 = 28 dias)",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxValue: 40320
        },
        {
            name: "motivo",
            description: "Motivo do timeout",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Moderar Membros** para usar este comando.",
                flags: 64
            });
            return;
        }
        const target = interaction.options.getUser("usuário", true);
        const duration = interaction.options.getInteger("duração", true);
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        try {
            const member = interaction.guild?.members.cache.get(target.id);
            if (!member) {
                await interaction.reply({
                    content: "❌ **Erro!** Usuário não encontrado no servidor.",
                    flags: 64
                });
                return;
            }
            if (!member.moderatable) {
                await interaction.reply({
                    content: "❌ **Erro!** Não posso silenciar este usuário. Ele pode ter permissões superiores às minhas.",
                    flags: 64
                });
                return;
            }
            // Calcular tempo de timeout
            const timeoutDuration = duration * 60 * 1000; // converter minutos para milissegundos
            // Aplicar timeout
            await member.timeout(timeoutDuration, `${reason} | Timeout aplicado por: ${interaction.user.tag}`);
            // Calcular tempo de expiração
            const expiresAt = new Date(Date.now() + timeoutDuration);
            const embed = new EmbedBuilder()
                .setColor("#ffa502")
                .setTitle("🔇 **USUÁRIO SILENCIADO**")
                .setDescription(`**Usuário:** ${target.tag} \`(${target.id})\`\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Duração:** ${duration} minuto(s)\n` +
                `**Expira em:** <t:${Math.floor(expiresAt.getTime() / 1000)}:F>\n` +
                `**Motivo:** ${reason}`)
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao aplicar timeout:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível silenciar o usuário. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /clear
createCommand({
    name: "clear",
    description: "Limpar mensagens do canal",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "quantidade",
            description: "Quantidade de mensagens para deletar (1-100)",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxValue: 100
        },
        {
            name: "usuário",
            description: "Deletar apenas mensagens de um usuário específico",
            type: ApplicationCommandOptionType.User,
            required: false
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
        const amount = interaction.options.getInteger("quantidade", true);
        const targetUser = interaction.options.getUser("usuário");
        try {
            await interaction.deferReply({ flags: 64 });
            // Buscar mensagens
            const messages = await interaction.channel?.messages.fetch({ limit: amount });
            if (!messages || messages.size === 0) {
                await interaction.editReply("❌ **Erro!** Não encontrei mensagens para deletar.");
                return;
            }
            let messagesToDelete = Array.from(messages.values());
            // Filtrar por usuário se especificado
            if (targetUser) {
                messagesToDelete = messagesToDelete.filter(msg => msg.author.id === targetUser.id);
            }
            // Filtrar mensagens antigas (Discord não permite deletar mensagens com mais de 14 dias em bulk)
            const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
            messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
            if (messagesToDelete.length === 0) {
                await interaction.editReply("❌ **Erro!** Não encontrei mensagens válidas para deletar (mensagens devem ter menos de 14 dias).");
                return;
            }
            // Deletar mensagens
            if (messagesToDelete.length === 1) {
                await messagesToDelete[0].delete();
            }
            else {
                await interaction.channel?.bulkDelete(messagesToDelete);
            }
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("🧹 **MENSAGENS LIMPAS**")
                .setDescription(`**Quantidade:** ${messagesToDelete.length} mensagem(s)\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Canal:** ${interaction.channel?.toString()}\n` +
                (targetUser ? `**Usuário filtrado:** ${targetUser.tag}` : ""))
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao limpar mensagens:", error);
            await interaction.editReply("❌ **Erro!** Não foi possível limpar as mensagens. Verifique minhas permissões.");
        }
    }
});
// Comando /warn
createCommand({
    name: "warn",
    description: "Advertir um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário a ser advertido",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "motivo",
            description: "Motivo da advertência",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Moderar Membros** para usar este comando.",
                flags: 64
            });
            return;
        }
        const target = interaction.options.getUser("usuário", true);
        const reason = interaction.options.getString("motivo", true);
        try {
            const member = interaction.guild?.members.cache.get(target.id);
            if (!member) {
                await interaction.reply({
                    content: "❌ **Erro!** Usuário não encontrado no servidor.",
                    flags: 64
                });
                return;
            }
            // Criar embed da advertência
            const warnEmbed = new EmbedBuilder()
                .setColor("#ffa502")
                .setTitle("⚠️ **ADVERTÊNCIA EMITIDA**")
                .setDescription(`**Usuário:** ${target.tag} \`(${target.id})\`\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}\n` +
                `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();
            // Tentar enviar DM para o usuário
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor("#ffa502")
                    .setTitle("⚠️ **VOCÊ RECEBEU UMA ADVERTÊNCIA**")
                    .setDescription(`**Servidor:** ${interaction.guild?.name}\n` +
                    `**Moderador:** ${interaction.user.tag}\n` +
                    `**Motivo:** ${reason}\n\n` +
                    `Por favor, leia as regras do servidor e evite repetir o comportamento.`)
                    .setTimestamp();
                await target.send({ embeds: [dmEmbed] });
                warnEmbed.setFooter({ text: "✅ Usuário notificado via DM" });
            }
            catch {
                warnEmbed.setFooter({ text: "❌ Não foi possível enviar DM ao usuário" });
            }
            await interaction.reply({ embeds: [warnEmbed] });
        }
        catch (error) {
            console.error("Erro ao advertir usuário:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível advertir o usuário.",
                flags: 64
            });
        }
    }
});
// Comando /unban
createCommand({
    name: "unban",
    description: "Desbanir um usuário do servidor",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.BanMembers],
    options: [
        {
            name: "userid",
            description: "ID do usuário a ser desbanido",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "motivo",
            description: "Motivo do desbanimento",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        // Verificar permissões
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Banir Membros** para usar este comando.",
                flags: 64
            });
            return;
        }
        const userId = interaction.options.getString("userid", true);
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        try {
            // Verificar se o usuário está banido
            const bans = await interaction.guild?.bans.fetch();
            const bannedUser = bans?.find(ban => ban.user.id === userId);
            if (!bannedUser) {
                await interaction.reply({
                    content: "❌ **Erro!** Este usuário não está banido ou o ID é inválido.",
                    flags: 64
                });
                return;
            }
            // Desbanir usuário
            await interaction.guild?.members.unban(userId, `${reason} | Desbanido por: ${interaction.user.tag}`);
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("✅ **USUÁRIO DESBANIDO**")
                .setDescription(`**Usuário:** ${bannedUser.user.tag} \`(${bannedUser.user.id})\`\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}`)
                .setThumbnail(bannedUser.user.displayAvatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao desbanir usuário:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível desbanir o usuário. Verifique se o ID está correto.",
                flags: 64
            });
        }
    }
});
// Comando /slowmode
createCommand({
    name: "slowmode",
    description: "Definir modo lento para o canal",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.ManageChannels],
    options: [
        {
            name: "duração",
            description: "Duração do slowmode em segundos (0 para desativar, máx: 21600)",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 0,
            maxValue: 21600
        },
        {
            name: "canal",
            description: "Canal para aplicar slowmode (atual se não especificado)",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [0, 5],
            required: false
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
        const duration = interaction.options.getInteger("duração", true);
        const targetChannel = interaction.options.getChannel("canal") || interaction.channel;
        if (!targetChannel?.isTextBased()) {
            await interaction.reply({
                content: "❌ **Erro!** Este comando só funciona em canais de texto.",
                flags: 64
            });
            return;
        }
        try {
            await targetChannel.setRateLimitPerUser(duration, `Slowmode definido por: ${interaction.user.tag}`);
            const embed = new EmbedBuilder()
                .setColor(duration === 0 ? "#2ed573" : "#ffa502")
                .setTitle(duration === 0 ? "⚡ **SLOWMODE DESATIVADO**" : "🐌 **SLOWMODE ATIVADO**")
                .setDescription(`**Canal:** ${targetChannel}\n` +
                `**Duração:** ${duration === 0 ? "Desativado" : `${duration} segundos`}\n` +
                `**Moderador:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao definir slowmode:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível definir o slowmode. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /lockdown
createCommand({
    name: "lockdown",
    description: "Trancar canal impedindo que membros enviem mensagens e criem threads",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.ManageChannels],
    options: [
        {
            name: "canal",
            description: "Canal para trancar (atual se não especificado)",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [0, 5],
            required: false
        },
        {
            name: "motivo",
            description: "Motivo do lockdown",
            type: ApplicationCommandOptionType.String,
            required: false
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
        const targetChannel = interaction.options.getChannel("canal") || interaction.channel;
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        if (!targetChannel?.isTextBased() || targetChannel.isThread()) {
            await interaction.reply({
                content: "❌ **Erro!** Este comando só funciona em canais de texto (não threads).",
                flags: 64
            });
            return;
        }
        try {
            // Remover todas as permissões de comunicação do @everyone
            await targetChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                SendMessagesInThreads: false
            }, { reason: `Lockdown por: ${interaction.user.tag} - ${reason}` });
            const embed = new EmbedBuilder()
                .setColor("#ff4757")
                .setTitle("🔒 **CANAL TRANCADO**")
                .setDescription(`**Canal:** ${targetChannel}\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}\n\n` +
                `**Membros não podem mais enviar mensagens neste canal.**`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao trancar canal:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível trancar o canal. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /unlock
createCommand({
    name: "unlock",
    description: "Destrancar canal permitindo que membros enviem mensagens e criem threads",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.ManageChannels],
    options: [
        {
            name: "canal",
            description: "Canal para destrancar (atual se não especificado)",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [0, 5],
            required: false
        },
        {
            name: "motivo",
            description: "Motivo do unlock",
            type: ApplicationCommandOptionType.String,
            required: false
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
        const targetChannel = interaction.options.getChannel("canal") || interaction.channel;
        const reason = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        if (!targetChannel?.isTextBased() || targetChannel.isThread()) {
            await interaction.reply({
                content: "❌ **Erro!** Este comando só funciona em canais de texto (não threads).",
                flags: 64
            });
            return;
        }
        try {
            // Restaurar todas as permissões de comunicação do @everyone
            await targetChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null,
                CreatePublicThreads: null,
                CreatePrivateThreads: null,
                SendMessagesInThreads: null
            }, { reason: `Unlock por: ${interaction.user.tag} - ${reason}` });
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("🔓 **CANAL DESTRANCADO**")
                .setDescription(`**Canal:** ${targetChannel}\n` +
                `**Moderador:** ${interaction.user.tag}\n` +
                `**Motivo:** ${reason}\n\n` +
                `**Membros podem novamente enviar mensagens neste canal.**`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao destrancar canal:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível destrancar o canal. Verifique minhas permissões.",
                flags: 64
            });
        }
    }
});
// Comando /purgeuser  
createCommand({
    name: "purgeuser",
    description: "Deletar mensagens de um usuário específico (máx. 100 mensagens)",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
    options: [
        {
            name: "usuário",
            description: "Usuário cujas mensagens serão deletadas",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "quantidade",
            description: "Quantidade de mensagens para verificar (padrão: 100, máx: 100)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 1,
            maxValue: 100
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
        const target = interaction.options.getUser("usuário", true);
        const amount = interaction.options.getInteger("quantidade") || 100;
        await interaction.deferReply({ ephemeral: true });
        try {
            // Buscar mensagens
            const messages = await interaction.channel?.messages.fetch({ limit: amount });
            const userMessages = messages?.filter(msg => msg.author.id === target.id &&
                Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
            if (!userMessages || userMessages.size === 0) {
                await interaction.editReply({
                    content: "❌ **Nenhuma mensagem encontrada** do usuário especificado (últimas 14 dias)."
                });
                return;
            }
            // Deletar mensagens
            if (userMessages.size === 1) {
                await userMessages.first()?.delete();
            }
            else {
                await interaction.channel?.bulkDelete(userMessages);
            }
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("🧹 **MENSAGENS DELETADAS**")
                .setDescription(`**${userMessages.size} mensagens** de ${target.tag} foram deletadas.\n` +
                `**Moderador:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao purgar mensagens do usuário:", error);
            await interaction.editReply({
                content: "❌ **Erro!** Não foi possível deletar as mensagens. Algumas podem ter mais de 14 dias."
            });
        }
    }
});
