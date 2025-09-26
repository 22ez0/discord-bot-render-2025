import { createEvent } from "#base";
import { AuditLogEvent, EmbedBuilder, PermissionsBitField, ChannelType } from "discord.js";
// Função unificada para encontrar canal de logs (usando sistema global)
async function getLogChannel(guildId, client) {
    const logConfig = globalThis.eixoLogConfig;
    if (logConfig?.getLogChannel) {
        return await logConfig.getLogChannel(guildId, client);
    }
    // Fallback básico se não houver configuração
    const guild = client.guilds.cache.get(guildId);
    if (!guild)
        return null;
    const fallbackChannel = guild.channels.cache.find((ch) => ch.type === ChannelType.GuildText &&
        (ch.name.includes('log') || ch.name.includes('audit') || ch.name.includes('moderação')));
    return fallbackChannel || null;
}
// Cores para diferentes tipos de logs
const LOG_COLORS = {
    BAN: "#ff4757",
    KICK: "#ff9f43",
    TIMEOUT: "#ffa502",
    WARN: "#ff6348",
    UNBAN: "#2ed573",
    MEMBER_JOIN: "#70a1ff",
    MEMBER_LEAVE: "#747d8c",
    MESSAGE_DELETE: "#ff6b6b",
    MESSAGE_EDIT: "#4834d4",
    ROLE_UPDATE: "#dda0dd",
    CHANNEL_CREATE: "#26de81",
    CHANNEL_DELETE: "#fc5c65"
};
// Função helper para buscar audit logs com validação (tempo maior e mais entradas)
async function getValidAuditLog(guild, type, targetId, maxAge = 30000) {
    try {
        // Verificar se o bot tem permissão para ver audit logs
        const botMember = guild.members.me;
        if (!botMember?.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return null;
        }
        const auditLogs = await guild.fetchAuditLogs({
            limit: 10,
            type: type
        });
        const validLog = auditLogs.entries.find((entry) => {
            const isRecent = Date.now() - entry.createdTimestamp < maxAge;
            const isTargetMatch = !targetId || entry.target?.id === targetId;
            return isRecent && isTargetMatch;
        });
        return validLog || null;
    }
    catch (error) {
        console.error('Erro ao buscar audit logs:', error);
        return null;
    }
}
// Log de banimentos
createEvent({
    name: "Moderation Log - Ban Added",
    event: "guildBanAdd",
    once: false,
    async run(ban) {
        try {
            const logChannel = await getLogChannel(ban.guild.id, ban.guild.client);
            if (!logChannel)
                return;
            // Buscar informações de auditoria com validação
            const banLog = await getValidAuditLog(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
            const executor = banLog?.executor;
            const reason = banLog?.reason || "Nenhum motivo fornecido";
            const embed = new EmbedBuilder()
                .setColor(LOG_COLORS.BAN)
                .setTitle("🔨 **USUÁRIO BANIDO**")
                .setDescription(`**Usuário:** ${ban.user.tag} \`(${ban.user.id})\`\n` +
                `**Moderador:** ${executor ? executor.tag : "Sistema"}\n` +
                `**Motivo:** ${reason}`)
                .setThumbnail(ban.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID do usuário: ${ban.user.id}` });
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de ban:", error);
        }
    }
});
// Log de remoção de ban
createEvent({
    name: "Moderation Log - Ban Removed",
    event: "guildBanRemove",
    once: false,
    async run(ban) {
        try {
            const logChannel = await getLogChannel(ban.guild.id, ban.guild.client);
            if (!logChannel)
                return;
            // Buscar informações de auditoria com validação
            const unbanLog = await getValidAuditLog(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
            const executor = unbanLog?.executor;
            const reason = unbanLog?.reason || "Nenhum motivo fornecido";
            const embed = new EmbedBuilder()
                .setColor(LOG_COLORS.UNBAN)
                .setTitle("✅ **USUÁRIO DESBANIDO**")
                .setDescription(`**Usuário:** ${ban.user.tag} \`(${ban.user.id})\`\n` +
                `**Moderador:** ${executor ? executor.tag : "Sistema"}\n` +
                `**Motivo:** ${reason}`)
                .setThumbnail(ban.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID do usuário: ${ban.user.id}` });
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de unban:", error);
        }
    }
});
// Log de entrada de membros
createEvent({
    name: "Moderation Log - Member Joined",
    event: "guildMemberAdd",
    once: false,
    async run(member) {
        try {
            const logChannel = await getLogChannel(member.guild.id, member.client);
            if (!logChannel)
                return;
            // Calcular idade da conta
            const accountAge = Date.now() - member.user.createdTimestamp;
            const days = Math.floor(accountAge / (1000 * 60 * 60 * 24));
            const embed = new EmbedBuilder()
                .setColor(LOG_COLORS.MEMBER_JOIN)
                .setTitle("📥 **MEMBRO ENTROU**")
                .setDescription(`**Usuário:** ${member.user.tag} \`(${member.user.id})\`\n` +
                `**Menção:** ${member}\n` +
                `**Conta criada:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R> (${days} dias)\n` +
                `**Membros no servidor:** ${member.guild.memberCount}`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID: ${member.user.id}` });
            // Destacar contas muito novas (suspeitas)
            if (days < 7) {
                embed.addFields({
                    name: "⚠️ **ATENÇÃO**",
                    value: `Conta muito nova (${days} dias). Possível alt/spam.`,
                    inline: false
                });
            }
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de entrada:", error);
        }
    }
});
// Log de saída de membros
createEvent({
    name: "Moderation Log - Member Left",
    event: "guildMemberRemove",
    once: false,
    async run(member) {
        try {
            const logChannel = await getLogChannel(member.guild.id, member.client);
            if (!logChannel)
                return;
            // Buscar se foi kick através de auditoria com validação
            const kickLog = await getValidAuditLog(member.guild, AuditLogEvent.MemberKick, member.user.id);
            const wasKicked = !!kickLog;
            const embed = new EmbedBuilder()
                .setColor(wasKicked ? LOG_COLORS.KICK : LOG_COLORS.MEMBER_LEAVE)
                .setTitle(wasKicked ? "👢 **MEMBRO EXPULSO**" : "📤 **MEMBRO SAIU**")
                .setDescription(`**Usuário:** ${member.user.tag} \`(${member.user.id})\`\n` +
                `**Entrou em:** <t:${Math.floor((member.joinedTimestamp || 0) / 1000)}:R>\n` +
                (wasKicked ? `**Moderador:** ${kickLog?.executor?.tag || "Desconhecido"}\n` +
                    `**Motivo:** ${kickLog?.reason || "Nenhum motivo fornecido"}\n` : '') +
                `**Membros no servidor:** ${member.guild.memberCount}`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID: ${member.user.id}` });
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de saída:", error);
        }
    }
});
// Log de mensagens deletadas
createEvent({
    name: "Moderation Log - Message Deleted",
    event: "messageDelete",
    once: false,
    async run(message) {
        try {
            if (message.author?.bot)
                return; // Ignorar bots
            if (!message.guild)
                return;
            const logChannel = await getLogChannel(message.guild.id, message.client);
            if (!logChannel || logChannel.id === message.channel.id)
                return; // Evitar loop
            const embed = new EmbedBuilder()
                .setColor(LOG_COLORS.MESSAGE_DELETE)
                .setTitle("🗑️ **MENSAGEM DELETADA**")
                .setDescription(`**Autor:** ${message.author?.tag || "Usuário desconhecido"} \`(${message.author?.id || "ID desconhecido"})\`\n` +
                `**Canal:** ${message.channel}\n` +
                `**Conteúdo:** ${message.content?.length ? `\`\`\`${message.content.slice(0, 1000)}${message.content.length > 1000 ? '...' : ''}\`\`\`` : "*Sem conteúdo de texto*"}`)
                .setTimestamp()
                .setFooter({ text: `Canal: #${message.channel.name}` });
            if (message.author) {
                embed.setThumbnail(message.author.displayAvatarURL());
            }
            // Adicionar anexos se houver
            if (message.attachments.size > 0) {
                const attachments = Array.from(message.attachments.values())
                    .map(att => `[${att.name}](${att.url})`).join('\n');
                embed.addFields({
                    name: "📎 **Anexos**",
                    value: attachments.slice(0, 1000),
                    inline: false
                });
            }
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de mensagem deletada:", error);
        }
    }
});
// Log de mensagens editadas
createEvent({
    name: "Moderation Log - Message Edited",
    event: "messageUpdate",
    once: false,
    async run(oldMessage, newMessage) {
        try {
            if (newMessage.author?.bot)
                return; // Ignorar bots
            if (!newMessage.guild)
                return;
            if (oldMessage.content === newMessage.content)
                return; // Ignorar edições sem mudança de conteúdo
            const logChannel = await getLogChannel(newMessage.guild.id, newMessage.client);
            if (!logChannel || logChannel.id === newMessage.channel.id)
                return;
            const embed = new EmbedBuilder()
                .setColor(LOG_COLORS.MESSAGE_EDIT)
                .setTitle("✏️ **MENSAGEM EDITADA**")
                .setDescription(`**Autor:** ${newMessage.author?.tag} \`(${newMessage.author?.id})\`\n` +
                `**Canal:** ${newMessage.channel}\n` +
                `**[Link da Mensagem](${newMessage.url})**`)
                .addFields({
                name: "📝 **Antes**",
                value: `\`\`\`${oldMessage.content?.slice(0, 800) || "*Sem conteúdo*"}\`\`\``,
                inline: false
            }, {
                name: "📝 **Depois**",
                value: `\`\`\`${newMessage.content?.slice(0, 800) || "*Sem conteúdo*"}\`\`\``,
                inline: false
            })
                .setThumbnail(newMessage.author?.displayAvatarURL() || null)
                .setTimestamp()
                .setFooter({ text: `Canal: #${newMessage.channel.name}` });
            await logChannel.send({
                embeds: [embed],
                allowedMentions: { parse: [] } // Evitar pings indesejados
            });
        }
        catch (error) {
            console.error("Erro ao registrar log de mensagem editada:", error);
        }
    }
});
// Log de timeouts (atualizações de membro)
createEvent({
    name: "Moderation Log - Member Updated",
    event: "guildMemberUpdate",
    once: false,
    async run(oldMember, newMember) {
        try {
            const logChannel = await getLogChannel(newMember.guild.id, newMember.client);
            if (!logChannel)
                return;
            // Verificar mudança de timeout
            const oldTimeout = oldMember.communicationDisabledUntil;
            const newTimeout = newMember.communicationDisabledUntil;
            // Timeout aplicado
            if (!oldTimeout && newTimeout) {
                const timeoutLog = await getValidAuditLog(newMember.guild, AuditLogEvent.MemberUpdate, newMember.user.id);
                const executor = timeoutLog?.executor;
                const embed = new EmbedBuilder()
                    .setColor(LOG_COLORS.TIMEOUT)
                    .setTitle("🔇 **MEMBRO SILENCIADO**")
                    .setDescription(`**Usuário:** ${newMember.user.tag} \`(${newMember.user.id})\`\n` +
                    `**Moderador:** ${executor ? executor.tag : "Sistema"}\n` +
                    `**Expira em:** <t:${Math.floor(newTimeout.getTime() / 1000)}:F> (<t:${Math.floor(newTimeout.getTime() / 1000)}:R>)\n` +
                    `**Motivo:** ${timeoutLog?.reason || "Nenhum motivo fornecido"}`)
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: `ID: ${newMember.user.id}` });
                await logChannel.send({
                    embeds: [embed],
                    allowedMentions: { parse: [] } // Evitar pings indesejados
                });
            }
            // Timeout removido
            if (oldTimeout && !newTimeout) {
                const embed = new EmbedBuilder()
                    .setColor("#2ed573")
                    .setTitle("🔊 **TIMEOUT REMOVIDO**")
                    .setDescription(`**Usuário:** ${newMember.user.tag} \`(${newMember.user.id})\`\n` +
                    `**Timeout anterior:** <t:${Math.floor(oldTimeout.getTime() / 1000)}:F>`)
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: `ID: ${newMember.user.id}` });
                await logChannel.send({
                    embeds: [embed],
                    allowedMentions: { parse: [] } // Evitar pings indesejados
                });
            }
        }
        catch (error) {
            console.error("Erro ao registrar log de timeout:", error);
        }
    }
});
