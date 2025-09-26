import { bootstrap } from "#base";
import { startServer } from "./server.js";

// Adicionar handlers para erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Não sair do processo - apenas logar
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Não sair do processo - apenas logar
});

// Aguardar um pouco para garantir estabilidade
await new Promise(resolve => setTimeout(resolve, 1000));

// Iniciar servidor HTTP para health check
console.log('🚀 Iniciando servidor HTTP...');
startServer();

// Aguardar um pouco antes de inicializar o Discord
await new Promise(resolve => setTimeout(resolve, 2000));

// Iniciar bot Discord
console.log('🤖 Iniciando bot Discord...');
await bootstrap({ meta: import.meta });
