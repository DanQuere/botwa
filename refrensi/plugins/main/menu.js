import { getCaseCount, getCasesByCategory } from "../../case/rimuru.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import _sharp from "sharp";
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/rimuru-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/rimuru-plugins.js";
import { getDatabase } from "../../src/lib/rimuru-database.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
  category: "main",
  description: "Menampilkan menu utama bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  religi: "☪️",
  islamic: "🕌",
  info: "ℹ️",
  cek: "📁",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  jpm: "📨",
  anime: "🍥",
  asupan: "🎞️",
  clan: "⚔️",
  convert: "🔄",
  berita: "📰",
  rpg: "🗡️",
  nsfw: "🔞",
  linode: "☁️",
  primbon: "🔮",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️",
  vps: "🌊",
  panel: "🖥️"
};
function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ꜰ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "𝗣",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store"
  ];
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(
  m,
  botConfig,
  db,
  uptime,
  botMode = "md",
  useBracketBoxStyle = false,
) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/rimuru-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
  const casesByCategory = getCasesByCategory();
  const totalFeatures = totalCommands + totalCases;
  let userRole = "User",
    roleEmoji = "👤";
  if (m.isOwner) {
    userRole = "Owner";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  let txt = `${greeting}\n\n`;
  txt += `      ${m.pushName || "User"}\n\n`;
  txt += `Halo Kawan 🌱\n`;
  txt += `Perkenalkan aku ${botConfig.bot?.name || "Denia Al"}, buatan ${botConfig.bot?.developer || "Alesha"} Saya siap membantu\n`;
  txt += `kebutuhanmu, mulai dari download\n`;
  txt += `video, main game, tanya jawab, nyari\n`;
  txt += `info/sesuatu, bikin sticker, dan lain-lain.\n\n`;

  txt += `    ᯓ INFO USER\n`;
  txt += `╭   • Nama : ${m.pushName || "User"}\n`;
  txt += `┆   • Status : ${userRole}\n`;
  txt += `┆   • Mode : ${(botConfig.mode || "public").toUpperCase()}\n`;
  txt += `┆   • Nomor : ${m.sender.split("@")[0]}\n`;
  txt += `┆   • Waktu : ${timeStr} WIB\n`;
  txt += `╰➤------------------------------\n`;

  txt += `    ᯓ INFO BOT\n`;
  txt += `╭  • Name : ${botConfig.bot?.name || "rimuru-AI"}\n`;
  txt += `┆  • Author : ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `┆  • Versi : ${botConfig.bot?.version || "1.2.0"}\n`;
  txt += `┆  • Type script : rimuru x ${botConfig.bot?.developer || "Owner"}\n`;
  txt += `┆  • Uptime : ${uptimeFormatted}\n`;
  txt += `╰➤------------------------------\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  try {
    const botmodePlugin = await import("../group/botmode.js");
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) { }
  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];
  const categoryLines = [];
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (categoryLines.length > 0) {
    txt += ` ✦ DAFTAR MENU ✦\n`;
    txt += `╭   • ${categoryLines[0]}\n`;
    for (let i = 1; i < categoryLines.length; i++) {
      txt += `┆   • ${categoryLines[i]}\n`;
    }
    txt += `╰➤------------------------------\n`;
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "🤖") {
  let text = `╭─〔 ${emoji} \`${title}\`〕─⬣\n`;
  for (const line of lines) {
    text += `│ ✦ *${line}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "rimuru-AI";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "rimuru-AI",
      body: `BOT WHATSAPP MULTI DEVICE`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
}
function getVerifiedQuoted(botConfig, m) {
  if (m) {
    return {
      key: {
        participant: `${m.sender}`,
        remoteJid: `status@broadcast`,
      },
      message: {
        contactMessage: {
          displayName: `🍂 Yth. ${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };
  }
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🪸 ${botConfig.bot?.name}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = [1, 2].includes(Number(savedVariant))
    ? Number(savedVariant)
    : ([1, 2].includes(Number(botConfig.ui?.menuVariant)) ? Number(botConfig.ui.menuVariant) : 2);
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(
    m,
    botConfig,
    db,
    uptime,
    botMode,
    menuVariant === 9,
  );

  let imageBuffer = null;
  let thumbBuffer = null;
  let videoBuffer = null;

  try {
    imageBuffer = fs.readFileSync(botConfig.assets["rimuru"])
    thumbBuffer = fs.readFileSync(botConfig.assets["rimuru2"])
  } catch (e) {
    console.error("Gagal load assets:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "rimuru-AI";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const totalCases = getCaseCount();
  const totalFeatures = totalCmds + totalCases;
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const user = await db.getUser(m.sender) || {}
  try {
    const categories = getSortedCategories(m, botMode);
    const zann_pengin_rehat = categories.sorted.map(({ cat, cmds, emoji }) => {
      const caseCount = (getCasesByCategory()[cat] || []).length;
      const total = cmds.length + caseCount;
      return {
        title: `${emoji} ${toMonoUpperBold(cat)}`,
        description: `Command ini memiliki (${total}) Perintah`,
        id: `${m.prefix}menucat ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["rimuru"]),
            caption: ``,
            footer: `Hai @${m.pushName} 👋
            
🌿 Selamat datang di assistant ${config.bot?.name}

╭┈┈⫹⫺ *INFORMASI BOT* ⫹⫺┈┈╮
│ ◈ *Nama Bot* : *${config.bot?.name}*
│ ◈ *Versi* : *${config.bot.version}*  
│ ◈ *Pengembang* : *${config.bot.developer}*  
│ ◈ *Pustaka* : \`rimuru-baileys\`
╰┈┈┈┈┈┈┈┈

╭┈┈⫹⫺ *INFORMASI PENGGUNA* ⫹⫺┈┈╮
│ ◈ *Nama* : *${m.pushName}*
│ ◈ *Member?* : *${m?.isOwner ? "Bukan, tapi Owner" : m?.isPremium ? "Bukan, tapi Premium" : "Iyapp"}*
│ ◈ *Level* : *${user.level || 0}*
│ ◈ *Exp* : *${user.exp || 0}* 
│ ◈ *Energi* : *${user.energi || 0}*
│ ◈ *Koin* : *${user.koin || 0}*
│ ◈ *Register* : *${user.isRegistered ? "Sudah" : "Belum"}*
│ ◈ *Energi* : *${user.energi || 0}*
╰┈┈┈┈┈┈┈┈

Tekan tombol dibawah untuk info lebih lanjut dan untuk memilih kategori
`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🍃 Menu Utama",
                  sections: [
                    {
                      title: "Berikut adalah pilihan nya",
                      rows: zann_pengin_rehat
                    }
                  ],
                  icon: "DEFAULT"
                })
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "Selengkapnya",
                  sections: [
                    {
                      title: "Berikut adalah pilihan nya",
                      rows: [
                        {
                          title: "🍔 Lihat semua menu yang ada di bot ini",
                          description: "Silahkan tap lalu kirim",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🥰 Kamu mau samaan kayak bot ini?",
                          description: "Silahkan tap lalu kirim, nanti bot akan mengirimkan sebuah link download",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🌾 Siapakah owner dari bot ini?",
                          description: "Tap dan klik kirim untuk melanjutkan",
                          id: `${m.prefix}owner`
                        },
                      ]
                    }
                  ],
                  icon: "REVIEW"
                })
              },
            ]
          }, {
            quoted: getVerifiedQuoted(botConfig, m),
          })
        } else {
          await m.reply(text);
        }
        break;
      case 2: {
  // V2 — menu utama yang diminta: tampilan tetap sederhana,
  // kategori tanpa jumlah command di body, dan jumlah hanya tampil
  // setelah user membuka tombol "Pilih Menu".
  const fixedCategories = [
    "owner", "main", "utility", "tools", "fun", "game", "download",
    "search", "sticker", "media", "ai", "group", "religi", "info", "cek",
    "economy", "user", "canvas", "random", "premium", "ephoto", "jpm", "anime",
    "asupan", "maker", "clan", "convert", "downloader", "downloads", "general",
    "image", "berita", "islamic", "rpg", "test", "internet", "audio", "quran",
    "quotes", "xp", "nsfw", "megami", "sound", "stalk", "voice", "music", "linode",
    "primbon", "cecan", "stalker", "tts", "vps"
  ];

  const categoryRows = [];
  const categoryLines = [];
  const commandsMap = getCommandsByCategory();
  const casesMap = getCasesByCategory();
  const allowed = getSortedCategories(m, botMode).sorted;
  const available = new Map(
    allowed.map(item => [item.cat.toLowerCase(), item])
  );

  for (const cat of fixedCategories) {
    const item = available.get(cat);
    if (!item) continue;

    const pluginCount = (commandsMap[item.cat] || []).length;
    const caseCount = (casesMap[item.cat] || []).length;
    const count = pluginCount + caseCount;

    if (!count) continue;

    categoryLines.push(`┣➤ *${prefix}menucat ${cat}*`);

    categoryRows.push({
      title: cat.toUpperCase(),
      description: `${count} command`,
      id: `${prefix}menucat ${cat}`,
    });
  }

  // Semua informasi utama diambil dari konfigurasi/runtime, bukan ditulis manual.
  const botName = config.bot?.name || "Rimuru-MD";
  const botVersion = config.bot?.version || "1.0";
  const botModeName = String(config.mode || "public").toUpperCase();
  const userName = m.pushName || "User";
  const featureCount = totalFeatures;

  const bodyLines = [
    `✨━━━〔 *𝐌ᴇɴᴜ* 〕━━━✨`,
    ``,
    `➤ Nᴀᴍᴀ Bᴏᴛ : *${botName}*`,
    `➤ Uѕᴇʀ : *${userName}*`,
    `➤ Mᴏᴅᴇ : *${botModeName}*`,
    `➤ Vᴇʀѕɪ : *${botVersion}*`,
    `➤ Tᴏᴛᴀʟ Fɪᴛᴜʀ : *${featureCount} ғɪᴛᴜʀ*`,
    ``,
    `✨━━━〔 *No Spam* 〕━━━✨`,
    ``,
    `_ᴊᴀɴɢᴀɴ sᴘᴀᴍ ʏᴀ ᴋᴀᴋ 🐣_`,
    `_ɢᴜɴᴀᴋᴀɴ ᴅᴇɴɢᴀɴ ʙɪᴊᴀᴋ_`,
    ``,
    `🌐 *[ READY PANEL LEGAL ]*`,
    `🔗 zanspiwpteroshoppanel.my.id`,
    ``,
    `📚 *Pilih kategori dari tombol di bawah untuk membuka command.*`,
    `${botName} • ◈ EXECUTIVE`,
  ];

  const body = bodyLines.join("\n");

  const selectButton = {
    name: "single_select",
    buttonParamsJson: JSON.stringify({
      title: "📚 Pilih Menu",
      sections: [{
        title: "Daftar Menu",
        rows: categoryRows,
      }],
    }),
  };

  // Button Testimoni
  const testiButton = {
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
      display_text: "⭐ TESTIMONI",
      url: "https://whatsapp.com/channel/0029VbD6XZW3AzNITBzI7c2L",
      merchant_url: "https://whatsapp.com/channel/0029VbD6XZW3AzNITBzI7c2L",
    }),
  };

  const imageBuffer = fs.readFileSync("./assets/image/rimuru-v2.jpg");

  await sock.sendMessage(
    m.chat,
    {
      image: imageBuffer,
      caption: body,
      footer: `${botName} • ◈ EXECUTIVE`,
      interactiveButtons: [
        selectButton,
        testiButton,
      ],
    },
    { quoted: m }
  );

  break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["rimuru-mp3"];
      try {
        switch (menuVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: m });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: m });
            }
            break;
          case 2: {
            const qpoll = {
              key: { participant: "0@s.whatsapp.net" },
              message: {
                pollCreationMessage: {
                  name: config.bot.name
                }
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qpoll });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: fs.readFileSync(config.assets["rimuru-mp3"]),
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qpoll });
            }
            break;
          }
          case 3: {
            const qtext = {
              key: {
                fromMe: false,
                participant: m.sender,
              },
              message: {
                conversation: "setelin musiknya nya bang"
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["rimuru-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          case 7: {
            const qChannel = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: typeof saluranId !== "undefined" ? saluranId : "120363294025983803@newsletter",
              },
              message: {
                conversation: "🔊 Playing Audio Menu..."
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_hq_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", audioUrl, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qChannel });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qChannel });
            }
            break;
          }
          case 4:
          default: {
            const ftroliQuoted = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
              },
              message: {
                orderMessage: {
                  orderId: "44444444444444",
                  thumbnail:
                    (thumbBuffer || imageBuffer ? await (await getSharp())(thumbBuffer || imageBuffer)
                      .resize({ width: 300, height: 300 })
                      .toBuffer() : null),
                  itemCount: totalCmds,
                  status: "INQUIRY",
                  surface: "CATALOG",
                  message: `★ ${config.bot.name}`,
                  orderTitle: `📋 ${totalCmds} Commands`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "rimuru-menu-v8",
                  totalAmount1000: 3333333,
                  totalCurrencyCode: "IDR",
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: saluranId,
                      newsletterName: saluranName,
                      serverMessageId: 127,
                    },
                  },
                },
              },
            };
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["rimuru-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["rimuru-mp3"]),
                  mimetype: "audio/mpeg",
                  contextInfo: getContextInfo(botConfig, m, thumbBuffer),
                },
                { quoted: getVerifiedQuoted(botConfig) },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("[Menu] Error sending dynamic audio:", e.message);
      }
    }
  } catch (error) {
    console.error("[Menu] Error on command execution:", error.message);
  }
}
export default {
  config: pluginConfig,
  handler,
};
