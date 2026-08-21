import fs from 'fs'
import { createHash } from 'crypto'
import moment from 'moment-timezone'

let Reg = /^([\w\s]+)\s*,\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(`🍹 Kamu sudah terdaftar\n\nKetik:\n${usedPrefix}unreg ${sn}`)
  }

  if (!Reg.test(text)) {
    return m.reply(`🍓 Format salah

Contoh:
${usedPrefix + command} KaaOffc,18

Gunakan format yang benar`)
  }

  let [_, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('🍉 Nama atau umur tidak valid')
  if (name.length > 100) return m.reply('🍔 Nama maksimal 100 karakter')
  if (age < 5 || age > 100) return m.reply('🍦 Umur harus 5 - 100')

  let d = new Date()
  let week = d.toLocaleDateString('id', { weekday: 'long' })
  let date = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' })
  let time = moment.tz('Asia/Jakarta').format('HH:mm:ss')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
🍓 PENDAFTARAN BERHASIL 🍓

🍉 Nama : ${name}
🍹 Umur : ${age}
🍇 SN   : ${sn}

🍦 Tanggal : ${week}, ${date}
🧃 Waktu   : ${time}

🍰 Data berhasil disimpan
`.trim()

  const thumbnail = fs.readFileSync('../../media/ryo1.jpg')

  await conn.sendMessage(m.chat, {
    image: thumbnail,
    caption,
    footer: '𝗠𝗘𝗚𝗔𝗠𝗜 𝗠𝗗 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘',

    optionText: 'Pilih Menu',
    optionTitle: 'Daftar',

    nativeFlow: [
      {
        text: 'Menu',
        sections: [
          {
            title: 'Main',
            rows: [
              {
                title: 'Menu Utama',
                id: '.menu'
              }
            ]
          }
        ]
      },
      {
        text: 'Copy SN',
        copy: sn
      }
    ]
  }, { quoted: m })
}

handler.help = ['daftar']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler