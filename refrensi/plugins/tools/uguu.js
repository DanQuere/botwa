import { uguu } from '../../src/lib/megami/scrape/uguu.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) return m.reply('Reply media')

  await m.reply('wait')

  try {
    let buffer = await q.download()
    let { url } = await uguu(buffer)

    await m.reply(url)

  } catch (e) {
    console.log(e)
    m.reply('Gagal upload')
  }
}

handler.help = ['uguu']
handler.tags = ['tools']
handler.command = /^uguu$/i
handler.limit = false

export default handler