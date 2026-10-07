import speed from 'performance-now'
import os from 'os'

let handler = async (m, { conn }) => {
  const start = speed()
  await new Promise(res => setTimeout(res, 1))

  const latensi = speed() - start

  let ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0)
  let ramLibre = (os.freemem() / 1024 / 1024).toFixed(0)
  let ramUso = ramTotal - ramLibre

  let uptime = process.uptime()

  // حالات سرعة الاستجابة
  let pingEmoji =
    latensi < 50 ? '🟢 مـمـتـاز' :
    latensi < 120 ? '🟡 جـيـد' :
    latensi < 200 ? '🟠 مـتـوسـط' :
    '🔴 بـطـيء جـداً'

  let info = `*'ׄ𐚁ִㅤحـالـة وسـرعـة الـبـوتׄ ₍ ᐢ..ᐢ ₎'*

*🍄 الـبـوت : ›* النظام الذكي
*🌳 الـسـرعـة : ›* ${latensi.toFixed(2)} ms (${pingEmoji})
*🌱 الـتـشـغـيـل : ›* ${formatTime(uptime)}
*🪷 الـنـظـام : ›* ${os.platform()} (${os.arch()})
*🍙 مكتبة : ›* ${process.version}
*🌿 الـرام : ›* ${ramUso} ميجا / ${ramTotal} ميجا`

  return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['بينج']
handler.tags = ['الـأعـضـاء']
handler.command = ['ping', 'p', 'بينج', 'سرعة']
handler.register = true

export default handler

function formatTime(seconds) {
  seconds = Number(seconds)
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor(seconds % (3600 * 24) / 3600)
  let m = Math.floor(seconds % 3600 / 60)
  let s = Math.floor(seconds % 60)

  return [
    d ? `${d} يوم ` : '',
    h ? `${h} ساعة ` : '',
    m ? `${m} دقيقة ` : '',
    s ? `${s} ثانية ` : ''
  ].filter(Boolean).join(' ')
}
