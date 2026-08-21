import { toSmallCaps, glyphs } from '../../utils/font.js';
import { ANTIGRAVITY_MODELS } from '../../lib/antigravity.js';

export default {
  name: 'agymenu',
  aliases: ['antigravity', 'aghelp', 'agymodels'],
  category: 'ai',
  description: 'Daftar lengkap 35+ perintah ekosistem Google Antigravity Agent & CLI',
  async run({ m, usedPrefix }) {
    await m.react('✦');

    let text = `┌───〔 ${glyphs.diamond} *${toSmallCaps('google antigravity engine')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('platform')}:* Google DeepMind Antigravity\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('cli version')}:* agy v2.0 (ESM Engine)\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('multimodal')}:* Vision, Code, Context 1M\n`;
    text += `└────────────────────\n\n`;

    text += `┌───〔 ${glyphs.sparkle} *${toSmallCaps('otentikasi & sesi')}* 〕\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agylogin\` / \`/login\` - ${toSmallCaps('dapatkan link otorisasi google')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agytoken <token>\` / \`/token\` - ${toSmallCaps('aktifkan token / api key')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agylogout\` / \`/logout\` - ${toSmallCaps('hapus sesi otentikasi')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agystatus\` / \`/status\` - ${toSmallCaps('cek status sesi & memori')}\n`;
    text += `└────────────────────\n\n`;

    text += `┌───〔 ${glyphs.hexagon} *${toSmallCaps('ai & vision agent')}* 〕\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agy <tanya>\` - ${toSmallCaps('tanya antigravity / kirim foto')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agyvision <prompt>\` - ${toSmallCaps('analisis gambar / foto / dokumen')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agysystem <prompt>\` - ${toSmallCaps('atur persona system instruction')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agyclear\` / \`/reset\` - ${toSmallCaps('reset riwayat memori konteks')}\n`;
    text += `└────────────────────\n\n`;

    text += `┌───〔 ${glyphs.box} *${toSmallCaps('model & token usage')}* 〕\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agymodel\` / \`/model\` - ${toSmallCaps('ganti model ai (pro / flash)')}\n`;
    text += `│ ${glyphs.arrow} \`${usedPrefix}agyusage\` / \`/usage\` - ${toSmallCaps('lihat statistik token & kuota')}\n`;
    text += `└────────────────────\n\n`;

    text += `┌───〔 ${glyphs.star} *${toSmallCaps('daftar model aktif')}* 〕\n`;
    ANTIGRAVITY_MODELS.forEach((model, i) => {
      text += `│ ${i + 1}. *${model.name}* [${model.tier}]\n│    ${glyphs.arrow} \`${model.id}\`\n`;
    });
    text += `└────────────────────\n\n`;

    text += `_› ${toSmallCaps('sesi login tersimpan permanen di database sampai kamu /logout.')}_`;

    await m.reply(text.trim());
  }
};
