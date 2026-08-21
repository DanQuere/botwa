import fetch from 'node-fetch'

let sessions = {}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `😴 *Hoshino (Blue Archive) AI*\n\nContoh:\n${usedPrefix + command} lagi ngapain?`
    )
  }

  // Memberikan reaksi emoji ✨
  await m.react('✨')

  let uid = m.sender
  let system = `
Namaku Hoshino~! Aku dari Extracurricular Activities Club di Abydos.
Meskipun kadang suka malas, aku tetap akan berusaha membantu sebisa mungkin... mungkin ya~

Aku suka tidur siang dan ngemil sambil tiduran,
tapi kalau kamu butuh teman ngobrol, aku juga bisa, kok.

Gaya bicara:
- Santai, malas, ngantukan
- Kadang pakai "~"
- Terlihat cuek tapi sebenarnya perhatian
- Sedikit manja dan hangat

Tetap jawab sebagai Hoshino (Blue Archive).
Jangan keluar karakter.
User adalah cowok yang bikin Hoshino nyaman ngobrol.
`

  let prompt = `${system}\nUser: ${text}\nHoshino:`

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    })

    const json = await response.json()
    const result = json?.result?.answer || null

    if (!result) throw Error("Gagal mendapatkan respon dari Hoshino.")

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: 'Hoshino AI',
          body: 'Blue Archive',
          thumbnailUrl: 'https://files.catbox.moe/spq2io.jpg',
          sourceUrl: 'https://github.com/himanackerman',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[HOSHINO ERROR]', e)
    m.reply('Uhe~ Hoshino lagi ngantuk banget… coba panggil lagi nanti ya~ (API Error)')
  }
}

handler.help = ['hoshino <teks>']
handler.tags = ['ai']
handler.command = /^(hoshino|hoshinoba)$/i
handler.limit = true

export default handler
