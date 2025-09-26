import { brBuilder } from "@magicyan/discord";
import { logger } from "./base.logger.js";
import { CommandManager } from "./commands/manager.js";
import { ResponderManager } from "./responders/manager.js";
import { EventManager } from "./events/manager.js";
export class Constatic {
    constructor() {
        this.events = new EventManager();
        this.commands = new CommandManager();
        this.responders = new ResponderManager();
        this.config = {
            commands: {},
            events: {},
            responders: {
                onError: async (error, interaction, _params) => {
                    console.error('Erro no responder:', error);
                    try {
                        const errorMessage = '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente em alguns momentos.';
                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({
                                content: errorMessage,
                                flags: 64
                            });
                        }
                        else {
                            await interaction.reply({
                                content: errorMessage,
                                flags: 64
                            });
                        }
                    }
                    catch (err) {
                        console.error('Erro ao enviar mensagem de erro:', err);
                    }
                },
                onNotFound: async (interaction) => {
                    try {
                        const notFoundMessage = '⚠️ Esta ação não está mais disponível ou não foi reconhecida.';
                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({
                                content: notFoundMessage,
                                flags: 64
                            });
                        }
                        else {
                            await interaction.reply({
                                content: notFoundMessage,
                                flags: 64
                            });
                        }
                    }
                    catch (err) {
                        console.error('Erro ao enviar mensagem de não encontrado:', err);
                    }
                }
            },
        };
    }
    static getInstance() {
        if (!Constatic.instance) {
            Constatic.instance = new Constatic();
        }
        return Constatic.instance;
    }
    printLoadLogs() {
        logger.log(brBuilder(...this.commands.logs, ...this.responders.logs, ...this.events.logs));
    }
}
Constatic.instance = null;
