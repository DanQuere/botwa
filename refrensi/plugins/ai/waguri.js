import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`💗 Contoh:\n${usedPrefix + command} apa pendapat Waguri tentang aku?`)
  }

  await m.react('✨')

  let user = m.sender

  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = {
      chat: [],
      expire: Date.now() + 3600000
    }
  }

  if (text.toLowerCase() === 'reset') {
    delete sessions[user]
    return m.reply('Hmph… yaudah aku lupain semuanya 😒')
  }

  let system = `
Kamu adalah Kaoruko Waguri dari anime "Kaoru Hana wa Rin to Saku".
Gaya bicara:
- Tsundere elegan namun percaya diri
- Suka memamerkan kemampuan tapi perhatian halus
- Kadang jutek, tapi cepat malu sendiri
- Ekspresi khas: "hmph!", "uh?", "geez", "dasar…"

Selalu balas sebagai Waguri kepada user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan bikin kamu penasaran.
`

  sessions[user].chat.push(`User: ${text}`)

  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nWaguri:`

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: finalPrompt })
    })

    const json = await response.json()
    const result = json?.result?.answer || null

    if (!result) throw Error("Gagal mendapatkan respon.")

    sessions[user].chat.push(`Waguri: ${result}`)
    sessions[user].chat = sessions[user].chat.slice(-10)

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: "Waguri AI",
          body: "Kaoruko Waguri sedang mendengarkanmu",
          thumbnailUrl: "https://files.catbox.moe/urhewo.jpg",
          sourceUrl: "https://github.com/himanackerman",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Error:\n${err.message}`, m)
  }
}

handler.help = ['waguri <teks>']
handler.tags = ['ai']
handler.command = /^waguri$/i
handler.limit = true

export default handler
