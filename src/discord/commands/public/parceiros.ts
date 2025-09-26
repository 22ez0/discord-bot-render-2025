import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, PermissionsBitField, ChannelType } from "discord.js";

createCommand({
    name: "parceiros",
    description: "🤝 Configurar cargo de parceiros com permissões especiais para canal #servers",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verificar permissões de administrador
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "❌ **Acesso negado!** Você precisa de permissões de **Administrador** para usar este comando.",
                flags: 64
            });
            return;
        }

        await interaction.deferReply({ flags: 64 });
        
        const guild = interaction.guild!;
        
        try {
            // Criar cargo "parceiros" se não existir
            let parceirosRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'parceiros');
            
            if (!parceirosRole) {
                parceirosRole = await guild.roles.create({
                    name: 'parceiros',
                    color: '#e74c3c', // Vermelho
                    hoist: true, // Exibir separadamente
                    mentionable: true,
                    permissions: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.UseExternalEmojis,
                        PermissionsBitField.Flags.AddReactions
                    ],
                    reason: 'Cargo para parceiros com permissões especiais no canal #servers'
                });
                console.log(`🤝 Cargo "parceiros" criado com ID: ${parceirosRole.id}`);
            }

            // Procurar canal #servers
            let serversChannel = guild.channels.cache.find(channel => 
                channel.name.toLowerCase().includes('server') && 
                channel.type === ChannelType.GuildText
            );

            if (!serversChannel) {
                // Criar canal #servers se não existir
                serversChannel = await guild.channels.create({
                    name: 'servers',
                    type: ChannelType.GuildText,
                    topic: '🌐 Canal para compartilhar convites de servidores Discord - apenas parceiros podem postar',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionsBitField.Flags.SendMessages], // @everyone não pode enviar mensagens
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory]
                        },
                        {
                            id: parceirosRole.id,
                            allow: [
                                PermissionsBitField.Flags.SendMessages, // Parceiros podem enviar mensagens
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.UseExternalEmojis,
                                PermissionsBitField.Flags.AddReactions,
                                PermissionsBitField.Flags.EmbedLinks // Importante para links de servidores
                            ]
                        }
                    ],
                    reason: 'Canal para compartilhamento de servidores pelos parceiros'
                });
                console.log(`🌐 Canal #servers criado com ID: ${serversChannel.id}`);
            } else {
                // Atualizar permissões do canal existente sem remover outras
                // Verificar se é um canal de texto
                if (serversChannel.type === ChannelType.GuildText && 'permissionOverwrites' in serversChannel) {
                    // Primeiro configurar @everyone
                    await serversChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
                        SendMessages: false, // Negar envio de mensagens
                        ViewChannel: null, // Manter configuração existente
                        ReadMessageHistory: null // Manter configuração existente
                    }, { reason: 'Configurar permissões @everyone para canal servers' });
                    
                    // Depois configurar cargo parceiros
                    await serversChannel.permissionOverwrites.edit(parceirosRole.id, {
                        SendMessages: true,
                        ViewChannel: true,
                        ReadMessageHistory: true,
                        UseExternalEmojis: true,
                        AddReactions: true,
                        EmbedLinks: true
                    }, { reason: 'Configurar permissões cargo parceiros para canal servers' });
                }
                
                console.log(`🔧 Permissões atualizadas no canal ${serversChannel.name} preservando configurações existentes`);
            }

            // Criar embed de sucesso
            const embed = new EmbedBuilder()
                .setColor("#2ed573")
                .setTitle("🤝 **SISTEMA DE PARCEIROS CONFIGURADO**")
                .setDescription(
                    `**Cargo e canal configurados com sucesso!**\n\n` +
                    `**🎭 Cargo Criado/Configurado:**\n` +
                    `• ${parceirosRole} - Cargo para parceiros\n` +
                    `• Cor: Vermelho (#e74c3c)\n` +
                    `• Exibido separadamente na lista\n` +
                    `• Mencionável\n\n` +
                    `**🌐 Canal Configurado:**\n` +
                    `• ${serversChannel} - Canal para servidores\n` +
                    `• Apenas parceiros podem postar\n` +
                    `• Todos podem visualizar e reagir\n` +
                    `• Permissões para links de servidor\n\n` +
                    `**📋 Como usar:**\n` +
                    `• Dê o cargo ${parceirosRole} para usuários de confiança\n` +
                    `• Eles poderão postar convites de servidor no ${serversChannel}\n` +
                    `• Links externos de servidores são permitidos para esse cargo\n` +
                    `• O sistema de automod e!mod respeita essas permissões\n` +
                    `• Parceiros podem postar links de Discord no canal servers\n` +
                    `• Outras regras de automod ainda se aplicam (spam, palavras proibidas)`
                )
                .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
                .setFooter({ 
                    text: "Sistema de Parceiros • Configuração Completa", 
                    iconURL: interaction.client.user?.displayAvatarURL() || undefined 
                })
                .setTimestamp();

            // Salvar configuração no storage
            const { storage } = await import('../../../lib/storage.js');
            const config = storage.getServerConfig(guild.id);
            config.parceiros = {
                roleId: parceirosRole.id,
                serversChannelId: serversChannel.id,
                enabled: true
            };
            storage.saveServerConfig(guild.id, config);
            
            await interaction.editReply({ embeds: [embed] });
            
            // Log da configuração
            console.log(`🤝 Sistema de parceiros configurado no servidor ${guild.name} (${guild.id})`);
            console.log(`   • Cargo: ${parceirosRole.name} (${parceirosRole.id})`);
            console.log(`   • Canal: ${serversChannel.name} (${serversChannel.id})`);

        } catch (error) {
            console.error('Erro ao configurar sistema de parceiros:', error);
            await interaction.editReply({
                content: `❌ **Erro!** Não foi possível configurar o sistema de parceiros: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique se o bot tem permissões para gerenciar cargos e canais.`
            });
        }
    }
});