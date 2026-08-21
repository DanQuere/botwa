import axios from 'axios'
import * as cheerio from 'cheerio'

export const config = {
  name: 'anitavid',
  alias: ['anitaimp4', 'anitavideo', 'hv', 'anita'],
  category: 'nsfw',
  description: 'Random video anita dari sfmcompile.club (PREMIUM ONLY)',
  usage: '.anitavid',
  example: '.anitavid',
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true
}

async function getRandomAnita() {
  const page = Math.floor(Math.random() * 1153)
  const response = await axios.get(`https://sfmcompile.club/page/${page}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  
  const htmlText = response.data
  const $ = cheerio.load(htmlText)
  const hasil = []  
  
  $("#primary > div > div > ul > li > article").each(function (a, b) {  
      hasil.push({  
          title: $(b).find("header > h2").text().trim(),  
          link: $(b).find("header > h2 > a").attr("href"),  
          category: $(b).find("header > div.entry-before-title > span > span").text().replace("in ", "").trim(),  
          share_count: $(b).find("header > div.entry-after-title > p > span.entry-shares").text().trim(),  
          views_count: $(b).find("header > div.entry-after-title > p > span.entry-views").text().trim(),  
          type: $(b).find("source").attr("type") || "image/jpeg",  
          video_1: $(b).find("source").attr("src") || $(b).find("img").attr("data-src"),  
          video_2: $(b).find("video > a").attr("href") || "",  
      })  
  })
  
  if (hasil.length === 0) return null
  
  // Mengambil 1 video acak dari hasil scrape di halaman tersebut
  const randomItem = hasil[Math.floor(Math.random() * hasil.length)]
  return randomItem
}

function getCaption(obj) {
  return `💕 *ʜᴇɴᴛᴀɪ ᴠɪᴅᴇᴏ* 💕\n\n` +
  `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
  `┃ 📹 *ᴛɪᴛʟᴇ*: ${obj.title}\n` +
  `┃ 🏷️ *ᴄᴀᴛᴇɢᴏʀʏ*: ${obj.category}\n` +
  `┃ 👁️ *ᴠɪᴇᴡs*: ${obj.views_count}\n` +
  `┃ 📤 *ꜱʜᴀʀᴇs*: ${obj.share_count}\n` +
  `┃ 🔗 *ʟɪɴᴋ*: ${obj.link}\n` +
  `╰━━━━━━━━━━━━━━━━━━━━━⬣\n\n` +
  `💗 *Zero Two:* Nikmati darling~ 🥵`
}

export async function handler(m, { sock }) {
  await m.react('💕')  
  await m.reply(`⏳ *ᴍᴇɴɢᴀᴍʙɪʟ ᴠɪᴅᴇᴏ...*\n\n💗 *Zero Two:* Tunggu sebentar darling, sedang mencari video acak~ 🔞`)  

  try {  
      const selected = await getRandomAnita()  
        
      if (!selected) {  
          m.react('💔')  
          return m.reply(`💔 *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴅᴀᴛᴀ*\n\n> Gagal menemukan video, coba lagi nanti darling~ 🥺`)  
      }  

      const videoUrl = selected.video_1 || selected.video_2
      
      if (!videoUrl) {
          m.react('💔')
          return m.reply(`❌ *ᴠɪᴅᴇᴏ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Link video kosong, coba lagi darling~`)
      }

      await m.react('🎬')

      // Langsung kirim video tanpa sesi pilihan
      await sock.sendMessage(m.chat, {  
          video: { url: videoUrl },  
          caption: getCaption(selected),  
          mimetype: 'video/mp4'  
      }, { quoted: m })  
        
      m.react('✅')  

  } catch (err) {  
      console.error('[anitavid] Error:', err)  
      m.react('💔')  
      await m.reply(`💔 *ᴇʀʀᴏʀ*\n\n> ${err.message}\n\n> Coba lagi ya darling~ 🥺`)  
  }
}

export default {
  config,
  handler
}
