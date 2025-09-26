import { Client, REST, Routes, ChatInputCommandInteraction } from 'discord.js';
import { env } from '../env.js';

// Comandos simples e diretos
const commands = [
  {
    name: 'ping',
    description: 'Responde com pong!',
    execute: async (interaction: ChatInputCommandInteraction) => {
      const ping = interaction.client.ws.ping;
      await interaction.reply({
        content: `🏓 **Pong!** Latência: \`${ping}ms\``,
        ephemeral: false
      });
    }
  },
  {
    name: 'avatar',
    description: 'Ver o avatar de um usuário',
    options: [{
      name: 'usuário',
      description: 'Usuário para ver o avatar',
      type: 6,
      required: false
    }],
    execute: async (interaction: ChatInputCommandInteraction) => {
      const targetUser = interaction.options.getUser('usuário') || interaction.user;
      
      const embed = {
        color: 0x5865F2,
        title: `🖼️ Avatar de ${targetUser.username}`,
        image: { url: targetUser.displayAvatarURL({ size: 512 }) },
        description: [
          `[🔗 PNG](${targetUser.displayAvatarURL({ extension: 'png', size: 1024 })})`,
          `[🔗 JPG](${targetUser.displayAvatarURL({ extension: 'jpg', size: 1024 })})`,
          `[🔗 WEBP](${targetUser.displayAvatarURL({ extension: 'webp', size: 1024 })})`
        ].join(' | '),
        footer: { 
          text: `Solicitado por ${interaction.user.username}`,
          icon_url: interaction.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString()
      };

      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    name: 'ban',
    description: 'Banir um usuário do servidor',
    options: [
      {
        name: 'usuário',
        description: 'Usuário a ser banido',
        type: 6,
        required: true
      },
      {
        name: 'motivo',
        description: 'Motivo do banimento',
        type: 3,
        required: false
      }
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
      // Verificar permissões
      if (!interaction.memberPermissions?.has('BanMembers')) {
        await interaction.reply({
          content: '❌ **Acesso negado!** Você precisa da permissão **Banir Membros**.',
          flags: 64
        });
        return;
      }

      const target = interaction.options.getUser('usuário');
      const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

      if (!target) {
        await interaction.reply({
          content: '❌ **Erro!** Usuário não encontrado.',
          flags: 64
        });
        return;
      }

      if (!interaction.guild) {
        await interaction.reply({
          content: '❌ **Erro!** Este comando só funciona em servidores.',
          flags: 64
        });
        return;
      }

      try {
        await interaction.guild.members.ban(target, {
          reason: `${reason} | Banido por: ${interaction.user.tag}`
        });

        const embed = {
          color: 0xff4757,
          title: '🔨 **USUÁRIO BANIDO**',
          description: [
            `**Usuário:** ${target.tag} \`(${target.id})\``,
            `**Moderador:** ${interaction.user.tag}`,
            `**Motivo:** ${reason}`
          ].join('\\n'),
          thumbnail: { url: target.displayAvatarURL() },
          timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Erro ao banir usuário:', error);
        await interaction.reply({
          content: '❌ **Erro!** Não foi possível banir o usuário.',
          flags: 64
        });
      }
    }
  },
  {
    name: 'kick',
    description: 'Expulsar um usuário do servidor',
    options: [
      {
        name: 'usuário',
        description: 'Usuário a ser expulso',
        type: 6,
        required: true
      },
      {
        name: 'motivo',
        description: 'Motivo da expulsão',
        type: 3,
        required: false
      }
    ],
    execute: async (interaction: ChatInputCommandInteraction) => {
      if (!interaction.memberPermissions?.has('KickMembers')) {
        await interaction.reply({
          content: '❌ **Acesso negado!** Você precisa da permissão **Expulsar Membros**.',
          flags: 64
        });
        return;
      }

      const target = interaction.options.getUser('usuário');
      const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

      if (!target) {
        await interaction.reply({
          content: '❌ **Erro!** Usuário não encontrado.',
          flags: 64
        });
        return;
      }

      if (!interaction.guild) {
        await interaction.reply({
          content: '❌ **Erro!** Este comando só funciona em servidores.',
          flags: 64
        });
        return;
      }

      try {
        const member = interaction.guild.members.cache.get(target.id);
        if (!member) {
          await interaction.reply({
            content: '❌ **Erro!** Usuário não encontrado no servidor.',
            flags: 64
          });
          return;
        }

        await member.kick(`${reason} | Expulso por: ${interaction.user.tag}`);

        const embed = {
          color: 0xff9f43,
          title: '👢 **USUÁRIO EXPULSO**',
          description: [
            `**Usuário:** ${target.tag} \`(${target.id})\``,
            `**Moderador:** ${interaction.user.tag}`,
            `**Motivo:** ${reason}`
          ].join('\\n'),
          thumbnail: { url: target.displayAvatarURL() },
          timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Erro ao expulsar usuário:', error);
        await interaction.reply({
          content: '❌ **Erro!** Não foi possível expulsar o usuário.',
          flags: 64
        });
      }
    }
  }
];

export async function loadCommands(client: Client) {
  console.log('🔄 Carregando comandos...');
  
  // Armazenar comandos no cliente
  for (const command of commands) {
    client.commands.set(command.name, command);
  }

  // Registrar comandos na API do Discord
  const rest = new REST({ version: '10' }).setToken(env.BOT_TOKEN);

  try {
    console.log('📤 Registrando comandos slash...');
    
    await rest.put(
      Routes.applicationCommands(env.CLIENT_ID),
      { body: commands.map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options || [] })) }
    );

    console.log(`✅ ${commands.length} comandos registrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
}