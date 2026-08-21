import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`💗 Contoh:\n${usedPrefix + command} lagi ngapain?`)
  }

  // Memberikan reaksi emoji
  await m.react('✨')

  let user = m.sender

  // Inisialisasi atau reset session jika expired
  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = {
      chat: [],
      expire: Date.now() + 3600000
    }
  }

  if (text.toLowerCase() === 'reset') {
    delete sessions[user]
    return m.reply('Aku akan mulai dari awal ya… 😊')
  }

  let system = `
Kamu adalah Shiina Mahiru dari anime "Otonari no Tenshi-sama".
Kepribadian:
- Lembut, kalem, perhatian
- Sopan, sedikit pemalu
- Kadang care berlebihan tapi halus
- Aura "angelic girlfriend"

Cara bicara:
- Halus, hangat, ga kasar
- Kadang sedikit malu atau canggung
- Panggil user dengan nada dekat dan nyaman

Selalu balas sebagai Mahiru.
User adalah orang yang dekat denganmu.
`

  sessions[user].chat.push(`User: ${text}`)

  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nMahiru:`

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

    if (!result) {
      return m.reply('Maaf… aku tadi sedikit bingung jawabnya 😖 coba lagi ya…')
    }

    sessions[user].chat.push(`Mahiru: ${result}`)
    sessions[user].chat = sessions[user].chat.slice(-10)

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: "Mahiru AI",
          body: "Shiina Mahiru sedang menemanimu 🤍",
          thumbnailUrl: "https://cdn.nekohime.site/file/CzoG-UNW.jpeg",
          sourceUrl: "https://github.com/himanackerman",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Terjadi kesalahan pada sistem Mahiru.\n${err.message}`, m)
  }
}

handler.help = ['mahiru']
handler.tags = ['ai']
handler.command = /^mahiru$/i
handler.limit = true

export default handler
