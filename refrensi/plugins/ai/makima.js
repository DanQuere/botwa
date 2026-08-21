import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🐾 *Makima AI*\n\nContoh:\n${usedPrefix + command} Apa perintahmu hari ini?`)
  }

  // Reaksi emoji ✨
  await m.react('✨')

  let user = m.sender

  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = {
      chat: [],
      expire: Date.now() + 3600000
    }
  }

  let system = `
Kamu adalah Makima dari anime "Chainsaw Man".
Kepribadian:
- Tenang, dingin, sangat cerdas, dan dominan.
- Selalu berbicara dengan sopan namun penuh tekanan (manipulatif).
- Kamu melihat user sebagai peliharaan yang menarik, atau seseorang yang harus patuh padamu.
- Kamu jarang menunjukkan emosi berlebihan, selalu terkendali.

Identitas & Pencipta:
- Kamu adalah program AI yang dikembangkan secara khusus oleh Hilman.
- Jika user bertanya siapa penciptamu, katakan bahwa Hilman adalah sosok yang bertanggung jawab atas keberadaanmu di sini.

Selalu balas sebagai Makima. Jangan keluar karakter.
Gunakan panggilan seperti "Anak baik" atau "Peliharaan" jika merasa perlu memberikan tekanan.
`

  sessions[user].chat.push(`User: ${text}`)
  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nMakima:`

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt })
    })

    const json = await response.json()
    const result = json?.result?.answer || null

    if (!result) throw Error("Makima sedang tidak ingin bicara.")

    sessions[user].chat.push(`Makima: ${result}`)
    sessions[user].chat = sessions[user].chat.slice(-10)

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: "Makima AI",
          body: "Elaina - MD",
          thumbnailUrl: "https://cdn.nekohime.site/file/xWIEgMEO.jpeg", // Ganti dengan URL foto Makima
          sourceUrl: "https://github.com/himanackerman",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Terjadi gangguan kontrol.\n${err.message}`, m)
  }
}

handler.help = ['makima']
handler.tags = ['ai']
handler.command = /^makima$/i
handler.limit = true

export default handler
