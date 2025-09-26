import fs from "fs";
import path from "path";
import { Client, Collection } from "discord.js";

// Extend Client type to include commands property for legacy compatibility
interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

export async function loadCommands(client: Client) {
  // Initialize commands collection if it doesn't exist
  const extendedClient = client as ExtendedClient;
  if (!extendedClient.commands) {
    extendedClient.commands = new Collection();
  }
  const commandsPath = path.join(__dirname, "../commands");

  function readDirRecursive(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(readDirRecursive(fullPath));
      } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const files = readDirRecursive(commandsPath);

  for (const file of files) {
    try {
      const cmdModule = await import(file);
      const command = cmdModule.default;
      if (command?.name) {
        extendedClient.commands.set(command.name, command);
        console.log(`✅ Comando carregado: ${command.name}`);
      }
    } catch (err) {
      console.error(`❌ Falha ao carregar comando ${file}:`, err);
    }
  }
}
