let handler = async (m, { conn, text }) => {
  let uid = text?.trim() || m.quoted?.text?.trim()
  if (!uid) return m.reply('Masukin UID FF!')

  const fix = (v) => {
    if (v === null || v === undefined) return '-'
    if (typeof v === 'string') {
      let x = v.trim().toLowerCase()
      if (!x || x === 'n/a' || x === 'none') return '-'
      return v
    }
    return v
  }

  try {
    m.reply(global.wait)

    let url = `https://api.skylow.web.id/api/stalker/freefire?uid=${encodeURIComponent(uid)}`
    let res = await fetch(url)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    let json = await res.json()
    if (!json.status) return m.reply('❌ UID tidak ditemukan')

    let p = json.result.profile || {}
    let r = json.result.rank || {}
    let g = json.result.guild || {}
    let pet = json.result.pet || {}

    let caption = `
🎮 FF STALK

👤 ${fix(p.name)}
🆔 ${fix(p.uid)}
🌍 ${fix(p.region)}

⭐ Level: ${fix(p.level)}
✨ EXP: ${fix(p.exp)}
❤️ Likes: ${fix(p.likes)}

🏆 BR: ${fix(r.br_points)}
🎯 CS: ${fix(r.cs_rank_points)}

🐾 Pet: ${fix(pet.name)} (Lv ${fix(pet.level)})
🎖️ Pet EXP: ${fix(pet.exp)}

👥 Guild: ${fix(g.name)}

💬 Bio:
${fix(p.signature)}

🛡️ Score: ${fix(r.honor_score)}/100
`

    await conn.sendMessage(m.chat, {
      text: caption.trim()
    }, { quoted: m })

  } catch (e) {
    console.log('ERR:', e)
    m.reply(`❌ Error:\n${e.message}`)
  }
}

handler.help = ['ffstalk']
handler.tags = ['stalk']
handler.command = /^ffstalk$/i
handler.limit = true

export default handler