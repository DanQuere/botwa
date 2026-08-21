/**
 * APKMirror Search
 * -----------------------------
 * Type    : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API     : https://kaizenapi.my.id
 */

import fetch from 'node-fetch'

let handler = async (m, { text }) => {
  if (!text) throw 'Masukkan nama aplikasi!'

  await m.react('🕒')

  try {
    let res = await fetch(
      `https://kaizenapi.my.id/api/search/apkmirror?q=${encodeURIComponent(text)}`
    )

    let json = await res.json()

    if (!json.status || !json.result.length)
      throw 'Aplikasi tidak ditemukan.'

    let hasil = json.result.slice(0, 10)

    let caption = `APKMIRROR SEARCH

`

    for (let i = 0; i < hasil.length; i++) {
      let v = hasil[i]

      caption += `${i + 1}. ${v.judul}
❀ Developer : ${v.developer}
❀ Link : ${v.link}

`
    }

    m.reply(caption.trim())
  } catch (e) {
    throw 'Yahh error.'
  }
}

handler.help = ['apkmirror']
handler.tags = ['internet']
handler.command = /^(apkmirror|apksearch)$/i
handler.limit = true

export default handler