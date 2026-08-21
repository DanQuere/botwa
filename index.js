import './settings.js';
import chalk from 'chalk';
import { connectToWhatsApp } from './lib/connection.js';
import handler from './lib/handler.js';
import db from './database/index.js';
import logger from './utils/logger.js';
import settings from './settings.js';

console.log(chalk.bold.cyan(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║           🚀 WHATSAPP BOT BAILEYS 7.0.0-rc14       ║
║             Modern ESM Modular Architecture        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`));

async function main() {
  try {
    logger.info(chalk.blue(`Memulai inisialisasi ${settings.botName}...`));

    // 1. Load dynamic plugins
    await handler.loadPlugins();

    // 2. Initialize connection
    const sock = await connectToWhatsApp();

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      logger.info(chalk.yellow(`\n[System] Menerima sinyal ${signal}. Menutup proses dengan aman...`));
      db.saveSync();
      try {
        if (sock && typeof sock.end === 'function') {
          sock.end(new Error('Process terminated'));
        }
      } catch {}
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Global Error Handlers to prevent crash
    process.on('uncaughtException', (err) => {
      logger.error(`[Uncaught Exception] ${err.stack || err.message}`);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`[Unhandled Rejection] at: ${promise} reason: ${reason}`);
    });

  } catch (err) {
    logger.error(`[Fatal Error] Gagal memulai bot: ${err.stack || err.message}`);
    process.exit(1);
  }
}

main();
