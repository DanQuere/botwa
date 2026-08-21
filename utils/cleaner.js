import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import logger from './logger.js';
import settings from '../settings.js';

/**
 * Membersihkan file session sampah (pre-key, sender-key lama, app-state)
 * PENTING: File `creds.json` TIDAK PERNAH DIHAPUS agar bot tidak logout!
 */
export function cleanSessionFiles(sessionDir = settings.sessionDir || './sessions') {
  const resolvedDir = path.resolve(sessionDir);
  if (!fs.existsSync(resolvedDir)) {
    return { cleanedCount: 0, freedBytes: 0 };
  }

  let cleanedCount = 0;
  let freedBytes = 0;

  try {
    const files = fs.readdirSync(resolvedDir);
    const now = Date.now();
    const maxAgeMs = 24 * 60 * 60 * 1000; // Hanya bersihkan file sementara/temp yang lebih lama dari 24 jam

    for (const file of files) {
      // JANGAN PERNAH HAPUS creds.json atau key aktif yang dibutuhkan libsignal untuk dekripsi
      if (file === 'creds.json' || file.startsWith('session-') || file.startsWith('pre-key-') || file.startsWith('sender-key-')) {
        continue;
      }

      // Hapus hanya file temporary sampah (.tmp)
      if (file.endsWith('.tmp') || file.startsWith('app-state-sync-version-')) {
        const filePath = path.join(resolvedDir, file);
        try {
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > maxAgeMs || file.endsWith('.tmp')) {
            freedBytes += stat.size;
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        } catch (e) {}
      }
    }

    if (cleanedCount > 0) {
      const kbFreed = (freedBytes / 1024).toFixed(2);
      logger.info(chalk.green(`[Auto-Clean] 🧹 Berhasil membersihkan ${cleanedCount} file junk session (${kbFreed} KB dibebaskan).`));
    }
  } catch (err) {
    logger.error(`[Auto-Clean] Gagal membersihkan session: ${err.message}`);
  }

  return { cleanedCount, freedBytes };
}

/**
 * Memulai interval auto-clean session
 */
export function startAutoClearSession(sessionDir = settings.sessionDir, intervalMs = settings.clearSessionIntervalMs) {
  if (!settings.autoClearSession) return null;

  const interval = intervalMs || (6 * 60 * 60 * 1000); // default 6 jam

  // Jalankan sekali saat startup
  cleanSessionFiles(sessionDir);

  // Jadwalkan berkala
  const timer = setInterval(() => {
    cleanSessionFiles(sessionDir);
  }, interval);

  return timer;
}

export default {
  cleanSessionFiles,
  startAutoClearSession
};
