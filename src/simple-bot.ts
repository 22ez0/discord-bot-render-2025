import { Client, GatewayIntentBits, ActivityType, REST, Routes, Guild, User, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } from 'discord.js';
import express from 'express';
import fs from 'fs';
import path from 'path';

// Environment variables diretos
const BOT_TOKEN = process.env.BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;

if (!BOT_TOKEN || !CLIENT_ID) {
  console.error('❌ BOT_TOKEN e CLIENT_ID são obrigatórios!');
  process.exit(1);
}

// Error handlers
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// HTTP Server para health check
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP rodando na porta ${PORT}`);
});

// Sistema de configuração persistente
interface ServerConfig {
  clSystem: {
    enabled: boolean;
    allowedRoles: string[];
    allowedUsers: string[];
    customTriggers: string[];
    deleteOwnMessage: boolean;
  };
  logging: {
    enabled: boolean;
    channelId: string;
    events: {
      ban: boolean;
      kick: boolean;
      mute: boolean;
      roleAdd: boolean;
      roleRemove: boolean;
      roleCreate: boolean;
      roleDelete: boolean;
      voiceJoin: boolean;
      voiceLeave: boolean;
      messageDelete: boolean;
      messageEdit: boolean;
      channelCreate: boolean;
      channelDelete: boolean;
    };
  };
  automod: {
    antiLink: {
      enabled: boolean;
      allowedDomains: string[];
      action: 'delete' | 'warn' | 'mute';
    };
    wordFilter: {
      enabled: boolean;
      bannedWords: string[];
      action: 'delete' | 'warn' | 'mute';
    };
    antiSpam: {
      enabled: boolean;
      maxMessages: number;
      timeWindow: number;
      action: 'delete' | 'warn' | 'mute';
    };
    antiCaps: {
      enabled: boolean;
      maxPercentage: number;
      action: 'delete' | 'warn' | 'mute';
    };
  };
  autoRole: {
    enabled: boolean;
    roleId: string;
    message: string;
    imageUrl?: string;
    channelId?: string;
  };
  welcome: {
    enabled: boolean;
    channelId: string;
    message: string;
    imageUrl?: string;
  };
}

const defaultConfig: ServerConfig = {
  clSystem: {
    enabled: true,
    allowedRoles: [],
    allowedUsers: [],
    customTriggers: [],
    deleteOwnMessage: true
  },
  logging: {
    enabled: false,
    channelId: '',
    events: {
      ban: true,
      kick: true,
      mute: true,
      roleAdd: true,
      roleRemove: true,
      roleCreate: true,
      roleDelete: true,
      voiceJoin: true,
      voiceLeave: true,
      messageDelete: true,
      messageEdit: true,
      channelCreate: true,
      channelDelete: true
    }
  },
  automod: {
    antiLink: {
      enabled: false,
      allowedDomains: [],
      action: 'delete'
    },
    wordFilter: {
      enabled: false,
      bannedWords: [],
      action: 'delete'
    },
    antiSpam: {
      enabled: false,
      maxMessages: 5,
      timeWindow: 5000,
      action: 'delete'
    },
    antiCaps: {
      enabled: false,
      maxPercentage: 70,
      action: 'delete'
    }
  },
  autoRole: {
    enabled: false,
    roleId: '',
    message: 'Bem-vindo! Reaja para receber seu cargo.',
    imageUrl: undefined,
    channelId: undefined
  },
  welcome: {
    enabled: false,
    channelId: '',
    message: 'Bem-vindo ao servidor, {user}!',
    imageUrl: undefined
  }
};

// Storage de configurações
const configsPath = './server-configs';
if (!fs.existsSync(configsPath)) {
  fs.mkdirSync(configsPath, { recursive: true });
}

function getServerConfig(guildId: string): ServerConfig {
  const configFile = path.join(configsPath, `${guildId}.json`);
  if (fs.existsSync(configFile)) {
    try {
      const loadedConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      // Deep merge para preservar configurações aninhadas
      return {
        clSystem: { ...defaultConfig.clSystem, ...loadedConfig.clSystem },
        logging: { 
          ...defaultConfig.logging, 
          ...loadedConfig.logging,
          events: { ...defaultConfig.logging.events, ...loadedConfig.logging?.events }
        },
        automod: {
          antiLink: { ...defaultConfig.automod.antiLink, ...loadedConfig.automod?.antiLink },
          wordFilter: { ...defaultConfig.automod.wordFilter, ...loadedConfig.automod?.wordFilter },
          antiSpam: { ...defaultConfig.automod.antiSpam, ...loadedConfig.automod?.antiSpam },
          antiCaps: { ...defaultConfig.automod.antiCaps, ...loadedConfig.automod?.antiCaps }
        },
        autoRole: { ...defaultConfig.autoRole, ...loadedConfig.autoRole },
        welcome: { ...defaultConfig.welcome, ...loadedConfig.welcome }
      };
    } catch (error) {
      console.error('Erro ao ler config:', error);
    }
  }
  return { ...defaultConfig };
}

function saveServerConfig(guildId: string, config: ServerConfig) {
  const configFile = path.join(configsPath, `${guildId}.json`);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

// Sistema de spam tracking (será implementado nos próximos painéis)
// const spamTracker = new Map<string, { messages: number; timestamp: number }>();

// Comandos simples
const commands = [
  {
    name: 'painel',
    description: 'Abrir painel de administração completo'
  },
  {
    name: 'ping',
    description: 'Responde com pong e latência',
  },
  {
    name: 'avatar',
    description: 'Ver avatar de um usuário',
    options: [
      {
        name: 'usuario',
        description: 'Usuário para ver o avatar',
        type: 6,
        required: false
      }
    ]
  },
  {
    name: 'ban',
    description: 'Banir um usuário',
    options: [
      {
        name: 'usuario',
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
    ]
  },
  {
    name: 'kick',
    description: 'Expulsar um usuário',
    options: [
      {
        name: 'usuario',
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
    ]
  },
  {
    name: 'altcheck',
    description: 'Verificar se um usuário é uma conta alt suspeita',
    options: [
      {
        name: 'usuario',
        description: 'Usuário para verificar',
        type: 6,
        required: true
      }
    ]
  },
  {
    name: 'emojis',
    description: 'Gerenciar emojis do servidor (detectar todos os tipos)',
    options: [
      {
        name: 'acao',
        description: 'Ação a realizar',
        type: 3,
        required: true,
        choices: [
          { name: 'listar', value: 'list' },
          { name: 'stats', value: 'stats' },
          { name: 'detectar', value: 'detect' }
        ]
      },
      {
        name: 'mensagem',
        description: 'Mensagem para detectar emojis (opcional)',
        type: 3,
        required: false
      }
    ]
  }
];

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', async () => {
  console.log(`✅ Bot online como ${client.user?.tag}!`);
  
  // Definir status
  client.user?.setPresence({
    activities: [{
      name: 'desenvolvido por vegas!',
      type: ActivityType.Streaming,
      url: 'https://www.twitch.tv/discord'
    }],
    status: 'online'
  });

  // Registrar comandos
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  
  try {
    console.log('📤 Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log(`✅ ${commands.length} comandos registrados!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
});

