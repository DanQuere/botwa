import os from 'os';
import { formatDuration, formatSize } from '../../utils/format.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import config from '../../config/config.js';

export default {
  name: 'runtime',
  aliases: ['uptime', 'serverinfo', 'botinfo'],
  category: 'main',
  description: 'Menampilkan runtime dan spesifikasi server bot',
  async run({ m }) {
    const uptime = formatDuration(process.uptime() * 1000);
    const osUptime = formatDuration(os.uptime() * 1000);
    const totalMem = formatSize(os.totalmem());
    const freeMem = formatSize(os.freemem());
    const usedMem = formatSize(os.totalmem() - os.freemem());
    const cpus = os.cpus();
    const cpuModel = cpus && cpus.length ? cpus[0].model.trim() : 'Generic CPU';

    let text = `┌───〔 ⚡ *${toSmallCaps('informasi server & runtime')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('bot uptime')}:* ${uptime}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('system uptime')}:* ${osUptime}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('os platform')}:* ${os.platform()} (${os.arch()})\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('node version')}:* ${process.version}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('ram terpakai')}:* ${usedMem} / ${totalMem}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('ram bebas')}:* ${freeMem}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('cpu')}:* ${cpus.length} Core (${cpuModel})\n`;
    text += `└────────────────────\n\n`;
    text += `_› ${toSmallCaps(config.botName + ' berjalan dengan lancar dan optimal.')}_`;

    await m.reply(text.trim());
  }
};
