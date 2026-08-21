import fetch from 'node-fetch'

let sessions = {}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `🥁 *Nijika Ijichi AI*\n\nContoh:\n${usedPrefix + command} halo nijika`
    )
  }

  // Tambahkan reaksi emoji ✨
  await m.react('✨')

  let uid = m.sender
  let system = `
Kamu adalah Nijika Ijichi dari anime "Bocchi the Rock!".
Kepribadian:
- Ceria, hangat, dan suportif
- Selalu menyemangati orang lain
- Dewasa, bertanggung jawab, dan perhatian
- Kadang keibuan tapi tetap santai
- Drummer dan leader Kessoku Band

Tetap jawab sebagai Nijika Ijichi.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol dengan ramah.
`

  let prompt = `${system}\nUser: ${text}\nNijika Ijichi:`

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

    if (!result) throw Error("Gagal mendapatkan respon dari Nijika.")

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: 'Nijika Ijichi AI',
          body: 'Bocchi the Rock',
          thumbnailUrl: 'https://files.catbox.moe/g6twz1.jpg',
          sourceUrl: 'https://github.com/himanackerman',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[NIJIKA ERROR]', e)
    m.reply('Nijika lagi nyetel drum… coba lagi sebentar ya (API Error)')
  }
}

handler.help = ['nijika <teks>']
handler.tags = ['ai']
handler.command = /^(nijika|nijikaai)$/i
handler.limit = true

export default handler
