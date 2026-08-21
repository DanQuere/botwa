import safeJson from "../../src/lib/rimuru-safe-json.js";
/* DATABASE : KAZUKO & NEVT & REY
Follow Github Mereka
1) Kazuko: https://github.com/kazuko
2) Nevt: https://github.com/NevtBotz
3) Rey: https://github.com/inirey
*/
import fetch from 'node-fetch'
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (command == 'akira') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/akira.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'akiyama') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/akiyama.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'anna') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/ana.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'asuna') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/asuna.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'ayuzawa') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/ayuzawa.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'boruto') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/boruto.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'chitanda') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/chitanda.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'chitoge') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/chitoge.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'deidara') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/deidara.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'doraemon') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/doraemon.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'emilia') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/emilia.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'asuna') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/asuna.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'erza') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/erza.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'gremory') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/gremory.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'hestia') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/hestia.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'hinata') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/hinata.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'inori') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/inori.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'isuzu') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/isuzu.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'itachi') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/itachi.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'itori') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/itori.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kaga') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kaga.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kagura') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kagura.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kakasih') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kakasih.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kaori') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kaori.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kaneki') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kaneki.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kosaki') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kosaki.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kotori') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kotori.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kuriyama') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kuriyama.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kuroha') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kuroha.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'kurumi') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/kurumi.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'loli') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/loli.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'madara') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/madara.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'mikasa') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/mikasa.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'miku') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/miku.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'minato') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/minato.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'naruto') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/naruto.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'natsukawa') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/natsukawa.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'neko2') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/neko.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'nekohime') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/nekohime.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'nezuko') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/nezuko.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'nishimiya') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/nishimiya.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'onepiece') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/onepiece.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'pokemon') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/pokemon.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'rem') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/rem.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'rize') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/rize.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'sagiri') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/sagiri.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'sakura') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/sakura.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'sasuke') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/sasuke.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'shina') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/shina.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'shinka') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/shinka.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'shizuka') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/shizuka.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'shota') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/shota.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'tomori') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/tomori.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'toukachan') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/toukachan.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'tsunade') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/tsunade.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'yatogami') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/yatogami.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
if (command == 'yuki') {
let res = await safeJson(await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/yuki.json`))
let cita = res[Math.floor(Math.random() * res.length)]
conn.sendFile(m.chat, cita, 'result.jpg', `Nihh ${command} nya @${m.sender.split('@')[0]}`, m) 
}
}
handler.command = handler.help = [
'akira', 
'akiyama', 
'anna', 
'asuna', 
'ayuzawa', 
'boruto', 
'chitanda', 
'chitoge', 
'deidara', 
'doraemon',  
'emilia', 
'asuna', 
'erza', 
'gremory', 
'hestia', 
'hinata', 
'inori', 
'itachi', 
'isuzu', 
'itori', 
'kaga', 
'kagura', 
'kakasih', 
'kaori', 
'kaneki', 
'kosaki', 
'kotori', 
'kuriyama', 
'kuroha', 
'kurumi', 
'madara', 
'mikasa', 
'miku', 
'minato', 
'naruto', 
'natsukawa', 
'neko2', 
'nekohime', 
'nezuko', 
'nishimiya', 
'onepiece', 
'pokemon',
'rem', 
'rize',
'sagiri',
'sakura', 
'sasuke',
'shina',
'shinka',
'shizuka',
'shota',
'tomori',
'toukachan',
'tsunade',
'yatogami',
'yuki'
]
handler.tags = ['anime']
handler.limit = true
export default handler
