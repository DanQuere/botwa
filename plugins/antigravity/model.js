import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity, { ANTIGRAVITY_MODELS } from '../../lib/antigravity.js';

export default {
  name: 'agymodel',
  aliases: ['model', 'setmodel', 'agymodelswitch'],
  category: 'ai',
  description: 'Melihat dan mengganti model AI resmi Google Antigravity CLI (agy models)',
  async run({ m, q, usedPrefix, command }) {
    const session = antigravity.getSession(m.sender);

    if (!q) {
      let list = `┌───〔 ${glyphs.diamond} *${toSmallCaps('model antigravity aktif')}* 〕\n`;
      list += `│ ${glyphs.arrow} *${toSmallCaps('model saat ini')}:* \`${session.model}\`\n`;
      list += `├────────────────────\n`;
      list += `│ *${toSmallCaps('daftar model resmi agy')}:*\n`;

      ANTIGRAVITY_MODELS.forEach((mod, idx) => {
        const isCurrent = mod.id.toLowerCase() === session.model.toLowerCase() ? ' [AKTIF]' : '';
        list += `│ ${idx + 1}. *${mod.name}* [${mod.tier}]${isCurrent}\n`;
        list += `│    ${glyphs.arrow} \`${usedPrefix + command} ${mod.id}\`\n`;
        list += `│    _${toSmallCaps(mod.desc)}_\n`;
      });
      list += `└────────────────────\n` +
        `_› ${toSmallCaps('kamu bisa bebas berganti ke gemini 3.7 flash, claude sonnet, atau gemini 3.1 pro!')}_`;

      return m.reply(list);
    }

    const targetModel = q.trim().toLowerCase();
    const switched = antigravity.setModel(m.sender, targetModel);

    if (!switched) {
      return m.reply(
        `✕ *${toSmallCaps('model tidak ditemukan.')}*\n\n_› ${toSmallCaps(`ketik ${usedPrefix + command} untuk melihat daftar model yang valid.`)}_`
      );
    }

    await m.react('✦');

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('model berhasil diganti')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('nama model')}:* ${switched.name}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('model id')}:* \`${switched.id}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('tier')}:* ${switched.tier}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('keterangan')}:* ${toSmallCaps(switched.desc)}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
