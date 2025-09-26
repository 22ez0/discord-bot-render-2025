import { createEvent } from "#base";
import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";
import { storage } from "../../lib/storage.js";

// Evento para novos membros (Welcome + Auto-Roles)
createEvent({
    name: "Welcome and Auto-Roles",
    event: "guildMemberAdd",
    once: false,
    async run(member: GuildMember) {
        const guildId = member.guild.id;
        const config = storage.getServerConfig(guildId);

        try {
            // Sistema de Auto-Roles
            if (config.automation?.autoRoles?.enabled && config.automation.autoRoles.roles.length > 0) {
                await handleAutoRoles(member, config.automation.autoRoles.roles);
            }

            // Sistema de Welcome
            if (config.automation?.welcome?.enabled && config.automation.welcome.channelId) {
                await handleWelcomeMessage(member, config.automation.welcome);
            }

        } catch (error) {
            console.error(`Erro ao processar novo membro ${member.user.tag}:`, error);
        }
    }
});

async function handleAutoRoles(member: GuildMember, roleIds: string[]) {
    try {
        console.log(`🎭 Aplicando auto-roles para ${member.user.tag}...`);
        
        for (const roleId of roleIds) {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role, 'Auto-Role System');
                console.log(`✅ Role ${role.name} adicionado para ${member.user.tag}`);
            } else {
                console.warn(`⚠️ Role ${roleId} não encontrado no servidor ${member.guild.name}`);
            }
        }
        
    } catch (error) {
        console.error(`Erro ao aplicar auto-roles para ${member.user.tag}:`, error);
    }
}

async function handleWelcomeMessage(member: GuildMember, welcomeConfig: any) {
    try {
        const channel = member.guild.channels.cache.get(welcomeConfig.channelId) as TextChannel;
        if (!channel || !channel.isTextBased()) {
            console.warn(`⚠️ Canal de welcome ${welcomeConfig.channelId} não encontrado ou não é de texto`);
            return;
        }

        // Verificar permissões do bot
        const botPermissions = channel.permissionsFor(member.guild.members.me!);
        if (!botPermissions?.has(['SendMessages', 'EmbedLinks'])) {
            console.warn(`⚠️ Bot sem permissões no canal de welcome ${channel.name}`);
            return;
        }

        // Processar variáveis na mensagem
        let message = welcomeConfig.message || 'Bem-vindo(a) ao servidor, {user}! 👋';
        message = message
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{server}/g, member.guild.name)
            .replace(/{count}/g, member.guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setColor(welcomeConfig.embedColor || '#2ed573')
            .setTitle('🎉 Bem-vindo(a)!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { 
                    name: '👤 Membro', 
                    value: `${member.user.tag}`, 
                    inline: true 
                },
                { 
                    name: '📊 Total de Membros', 
                    value: `${member.guild.memberCount}`, 
                    inline: true 
                },
                { 
                    name: '📅 Conta Criada', 
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `ID: ${member.id}`, 
                iconURL: member.guild.iconURL() || undefined 
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log(`👋 Mensagem de welcome enviada para ${member.user.tag} em ${channel.name}`);

    } catch (error) {
        console.error(`Erro ao enviar mensagem de welcome para ${member.user.tag}:`, error);
    }
}

// Evento para membros que saem (Goodbye)
createEvent({
    name: "Goodbye Message",
    event: "guildMemberRemove",
    once: false,
    async run(member: GuildMember) {
        const guildId = member.guild.id;
        const config = storage.getServerConfig(guildId);

        try {
            // Sistema de Goodbye
            if (config.automation?.goodbye?.enabled && config.automation.goodbye.channelId) {
                await handleGoodbyeMessage(member, config.automation.goodbye);
            }

        } catch (error) {
            console.error(`Erro ao processar saída do membro ${member.user.tag}:`, error);
        }
    }
});

async function handleGoodbyeMessage(member: GuildMember, goodbyeConfig: any) {
    try {
        const channel = member.guild.channels.cache.get(goodbyeConfig.channelId) as TextChannel;
        if (!channel || !channel.isTextBased()) {
            console.warn(`⚠️ Canal de goodbye ${goodbyeConfig.channelId} não encontrado ou não é de texto`);
            return;
        }

        // Verificar permissões do bot
        const botPermissions = channel.permissionsFor(member.guild.members.me!);
        if (!botPermissions?.has(['SendMessages', 'EmbedLinks'])) {
            console.warn(`⚠️ Bot sem permissões no canal de goodbye ${channel.name}`);
            return;
        }

        // Processar variáveis na mensagem
        let message = goodbyeConfig.message || '{user} saiu do servidor. 😢';
        message = message
            .replace(/{user}/g, member.user.tag)
            .replace(/{server}/g, member.guild.name)
            .replace(/{count}/g, member.guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('👋 Tchau!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { 
                    name: '👤 Membro', 
                    value: `${member.user.tag}`, 
                    inline: true 
                },
                { 
                    name: '📊 Total de Membros', 
                    value: `${member.guild.memberCount}`, 
                    inline: true 
                },
                { 
                    name: '⏰ Tempo no Servidor', 
                    value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Desconhecido', 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `ID: ${member.id}`, 
                iconURL: member.guild.iconURL() || undefined 
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log(`👋 Mensagem de goodbye enviada para ${member.user.tag} em ${channel.name}`);

    } catch (error) {
        console.error(`Erro ao enviar mensagem de goodbye para ${member.user.tag}:`, error);
    }
}