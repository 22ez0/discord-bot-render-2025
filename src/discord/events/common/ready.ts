import { createEvent } from "#base";
import { handleVoiceAndStatus } from "../../commands/public/VoiceHandler.js";
import { setupPrefixCommands } from "../../commands/public/prefixCommands.js";
import { Client } from "discord.js";

createEvent({
    name: "Voice and Status Handler",
    event: "clientReady",
    once: true,
    async run(client: Client<true>) {
        console.log("🎵 Inicializando funcionalidade de voice...");
        // Iniciar funcionalidade de voice e status
        handleVoiceAndStatus(client);
        
        console.log("🛠️ Configurando comandos de prefix...");
        // Configurar comandos com prefix (e?limpar)
        setupPrefixCommands(client);
    },
});