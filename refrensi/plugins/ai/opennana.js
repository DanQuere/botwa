import safeJson from "../../src/lib/rimuru-safe-json.js";
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    throw `🖤 Masukkan kata kunci

Contoh:
.opennana anime
.opennana cyberpunk
.opennana logo`
  }

  let search = await fetch(
    `https://api.opennana.com/api/prompts?search=${encodeURIComponent(text)}`
  )

  let s = await safeJson(search)

  if (!s?.data?.items?.length) {
    throw '❀ Prompt tidak ditemukan'
  }

  let item = s.data.items[
    Math.floor(Math.random() * s.data.items.length)
  ]

  let detail = await fetch(
    `https://api.opennana.com/api/prompts/${item.slug}`
  )

  let d = await safeJson(detail)

  if (!d?.data) throw '❀ Gagal mengambil detail prompt'

  let data = d.data

  let prompt = data.prompts?.[0]?.text || 'Tidak ada prompt'

  let caption = `╭━━〔 OPENNANA SEARCH 〕━⬣
❀ Query : ${text}
❀ Judul : ${data.title}
❀ Model : ${data.model || '-'}
❀ Tags : ${data.tags?.join(', ') || '-'}
❀ Source : ${data.source_name || '-'}
╰━━━━━━━━━━━━⬣

📝 Prompt:

${prompt.length > 3500 ? prompt.slice(0, 3500) + '...' : prompt}`

  await conn.sendFile(
    m.chat,
    data.images?.[0] || item.cover_image,
    'opennana.jpg',
    caption,
    m
  )
}

handler.help = ['opennana <query>']
handler.tags = ['ai']
handler.command = /^opennana$/i
handler.limit = true

export default handler