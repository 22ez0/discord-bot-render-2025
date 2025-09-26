import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField, ChannelType } from "discord.js";
// Comando /ping
createCommand({
    name: "ping",
    description: "Verificar a latência do bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const start = Date.now();
        await interaction.reply({
            content: "🏓 Calculando ping...",
            ephemeral: true
        });
        const ping = Date.now() - start;
        const websocketPing = interaction.client.ws.ping;
        const embed = new EmbedBuilder()
            .setColor("#2ed573")
            .setTitle("🏓 **PING** | Latência do Bot")
            .setDescription(`📡 **Latência da API:** \`${ping}ms\`\n` +
            `🌐 **Latência WebSocket:** \`${websocketPing}ms\`\n\n` +
            `**Status:** ${ping < 100 ? "🟢 Ótimo" : ping < 200 ? "🟡 Bom" : "🔴 Alto"}`)
            .setTimestamp();
        await interaction.editReply({
            content: "",
            embeds: [embed]
        });
    }
});
// Comando /serverinfo
createCommand({
    name: "serverinfo",
    description: "Informações detalhadas do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: "❌ Este comando só pode ser usado em servidores!",
                ephemeral: true
            });
            return;
        }
        await guild.members.fetch().catch(() => null);
        await guild.channels.fetch().catch(() => null);
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
        const totalMembers = guild.memberCount;
        const botMembers = guild.members.cache.filter(member => member.user.bot).size;
        const humanMembers = totalMembers - botMembers;
        const verificationLevels = {
            0: "Nenhuma",
            1: "Baixa",
            2: "Média",
            3: "Alta",
            4: "Muito Alta"
        };
        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(`🖥️ **${guild.name}**`)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields({
            name: "📊 **Estatísticas**",
            value: `**Membros:** ${totalMembers.toLocaleString()}\n` +
                `**Humanos:** ${humanMembers.toLocaleString()}\n` +
                `**Bots:** ${botMembers.toLocaleString()}\n` +
                `**Cargos:** ${guild.roles.cache.size}\n` +
                `**Emojis:** ${guild.emojis.cache.size}`,
            inline: true
        }, {
            name: "📝 **Canais**",
            value: `**Total:** ${guild.channels.cache.size}\n` +
                `**Texto:** ${textChannels}\n` +
                `**Voz:** ${voiceChannels}\n` +
                `**Categorias:** ${categories}`,
            inline: true
        }, {
            name: "🛡️ **Segurança**",
            value: `**Verificação:** ${verificationLevels[guild.verificationLevel]}\n` +
                `**Criado em:** <t:${Math.floor(guild.createdTimestamp / 1000)}:D>\n` +
                `**ID:** \`${guild.id}\``,
            inline: true
        })
            .setFooter({
            text: `Servidor • ${guild.name}`,
            iconURL: guild.iconURL() || undefined
        })
            .setTimestamp();
        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }
        await interaction.reply({ embeds: [embed] });
    }
});
// Comando /userinfo
createCommand({
    name: "userinfo",
    description: "Informações sobre um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário para ver as informações",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    async run(interaction) {
        const targetUser = interaction.options.getUser("usuário") || interaction.user;
        const member = interaction.guild?.members.cache.get(targetUser.id);
        const userFlags = targetUser.flags?.toArray() || [];
        const flagEmojis = {
            Staff: "👨‍💼",
            Partner: "🤝",
            Hypesquad: "🎉",
            BugHunterLevel1: "🐛",
            BugHunterLevel2: "🐞",
            HypeSquadOnlineHouse1: "🏠",
            HypeSquadOnlineHouse2: "🏠",
            HypeSquadOnlineHouse3: "🏠",
            PremiumEarlySupporter: "⭐",
            TeamPseudoUser: "👥",
            VerifiedBot: "✅",
            VerifiedDeveloper: "🔧"
        };
        const badges = userFlags.map(flag => `${flagEmojis[flag] || "🏷️"} ${flag}`).join("\n") || "Nenhuma";
        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || "#5865F2")
            .setTitle(`👤 **${targetUser.username}**`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
            .addFields({
            name: "📋 **Informações Gerais**",
            value: `**Nome:** ${targetUser.username}\n` +
                `**ID:** \`${targetUser.id}\`\n` +
                `**Conta criada:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>\n` +
                `**Bot:** ${targetUser.bot ? "Sim" : "Não"}`,
            inline: true
        }, {
            name: "🏷️ **Distintivos**",
            value: badges,
            inline: true
        })
            .setTimestamp();
        if (member) {
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild?.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10);
            embed.addFields({
                name: "🎭 **Informações do Servidor**",
                value: `**Apelido:** ${member.nickname || "Nenhum"}\n` +
                    `**Entrou em:** <t:${Math.floor((member.joinedTimestamp || 0) / 1000)}:D>\n` +
                    `**Cargo mais alto:** ${member.roles.highest}\n` +
                    `**Cargos (${member.roles.cache.size - 1}):** ${roles.length > 0 ? roles.join(", ") : "Nenhum"}${roles.length === 10 ? "..." : ""}`,
                inline: false
            });
        }
        await interaction.reply({ embeds: [embed] });
    }
});
// Comando /invite
createCommand({
    name: "invite",
    description: "Gerar convite do servidor",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Canal para o convite (padrão: canal atual)",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
            required: false
        },
        {
            name: "duração",
            description: "Duração do convite em minutos (0 = permanente)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 0,
            maxValue: 10080 // 7 dias em minutos
        },
        {
            name: "usos",
            description: "Número máximo de usos (0 = ilimitado)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 0,
            maxValue: 100
        }
    ],
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.CreateInstantInvite)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa da permissão **Criar Convite Instantâneo** para usar este comando.",
                ephemeral: true
            });
            return;
        }
        const channel = interaction.options.getChannel("canal") || interaction.channel;
        const duration = interaction.options.getInteger("duração") || 0;
        const maxUses = interaction.options.getInteger("usos") || 0;
        if (!channel || !("guild" in channel)) {
            await interaction.reply({
                content: "❌ **Erro!** Canal inválido para criar convite.",
                ephemeral: true
            });
            return;
        }
        try {
            if (!("createInvite" in channel)) {
                await interaction.reply({
                    content: "❌ **Erro!** Este tipo de canal não suporta convites.",
                    ephemeral: true
                });
                return;
            }
            const invite = await channel.createInvite({
                maxAge: duration * 60, // Converter minutos para segundos
                maxUses: maxUses,
                unique: true,
                reason: `Convite criado por ${interaction.user.tag}`
            });
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("📨 **CONVITE CRIADO**")
                .setDescription(`**Link:** ${invite.url}\n\n` +
                `**Canal:** ${channel}\n` +
                `**Duração:** ${duration === 0 ? "Permanente" : `${duration} minutos`}\n` +
                `**Usos máximos:** ${maxUses === 0 ? "Ilimitado" : maxUses}\n` +
                `**Criado por:** ${interaction.user}`)
                .setFooter({ text: `Código: ${invite.code}` })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Erro ao criar convite:", error);
            await interaction.reply({
                content: "❌ **Erro!** Não foi possível criar o convite. Verifique minhas permissões.",
                ephemeral: true
            });
        }
    }
});
