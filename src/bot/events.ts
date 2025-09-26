import { Client } from 'discord.js';
import { BaseCommandHandlers } from '../discord/base/commands/handlers.js';
import { BaseResponderHandlers } from '../discord/base/responders/handlers.js';

export async function loadEvents(client: Client) {
  console.log('🔄 Carregando eventos...');

  // Event handler completo para todas as interações
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isAutocomplete()) {
        await BaseCommandHandlers.autocomplete(interaction);
        return;
      }
      
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        await BaseCommandHandlers.command(interaction);
        return;
      }
      
      // Manipular apenas component interactions (botões, selects, modais, etc.)
      if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
        await BaseResponderHandlers.handler(interaction);
        return;
      }
    } catch (error) {
      console.error('❌ Erro ao processar interação:', error);
      
      // Só responder para interações que suportam resposta
      if (interaction.isRepliable()) {
        const errorMsg = '❌ Ocorreu um erro ao processar sua solicitação!';
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMsg, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMsg, ephemeral: true });
          }
        } catch (replyError) {
          console.error('❌ Erro ao responder erro:', replyError);
        }
      }
    }
  });

  // Event handler para quando o bot está pronto
  client.on('ready', () => {
    console.log(`✅ Bot online como ${client.user?.tag}!`);
    console.log(`📊 Comandos carregados: ${client.commands.size}`);
  });

  // Error handler
  client.on('error', (error) => {
    console.error('❌ Erro do cliente Discord:', error);
  });

  console.log('✅ Eventos carregados!');
}