// Função para criar painel principal
function createMainPanel(guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Painel de Administração')
    .setDescription(`**Bem-vindo ao sistema de administração completo!**\n\nConfigure todos os aspectos do seu servidor de forma fácil e intuitiva.\n\n🎛️ **Selecione uma opção abaixo para configurar:**`)
    .setColor(0x5865F2)
    .addFields(
      { name: '🧹 Sistema CL', value: 'Configure comandos de limpeza personalizados', inline: true },
      { name: '📋 Logs', value: 'Configure logs detalhados para eventos', inline: true },
      { name: '🛡️ AutoMod', value: 'Configure auto-moderação avançada', inline: true },
      { name: '👋 Boas-vindas', value: 'Configure mensagens de boas-vindas', inline: true },
      { name: '🎭 Auto-Role', value: 'Configure cargos automáticos', inline: true },
      { name: '⚙️ Configurações', value: 'Configurações gerais do servidor', inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_cl')
        .setLabel('🧹 Sistema CL')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('panel_logs')
        .setLabel('📋 Logs')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('panel_automod')
        .setLabel('🛡️ AutoMod')
        .setStyle(ButtonStyle.Primary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_welcome')
        .setLabel('👋 Boas-vindas')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('panel_autorole')
        .setLabel('🎭 Auto-Role')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('panel_settings')
        .setLabel('⚙️ Configurações')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

// Função para criar painel do Sistema CL
function createCLPanel(config: ServerConfig, guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('🧹 Sistema CL - Configuração')
    .setDescription(`**Configure o sistema de limpeza personalizado**\n\nO sistema CL permite que usuários autorizados limpem suas próprias mensagens digitando comandos específicos.`)
    .setColor(config.clSystem.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: '📊 Status Atual', value: config.clSystem.enabled ? '🟢 **Ativado**' : '🔴 **Desativado**', inline: true },
      { name: '🗑️ Apagar comando', value: config.clSystem.deleteOwnMessage ? '✅ Sim' : '❌ Não', inline: true },
      { name: '👥 Usuários permitidos', value: config.clSystem.allowedUsers.length > 0 ? `${config.clSystem.allowedUsers.length} usuários` : 'Nenhum', inline: true },
      { name: '🎭 Cargos permitidos', value: config.clSystem.allowedRoles.length > 0 ? `${config.clSystem.allowedRoles.length} cargos` : 'Todos', inline: true },
      { name: '⚡ Comandos personalizados', value: config.clSystem.customTriggers.length > 0 ? config.clSystem.customTriggers.join(', ') : 'Apenas "cl"', inline: true },
      { name: '\u200b', value: '\u200b', inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('cl_toggle')
        .setLabel(config.clSystem.enabled ? '🔴 Desativar' : '🟢 Ativar')
        .setStyle(config.clSystem.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cl_add_roles')
        .setLabel('🎭 Adicionar Cargos')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cl_remove_roles')
        .setLabel('🗑️ Remover Cargos')
        .setStyle(ButtonStyle.Secondary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('cl_add_users')
        .setLabel('👥 Adicionar Usuários')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cl_remove_users')
        .setLabel('🗑️ Remover Usuários')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('cl_custom_triggers')
        .setLabel('⚡ CL Personalizado')
        .setStyle(ButtonStyle.Primary)
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('cl_delete_toggle')
        .setLabel(config.clSystem.deleteOwnMessage ? '🔄 Manter comando' : '🗑️ Apagar comando')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('◀ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2, row3] };
}

// Função para criar painel de Logs
function createLogsPanel(config: ServerConfig, guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Sistema de Logs - Configuração')
    .setDescription(`**Configure o sistema de logs detalhado**\n\nRegistre todos os eventos importantes do seu servidor automaticamente.`)
    .setColor(config.logging.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: '📊 Status', value: config.logging.enabled ? '🟢 **Ativado**' : '🔴 **Desativado**', inline: true },
      { name: '📝 Canal de logs', value: config.logging.channelId ? `<#${config.logging.channelId}>` : '❌ Não configurado', inline: true },
      { name: '📈 Eventos ativos', value: Object.values(config.logging.events).filter(Boolean).length + '/12', inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('logs_toggle')
        .setLabel(config.logging.enabled ? '🔴 Desativar' : '🟢 Ativar')
        .setStyle(config.logging.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('logs_channel')
        .setLabel('📝 Configurar Canal')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('logs_events')
        .setLabel('📈 Selecionar Eventos')
        .setStyle(ButtonStyle.Primary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('◀ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

// Função para criar painel de AutoMod
function createAutoModPanel(config: ServerConfig, guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('🛡️ AutoMod - Configuração')
    .setDescription(`**Configure a auto-moderação avançada**\n\nProteja seu servidor automaticamente contra spam, links maliciosos e conteúdo inadequado.`)
    .setColor(0x5865F2)
    .addFields(
      { name: '🔗 Anti-Links', value: config.automod.antiLink.enabled ? '✅ Ativo' : '❌ Inativo', inline: true },
      { name: '🚫 Filtro de Palavras', value: config.automod.wordFilter.enabled ? '✅ Ativo' : '❌ Inativo', inline: true },
      { name: '📢 Anti-Spam', value: config.automod.antiSpam.enabled ? '✅ Ativo' : '❌ Inativo', inline: true },
      { name: '🔠 Anti-Caps', value: config.automod.antiCaps.enabled ? '✅ Ativo' : '❌ Inativo', inline: true },
      { name: '✅ Links permitidos', value: config.automod.antiLink.allowedDomains.length.toString(), inline: true },
      { name: '🚫 Palavras banidas', value: config.automod.wordFilter.bannedWords.length.toString(), inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('automod_antilink')
        .setLabel('🔗 Anti-Links')
        .setStyle(config.automod.antiLink.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('automod_wordfilter')
        .setLabel('🚫 Palavras')
        .setStyle(config.automod.wordFilter.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('automod_antispam')
        .setLabel('📢 Anti-Spam')
        .setStyle(config.automod.antiSpam.enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('automod_anticaps')
        .setLabel('🔠 Anti-Caps')
        .setStyle(config.automod.antiCaps.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('◀ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

// Função para criar painel de Boas-vindas
function createWelcomePanel(config: ServerConfig, guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('👋 Sistema de Boas-vindas - Configuração')
    .setDescription(`**Configure mensagens de boas-vindas**\n\nReceba novos membros com mensagens personalizadas.`)
    .setColor(config.welcome.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: '📊 Status', value: config.welcome.enabled ? '🟢 **Ativado**' : '🔴 **Desativado**', inline: true },
      { name: '📝 Canal', value: config.welcome.channelId ? `<#${config.welcome.channelId}>` : '❌ Não configurado', inline: true },
      { name: '💬 Mensagem', value: config.welcome.message ? '✅ Configurada' : '❌ Padrão', inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('welcome_toggle')
        .setLabel(config.welcome.enabled ? '🔴 Desativar' : '🟢 Ativar')
        .setStyle(config.welcome.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('welcome_channel')
        .setLabel('📝 Configurar Canal')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('welcome_message')
        .setLabel('💬 Editar Mensagem')
        .setStyle(ButtonStyle.Primary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('◀ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

// Função para criar painel de Auto-Role
function createAutoRolePanel(config: ServerConfig, guildName: string) {
  const embed = new EmbedBuilder()
    .setTitle('🎭 Sistema Auto-Role - Configuração')
    .setDescription(`**Configure cargos automáticos**\n\nDê cargos automaticamente para novos membros ou por reação.`)
    .setColor(config.autoRole.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: '📊 Status', value: config.autoRole.enabled ? '🟢 **Ativado**' : '🔴 **Desativado**', inline: true },
      { name: '🎭 Cargo', value: config.autoRole.roleId ? `<@&${config.autoRole.roleId}>` : '❌ Não configurado', inline: true },
      { name: '📝 Canal', value: config.autoRole.channelId ? `<#${config.autoRole.channelId}>` : '❌ Não configurado', inline: true }
    )
    .setFooter({ text: `Servidor: ${guildName}` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('autorole_toggle')
        .setLabel(config.autoRole.enabled ? '🔴 Desativar' : '🟢 Ativar')
        .setStyle(config.autoRole.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('autorole_role')
        .setLabel('🎭 Configurar Cargo')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('autorole_channel')
        .setLabel('📝 Configurar Canal')
        .setStyle(ButtonStyle.Primary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('autorole_message')
        .setLabel('💬 Editar Mensagem')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('◀ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  return { embeds: [embed], components: [row, row2] };
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

  // Handler para botões
  if (interaction.isButton()) {
    if (!interaction.guild) return;
    
    const config = getServerConfig(interaction.guild.id);
    
    // Verificar permissões de admin
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: '❌ Você precisa de permissões de **Administrador** para usar este painel!',
        ephemeral: true
      });
      return;
    }

    try {
      if (interaction.customId === 'panel_cl') {
        const panel = createCLPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'panel_logs') {
        const panel = createLogsPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'panel_automod') {
        const panel = createAutoModPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'panel_welcome') {
        const panel = createWelcomePanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'panel_autorole') {
        const panel = createAutoRolePanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'panel_settings') {
        await interaction.update({
          content: '⚙️ **Painel de Configurações**\n\nEm breve! Este painel incluirá configurações gerais do servidor.',
          embeds: [],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId('back_main')
                .setLabel('◀ Voltar')
                .setStyle(ButtonStyle.Secondary)
            )
          ]
        });
      }
      else if (interaction.customId === 'back_main') {
        const panel = createMainPanel(interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'cl_toggle') {
        config.clSystem.enabled = !config.clSystem.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createCLPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'cl_delete_toggle') {
        config.clSystem.deleteOwnMessage = !config.clSystem.deleteOwnMessage;
        saveServerConfig(interaction.guild.id, config);
        const panel = createCLPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'cl_add_roles') {
        const roles = interaction.guild.roles.cache
          .filter(role => role.id !== interaction.guild!.id && !role.managed)
          .sort((a, b) => b.position - a.position)
          .first(25);

        if (roles.length === 0) {
          await interaction.reply({
            content: '❌ Não há cargos disponíveis para adicionar!',
            flags: 64
          });
          return;
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('cl_select_add_roles')
          .setPlaceholder('Selecione os cargos permitidos...')
          .setMinValues(1)
          .setMaxValues(Math.min(roles.length, 25))
          .addOptions(
            roles.map(role => new StringSelectMenuOptionBuilder()
              .setLabel(role.name)
              .setValue(role.id)
              .setDescription(`${role.members.size} membros`)
              .setDefault(config.clSystem.allowedRoles.includes(role.id))
            )
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await interaction.reply({
          content: '🎭 **Selecione os cargos que poderão usar o sistema CL:**',
          components: [row],
          flags: 64
        });
      }
      else if (interaction.customId === 'cl_remove_roles') {
        if (config.clSystem.allowedRoles.length === 0) {
          await interaction.reply({
            content: '❌ Não há cargos para remover!',
            flags: 64
          });
          return;
        }

        const roles = config.clSystem.allowedRoles.map(roleId => {
          const role = interaction.guild!.roles.cache.get(roleId);
          return role ? { id: roleId, name: role.name } : { id: roleId, name: 'Cargo deletado' };
        });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('cl_select_remove_roles')
          .setPlaceholder('Selecione os cargos para remover...')
          .setMinValues(1)
          .setMaxValues(roles.length)
          .addOptions(
            roles.map(role => new StringSelectMenuOptionBuilder()
              .setLabel(role.name)
              .setValue(role.id)
              .setDescription('Clique para remover')
            )
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await interaction.reply({
          content: '🗑️ **Selecione os cargos para remover do sistema CL:**',
          components: [row],
          flags: 64
        });
      }
      else if (interaction.customId === 'cl_add_users') {
        const modal = new ModalBuilder()
          .setCustomId('cl_add_users_modal')
          .setTitle('Adicionar Usuários ao CL');

        const userInput = new TextInputBuilder()
          .setCustomId('cl_users')
          .setLabel('Digite os IDs dos usuários (separados por vírgula)')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('123456789, 987654321, ...')
          .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(userInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
      }
      else if (interaction.customId === 'cl_remove_users') {
        if (config.clSystem.allowedUsers.length === 0) {
          await interaction.reply({
            content: '❌ Não há usuários para remover!',
            flags: 64
          });
          return;
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('cl_select_remove_users')
          .setPlaceholder('Selecione os usuários para remover...')
          .setMinValues(1)
          .setMaxValues(Math.min(config.clSystem.allowedUsers.length, 25))
          .addOptions(
            config.clSystem.allowedUsers.slice(0, 25).map(userId => new StringSelectMenuOptionBuilder()
              .setLabel(`Usuário ${userId}`)
              .setValue(userId)
              .setDescription('Clique para remover')
            )
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await interaction.reply({
          content: '🗑️ **Selecione os usuários para remover do sistema CL:**',
          components: [row],
          flags: 64
        });
      }
      else if (interaction.customId === 'cl_custom_triggers') {
        const modal = new ModalBuilder()
          .setCustomId('cl_custom_modal')
          .setTitle('CL Personalizado');

        const triggerInput = new TextInputBuilder()
          .setCustomId('cl_trigger')
          .setLabel('Digite o novo comando CL personalizado')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('exemplo: limpar, clear, purge')
          .setRequired(true)
          .setMaxLength(20);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(triggerInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
      }
      // Handlers para painéis de logs
      else if (interaction.customId === 'logs_toggle') {
        config.logging.enabled = !config.logging.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createLogsPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      // Handlers para AutoMod
      else if (interaction.customId === 'automod_antilink') {
        config.automod.antiLink.enabled = !config.automod.antiLink.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createAutoModPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'automod_wordfilter') {
        config.automod.wordFilter.enabled = !config.automod.wordFilter.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createAutoModPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'automod_antispam') {
        config.automod.antiSpam.enabled = !config.automod.antiSpam.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createAutoModPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      else if (interaction.customId === 'automod_anticaps') {
        config.automod.antiCaps.enabled = !config.automod.antiCaps.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createAutoModPanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      // Handlers para Welcome
      else if (interaction.customId === 'welcome_toggle') {
        config.welcome.enabled = !config.welcome.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createWelcomePanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
      // Handlers para AutoRole
      else if (interaction.customId === 'autorole_toggle') {
        config.autoRole.enabled = !config.autoRole.enabled;
        saveServerConfig(interaction.guild.id, config);
        const panel = createAutoRolePanel(config, interaction.guild.name);
        await interaction.update(panel);
      }
    } catch (error) {
      console.error('Erro ao processar botão:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar sua solicitação.',
          flags: 64
        });
      }
    }
  }

  // Handler para select menus
  if (interaction.isStringSelectMenu()) {
    if (!interaction.guild) return;
    
    const config = getServerConfig(interaction.guild.id);

    try {
      if (interaction.customId === 'cl_select_add_roles') {
        config.clSystem.allowedRoles = interaction.values;
        saveServerConfig(interaction.guild.id, config);
        
        const roles = interaction.values.map(id => `<@&${id}>`).join(', ');
        await interaction.update({
          content: `✅ **Cargos atualizados com sucesso!**\n\n🎭 **Cargos permitidos:** ${roles || 'Nenhum'}`,
          components: []
        });
      }
      else if (interaction.customId === 'cl_select_remove_roles') {
        config.clSystem.allowedRoles = config.clSystem.allowedRoles.filter(
          roleId => !interaction.values.includes(roleId)
        );
        saveServerConfig(interaction.guild.id, config);
        
        const removedRoles = interaction.values.map(id => `<@&${id}>`).join(', ');
        await interaction.update({
          content: `✅ **Cargos removidos com sucesso!**\n\n🗑️ **Cargos removidos:** ${removedRoles}`,
          components: []
        });
      }
      else if (interaction.customId === 'cl_select_remove_users') {
        config.clSystem.allowedUsers = config.clSystem.allowedUsers.filter(
          userId => !interaction.values.includes(userId)
        );
        saveServerConfig(interaction.guild.id, config);
        
        await interaction.update({
          content: `✅ **Usuários removidos com sucesso!**\n\n🗑️ **${interaction.values.length} usuários foram removidos do sistema CL.**`,
          components: []
        });
      }
    } catch (error) {
      console.error('Erro ao processar select menu:', error);
    }
  }

  // Handler para modals
  if (interaction.isModalSubmit()) {
    if (!interaction.guild) return;
    
    const config = getServerConfig(interaction.guild.id);

    try {
      if (interaction.customId === 'cl_custom_modal') {
        const newTrigger = interaction.fields.getTextInputValue('cl_trigger').toLowerCase().trim();
        
        if (!newTrigger || newTrigger.length < 1) {
          await interaction.reply({
            content: '❌ Comando inválido! Digite um comando válido.',
            flags: 64
          });
          return;
        }

        if (config.clSystem.customTriggers.includes(newTrigger)) {
          await interaction.reply({
            content: '❌ Este comando já existe na lista!',
            flags: 64
          });
          return;
        }

        config.clSystem.customTriggers.push(newTrigger);
        saveServerConfig(interaction.guild.id, config);

        await interaction.reply({
          content: `✅ **Comando personalizado adicionado com sucesso!**\n\n⚡ **Novo comando:** \`${newTrigger}\`\n\n📝 Agora os usuários podem usar \`${newTrigger}\` para limpar suas mensagens.`,
          flags: 64
        });
      }
      else if (interaction.customId === 'cl_add_users_modal') {
        const userIds = interaction.fields.getTextInputValue('cl_users')
          .split(',')
          .map(id => id.trim())
          .filter(id => id.match(/^\d{17,19}$/)); // Validar IDs do Discord

        if (userIds.length === 0) {
          await interaction.reply({
            content: '❌ Nenhum ID de usuário válido fornecido! Use IDs do Discord (17-19 dígitos).',
            flags: 64
          });
          return;
        }

        // Adicionar novos usuários sem duplicar
        userIds.forEach(userId => {
          if (!config.clSystem.allowedUsers.includes(userId)) {
            config.clSystem.allowedUsers.push(userId);
          }
        });

        saveServerConfig(interaction.guild.id, config);

        await interaction.reply({
          content: `✅ **Usuários adicionados com sucesso!**\n\n👥 **${userIds.length} usuários** foram adicionados ao sistema CL.\n\n**IDs:** ${userIds.join(', ')}`,
          flags: 64
        });
      }
    } catch (error) {
      console.error('Erro ao processar modal:', error);
    }
  }

  // Handler para slash commands
  if (interaction.isChatInputCommand()) {
    try {
      const { commandName } = interaction;

      if (commandName === 'painel') {
        if (!interaction.guild) {
          await interaction.reply({
            content: '❌ Este comando só pode ser usado em servidores!',
            flags: 64
          });
          return;
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          await interaction.reply({
            content: '❌ Você precisa de permissões de **Administrador** para usar este comando!',
            flags: 64
          });
          return;
        }

        const panel = createMainPanel(interaction.guild.name);
        await interaction.reply({ ...panel, flags: 64 });
        return;
      }

    switch (commandName) {
      case 'ping': {
        const ping = client.ws.ping;
        await interaction.reply({
          content: `🏓 **Pong!** Latência: \`${ping}ms\``
        });
        break;
      }

      case 'avatar': {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
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
        break;
      }

      case 'ban': {
        if (!interaction.memberPermissions?.has('BanMembers')) {
          await interaction.reply({
            content: '❌ **Acesso negado!** Você precisa da permissão **Banir Membros**.',
            flags: 64
          });
          return;
        }

        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        if (!target || !interaction.guild) {
          await interaction.reply({
            content: '❌ **Erro!** Usuário ou servidor não encontrado.',
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
          console.error('Erro ao banir:', error);
          await interaction.reply({
            content: '❌ **Erro!** Não foi possível banir o usuário.',
            flags: 64
          });
        }
        break;
      }

      case 'kick': {
        if (!interaction.memberPermissions?.has('KickMembers')) {
          await interaction.reply({
            content: '❌ **Acesso negado!** Você precisa da permissão **Expulsar Membros**.',
            flags: 64
          });
          return;
        }

        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        if (!target || !interaction.guild) {
          await interaction.reply({
            content: '❌ **Erro!** Usuário ou servidor não encontrado.',
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
          console.error('Erro ao expulsar:', error);
          await interaction.reply({
            content: '❌ **Erro!** Não foi possível expulsar o usuário.',
            flags: 64
          });
        }
        break;
      }

      case 'altcheck': {
        await interaction.deferReply();
        
        const target = interaction.options.getUser('usuario', true);
        
        try {
          const altAnalysis = await analyzeUserForAlt(target, interaction.guild);
          
          const riskColor = altAnalysis.riskLevel === 'HIGH' ? 0xff4757 : 
                           altAnalysis.riskLevel === 'MEDIUM' ? 0xffa502 : 0x2ed573;
          
          const embed = {
            color: riskColor,
            title: `🛡️ Análise de Alt Account: ${target.username}`,
            thumbnail: { url: target.displayAvatarURL() },
            fields: [
              {
                name: '👤 Informações da Conta',
                value: [
                  `**ID:** \`${target.id}\``,
                  `**Criada em:** <t:${Math.floor(target.createdTimestamp / 1000)}:F>`,
                  `**Idade:** ${Math.floor((Date.now() - target.createdTimestamp) / (1000 * 60 * 60 * 24))} dias`,
                  `**Avatar:** ${target.displayAvatarURL() ? '✅ Sim' : '❌ Não'}`
                ].join('\n'),
                inline: true
              },
              {
                name: '⚠️ Análise de Risco',
                value: [
                  `**Nível:** ${altAnalysis.riskLevel}`,
                  `**Pontuação:** ${altAnalysis.score}/100`,
                  `**Status:** ${altAnalysis.verdict}`
                ].join('\n'),
                inline: true
              },
              {
                name: '🔍 Fatores Detectados',
                value: altAnalysis.factors.join('\n') || 'Nenhum fator suspeito detectado',
                inline: false
              }
            ],
            footer: { 
              text: `Análise solicitada por ${interaction.user.username}`,
              icon_url: interaction.user.displayAvatarURL()
            },
            timestamp: new Date().toISOString()
          };

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          console.error('Erro na análise de alt:', error);
          await interaction.editReply({
            content: '❌ **Erro ao analisar usuário!** Tente novamente mais tarde.'
          });
        }
        break;
      }

      case 'emojis': {
        await interaction.deferReply();
        
        const action = interaction.options.getString('acao', true);
        const messageContent = interaction.options.getString('mensagem');
        
        try {
          let result;
          
          switch (action) {
            case 'list':
              result = await listServerEmojis(interaction.guild);
              break;
            case 'stats':
              result = await getEmojiStats(interaction.guild);
              break;
            case 'detect':
              result = await detectAllEmojis(messageContent || 'Nenhuma mensagem fornecida');
              break;
            default:
              throw new Error('Ação inválida');
          }
          
          await interaction.editReply({ embeds: [result] });
        } catch (error) {
          console.error('Erro no gerenciamento de emojis:', error);
          await interaction.editReply({
            content: '❌ **Erro ao gerenciar emojis!** Tente novamente mais tarde.'
          });
        }
        break;
      }

      default:
        await interaction.reply({
          content: '❌ Comando não encontrado!',
          flags: 64
        });
    }
  } catch (error) {
    console.error('❌ Erro ao processar comando:', error);
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: '❌ Ocorreu um erro ao executar este comando!',
          flags: 64 
        });
      } else {
        await interaction.reply({ 
          content: '❌ Ocorreu um erro ao executar este comando!',
          flags: 64 
        });
      }
    } catch (replyError) {
      console.error('❌ Erro ao responder erro:', replyError);
    }
  }
}

// Sistema de cooldown para comando "cl"
const clCooldowns = new Map();

// Listener para comando "cl" (purge de mensagens do usuário)
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  
  // Sistema CL aprimorado com configurações
  const config = getServerConfig(message.guild.id);
  const content = message.content.trim().toLowerCase();
  
  // Verificar se é comando CL (incluindo personalizados)
  const isCLCommand = content === 'cl' || config.clSystem.customTriggers.includes(content);
  
  if (isCLCommand && config.clSystem.enabled) {
    try {
      // Verificar permissões de usuário
      const userId = message.author.id;
      const member = message.member;
      
      // Verificar se usuário tem permissão para usar CL
      const hasPermission = member?.permissions.has('ManageMessages') || 
                           config.clSystem.allowedUsers.includes(userId) ||
                           config.clSystem.allowedRoles.some(roleId => member?.roles.cache.has(roleId));
      
      if (!hasPermission) {
        await message.react('❌');
        return;
      }
      
      // Verificar cooldown (30 segundos)
      const now = Date.now();
      const cooldownTime = clCooldowns.get(userId);
      
      if (cooldownTime && now < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - now) / 1000);
        await message.reply(`⏰ Aguarde ${timeLeft}s antes de usar "cl" novamente.`);
        return;
      }
      
      // Verificar se o bot tem permissões necessárias
      const botMember = message.guild.members.me;
      if (!botMember?.permissions.has(['ManageMessages', 'ReadMessageHistory', 'AddReactions'])) {
        await message.reply('❌ Não tenho permissões necessárias (Gerenciar Mensagens, Histórico de Mensagens, Adicionar Reações).');
        return;
      }
      
      // Reagir com emoji de limpeza
      await message.react('🧹');
      
      // Apagar a própria mensagem do comando se configurado
      if (config.clSystem.deleteOwnMessage) {
        try {
          await message.delete();
        } catch (error) {
          console.error('Erro ao deletar mensagem do comando CL:', error);
        }
      }
      
      // Definir cooldown
      clCooldowns.set(userId, now + 30000); // 30 segundos
      
      // Verificar se é um canal de texto onde podemos deletar mensagens
      if (!('bulkDelete' in message.channel)) {
        await message.reply('❌ Comando "cl" só funciona em canais de texto do servidor.');
        return;
      }
      
      const channel = message.channel as TextChannel;
      const authorId = message.author.id;
      const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let lastMessageId = message.id;
      const maxMessages = 1000; // Limite para evitar spam
      
      while (deletedCount < maxMessages) {
        const fetchedMessages = await channel.messages.fetch({
          limit: 100,
          before: lastMessageId
        });
        
        if (fetchedMessages.size === 0) break;
        
        // Filtrar mensagens do usuário que não sejam mais antigas que 14 dias
        const userMessages = fetchedMessages.filter(msg => 
          msg.author.id === authorId && 
          msg.createdTimestamp > fourteenDaysAgo
        );
        
        if (userMessages.size === 0) {
          const lastMessage = fetchedMessages.last();
          if (!lastMessage?.id) break;
          lastMessageId = lastMessage.id;
          continue;
        }
        
        // Deletar mensagens em lote
        try {
          if (userMessages.size === 1) {
            await userMessages.first()?.delete();
            deletedCount += 1;
          } else {
            await channel.bulkDelete(userMessages);
            deletedCount += userMessages.size;
          }
        } catch (bulkError) {
          console.error('Erro ao deletar mensagens em lote:', bulkError);
          // Tentar deletar individualmente
          for (const msg of userMessages.values()) {
            try {
              await msg.delete();
              deletedCount++;
            } catch (individualError) {
              console.error('Erro ao deletar mensagem individual:', individualError);
            }
          }
        }
        
        const lastMessage = fetchedMessages.last();
        if (!lastMessage?.id) break;
        lastMessageId = lastMessage.id;
        
        // Pequeno delay para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Mensagem de confirmação temporária
      const confirmMsg = await channel.send(`🧹 **${deletedCount} mensagens** de ${message.author} foram apagadas!`);
      setTimeout(() => {
        confirmMsg.delete().catch(() => {});
      }, 5000);
      
    } catch (error) {
      console.error('Erro no comando cl:', error);
      await message.reply('❌ Erro ao executar limpeza de mensagens!').catch(() => {});
    }
  }
});

// Função para análise de conta alt
async function analyzeUserForAlt(user: User, guild: Guild | null) {
  const factors = [];
  let score = 0;
  
  // Analisar idade da conta
  const accountAge = Date.now() - user.createdTimestamp;
  const daysSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24));
  
  if (daysSinceCreation < 7) {
    factors.push('🔴 Conta muito nova (< 7 dias)');
    score += 40;
  } else if (daysSinceCreation < 30) {
    factors.push('🟡 Conta nova (< 30 dias)');
    score += 25;
  } else if (daysSinceCreation < 90) {
    factors.push('🟡 Conta relativamente nova (< 90 dias)');
    score += 10;
  }
  
  // Verificar avatar padrão
  if (!user.avatar) {
    factors.push('🔴 Usando avatar padrão');
    score += 20;
  }
  
  // Verificar nome suspeito (muitos números)
  const numberCount = (user.username.match(/\d/g) || []).length;
  if (numberCount > user.username.length / 2) {
    factors.push('🟡 Nome com muitos números');
    score += 15;
  }
  
  // Verificar padrões de nome suspeitos
  if (/^[a-z]+\d{4,}$/.test(user.username.toLowerCase())) {
    factors.push('🔴 Padrão de nome suspeito (letras + números)');
    score += 25;
  }
  
  // Verificar se tem badges
  if (user.flags?.toArray().length && user.flags.toArray().length > 0) {
    factors.push('🟢 Tem badges (menos suspeito)');
    score -= 15;
  }
  
  // Se está no servidor, verificar atividade
  if (guild) {
    const member = guild.members.cache.get(user.id);
    if (member) {
      const joinedTimestamp = member.joinedTimestamp;
      if (joinedTimestamp) {
        const joinedAge = Date.now() - joinedTimestamp;
        const daysSinceJoin = Math.floor(joinedAge / (1000 * 60 * 60 * 24));
      
        if (daysSinceJoin < 1) {
          factors.push('🟡 Entrou no servidor recentemente');
          score += 10;
        }
      }
      
      if (member.roles.cache.size <= 1) {
        factors.push('🟡 Sem roles no servidor');
        score += 10;
      }
    }
  }
  
  // Determinar nível de risco
  let riskLevel, verdict;
  if (score >= 60) {
    riskLevel = 'HIGH';
    verdict = '🔴 **ALTA** probabilidade de ser alt account';
  } else if (score >= 30) {
    riskLevel = 'MEDIUM';
    verdict = '🟡 **MÉDIA** probabilidade de ser alt account';
  } else {
    riskLevel = 'LOW';
    verdict = '🟢 **BAIXA** probabilidade de ser alt account';
  }
  
  return {
    riskLevel,
    score: Math.max(0, Math.min(100, score)),
    verdict,
    factors: factors.length > 0 ? factors : ['🟢 Nenhum fator suspeito detectado']
  };
}

// Função para listar emojis do servidor
async function listServerEmojis(guild: Guild | null) {
  if (!guild) throw new Error('Guild não encontrada');
  
  const emojis = guild.emojis.cache;
  const totalEmojis = emojis.size;
  const animatedEmojis = emojis.filter(emoji => emoji.animated).size;
  const staticEmojis = totalEmojis - animatedEmojis;
  
  let description = `**Total:** ${totalEmojis} emojis\n`;
  description += `**Estáticos:** ${staticEmojis}\n`;
  description += `**Animados:** ${animatedEmojis}\n\n`;
  
  if (totalEmojis > 0) {
    const emojiList = emojis.first(20).map(emoji => 
      `${emoji} \`:${emoji.name}:\``
    ).join(' ');
    description += `**Primeiros 20 emojis:**\n${emojiList}`;
    
    if (totalEmojis > 20) {
      description += `\n\n*... e mais ${totalEmojis - 20} emojis*`;
    }
  } else {
    description += '*Nenhum emoji personalizado encontrado*';
  }
  
  return {
    color: 0xffcc4d,
    title: '📋 Lista de Emojis do Servidor',
    description,
    footer: { text: `Servidor: ${guild.name}` },
    timestamp: new Date().toISOString()
  };
}

// Função para estatísticas de emojis
async function getEmojiStats(guild: Guild | null) {
  if (!guild) throw new Error('Guild não encontrada');
  
  const emojis = guild.emojis.cache;
  const totalSlots = guild.premiumTier >= 2 ? 150 : guild.premiumTier >= 1 ? 100 : 50;
  const animatedSlots = totalSlots;
  
  const staticEmojis = emojis.filter((emoji: any) => !emoji.animated);
  const animatedEmojis = emojis.filter((emoji: any) => emoji.animated);
  
  return {
    color: 0x7289da,
    title: '📊 Estatísticas de Emojis',
    fields: [
      {
        name: '📈 Uso de Slots',
        value: [
          `**Estáticos:** ${staticEmojis.size}/${totalSlots}`,
          `**Animados:** ${animatedEmojis.size}/${animatedSlots}`,
          `**Total:** ${emojis.size}/${totalSlots * 2}`
        ].join('\n'),
        inline: true
      },
      {
        name: '🎭 Detalhes',
        value: [
          `**Nível do servidor:** ${guild.premiumTier || 0}`,
          `**Boost count:** ${guild.premiumSubscriptionCount || 0}`,
          `**Slots máximos:** ${totalSlots} cada tipo`
        ].join('\n'),
        inline: true
      }
    ],
    footer: { text: `Servidor: ${guild.name}` },
    timestamp: new Date().toISOString()
  };
}

// Função para detectar todos os emojis em uma mensagem
async function detectAllEmojis(text: string) {
  const results: {
    customEmojis: Array<{name: string, id: string, format: string}>,
    animatedEmojis: Array<{name: string, id: string, format: string}>,
    unicodeEmojis: string[]
  } = {
    customEmojis: [],
    animatedEmojis: [],
    unicodeEmojis: []
  };
  
  // Detectar emojis customizados estáticos
  const customEmojiRegex = /<:(\w+):(\d+)>/g;
  let match;
  while ((match = customEmojiRegex.exec(text)) !== null) {
    results.customEmojis.push({
      name: match[1],
      id: match[2],
      format: match[0]
    });
  }
  
  // Detectar emojis animados
  const animatedEmojiRegex = /<a:(\w+):(\d+)>/g;
  while ((match = animatedEmojiRegex.exec(text)) !== null) {
    results.animatedEmojis.push({
      name: match[1],
      id: match[2],
      format: match[0]
    });
  }
  
  // Detectar emojis unicode básicos (alguns dos mais comuns)
  const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
  
  const unicodeMatches: string[] = [];
  for (const emoji of commonEmojis) {
    if (text.includes(emoji)) {
      unicodeMatches.push(emoji);
    }
  }
  
  if (unicodeMatches.length > 0) {
    results.unicodeEmojis = [...new Set(unicodeMatches)]; // remover duplicatas
  }
  
  const totalFound = results.customEmojis.length + results.animatedEmojis.length + results.unicodeEmojis.length;
  
  let description = `**Texto analisado:** ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n\n`;
  description += `**Total encontrado:** ${totalFound} emojis\n\n`;
  
  if (results.customEmojis.length > 0) {
    description += `**🎨 Emojis Customizados (${results.customEmojis.length}):**\n`;
    description += results.customEmojis.map(e => `\`${e.format}\` (${e.name})`).join(', ') + '\n\n';
  }
  
  if (results.animatedEmojis.length > 0) {
    description += `**✨ Emojis Animados (${results.animatedEmojis.length}):**\n`;
    description += results.animatedEmojis.map(e => `\`${e.format}\` (${e.name})`).join(', ') + '\n\n';
  }
  
  if (results.unicodeEmojis.length > 0) {
    description += `**🌍 Emojis Unicode (${results.unicodeEmojis.length}):**\n`;
    description += results.unicodeEmojis.join(' ') + '\n\n';
  }
  
  if (totalFound === 0) {
    description += '*Nenhum emoji encontrado no texto fornecido*';
  }
  
  return {
    color: 0xf39c12,
    title: '🔍 Detector de Emojis',
    description,
    timestamp: new Date().toISOString()
  };
}

});

client.on('error', (error) => {
  console.error('❌ Erro do cliente Discord:', error);
});

// Iniciar bot
console.log('🤖 Iniciando bot Discord...');
client.login(BOT_TOKEN).catch((error) => {
  console.error('❌ Erro ao fazer login:', error);
  process.exit(1);
});