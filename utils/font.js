/**
 * 🔤 UNICODE SMALL CAPS & MODERN MINIMALIST UI STYLING ENGINE
 * Mengubah teks menjadi font Small Caps estetik (ᴘᴀᴋᴇ ꜰᴏɴᴛ ꜱᴇᴘᴇʀᴛɪ ɪɴɪ)
 * Dilengkapi dengan koleksi ikon unik langka, clean borders, dan layout modern tanpa spam emoji.
 */

const SMALL_CAPS_MAP = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
  A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ꜰ', G: 'ɢ', H: 'ʜ', I: 'ɪ',
  J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ', Q: 'ǫ', R: 'ʀ',
  S: 'ꜱ', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x', Y: 'ʏ', Z: 'ᴢ'
};

/**
 * Konversi string standar ke Small Caps (ᴘᴀᴋᴇ ꜰᴏɴᴛ ꜱᴇᴘᴇʀᴛɪ ɪɴɪ)
 */
export function toSmallCaps(text) {
  if (typeof text !== 'string') return text;
  return text
    .split('')
    .map(char => SMALL_CAPS_MAP[char] || char)
    .join('');
}

/**
 * Alias singkat
 */
export const font = toSmallCaps;

/**
 * Koleksi simbol & glif unik langka (Modern Minimalist Typography)
 */
export const glyphs = {
  bullet: '•',
  arrow: '›',
  doubleArrow: '»',
  diamond: '◈',
  openDiamond: '◇',
  sparkle: '✦',
  star: '✧',
  hexagon: '⬡',
  fillHex: '⬢',
  box: '■',
  openBox: '□',
  circle: '●',
  openCircle: '○',
  divider: '─',
  doubleDivider: '═',
  cornerTL: '┌',
  cornerBL: '└',
  pipe: '│',
  branch: '├',
  rhombus: '⟡',
  check: '✓',
  cross: '✕',
  wave: '〜',
  slash: '╱',
  pipeThick: '▌',
  hash: '⌗',
  ring: '◎',
  infinite: '∞'
};

/**
 * Layout Generator: Header Box Estetik Minimalis
 */
export function renderHeader(title, subtitle = '') {
  const styledTitle = toSmallCaps(title);
  let res = `┌───〔 ${glyphs.diamond} *${styledTitle}* 〕\n`;
  if (subtitle) {
    res += `│ ${glyphs.arrow} _${toSmallCaps(subtitle)}_\n`;
  }
  return res;
}

/**
 * Layout Generator: Baris Item Konten
 */
export function renderRow(label, value) {
  const styledLabel = toSmallCaps(label);
  return `│ ${glyphs.arrow} *${styledLabel}:* ${value}\n`;
}

/**
 * Layout Generator: Penutup Box
 */
export function renderFooter(customText = '') {
  if (customText) {
    return `└────────────────────\n_› ${toSmallCaps(customText)}_\n`;
  }
  return `└────────────────────\n`;
}

/**
 * Layout Generator: Card Box Utuh
 */
export function renderCard(title, rows = [], footerText = '') {
  let output = renderHeader(title);
  for (const [label, val] of rows) {
    output += renderRow(label, val);
  }
  output += renderFooter(footerText);
  return output.trim();
}

/**
 * Format Pesan Sistem / Notifikasi Standar dengan Small Caps & Glyph Bersih
 */
export function formatSystemMessage(type, message, detail = '') {
  const styledMsg = toSmallCaps(message);
  let icon = glyphs.rhombus;
  
  if (type === 'error') icon = glyphs.cross;
  else if (type === 'success') icon = glyphs.check;
  else if (type === 'wait') icon = glyphs.sparkle;
  else if (type === 'warning') icon = glyphs.diamond;

  let text = `${icon} *${styledMsg}*`;
  if (detail) {
    text += `\n${glyphs.pipe} _${toSmallCaps(detail)}_`;
  }
  return text;
}

// Global expose agar bisa diakses di manapun secara instan
global.toSmallCaps = toSmallCaps;
global.font = toSmallCaps;
global.glyphs = glyphs;

export default {
  toSmallCaps,
  font,
  glyphs,
  renderHeader,
  renderRow,
  renderFooter,
  renderCard,
  formatSystemMessage
};
