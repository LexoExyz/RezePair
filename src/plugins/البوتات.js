import ws from "ws"

const handler = async (m, { conn, command, usedPrefix, participants }) => {
try {
const users = [global.conn.user.jid, ...new Set(global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid))]

// دالة تحويل الوقت إلى تنسيق عربي
function convertirMsADiasHorasMinutosSegundos(ms) {
const segundos = Math.floor(ms / 1000)
const minutos = Math.floor(segundos / 60)
const horas = Math.floor(minutos / 60)
const أيام = Math.floor(horas / 24)
const segRest = segundos % 60
const minRest = minutos % 60
const horasRest = horas % 24
let resultado = ""
if (أيام) resultado += `${أيام} يوم، `
if (horasRest) resultado += `${horasRest} ساعة، `
if (minRest) resultado += `${minRest} دقيقة، `
if (segRest) resultado += `${segRest} ثانية`
return resultado.trim()
}

let groupBots = users.filter((bot) => participants.some((p) => p.id === bot))
if (participants.some((p) => p.id === global.conn.user.jid) && !groupBots.includes(global.conn.user.jid)) { groupBots.push(global.conn.user.jid) }

const botsGroup = groupBots.length > 0 ? groupBots.map((bot) => {
const isMainBot = bot === global.conn.user.jid
const v = global.conns.find((conn) => conn.user.jid === bot)
const uptime = isMainBot ? convertirMsADiasHorasMinutosSegundos(Date.now() - global.conn.uptime) : v?.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : "نشط الآن"
const mention = bot.replace(/[^0-9]/g, '')

return `❀ @${mention}
> ✿ النوع: ${isMainBot ? 'الـبـوت الأسـاسـي' : 'بـوت فـرعـي'}
> ❏ نـشـط مـنـذ: ${uptime}`}).join("\n\n") : `✧ لا يـوجـد بـوتـات نـشـطـة فـي هـذه الـمـجـمـوعـة`

const info = ` \`قـائـمـة الـبـوتـات الـنـشـطـة :\`

 ˗ˏˋ 🍙 ˎˊ˗ الـبـوت الأسـاسـي: *1*
 ˗ˏˋ 🌾 ˎˊ˗ الـبـوتـات الـفـرعـيـة: *${users.length - 1}*
 ˗ˏˋ 🍄 ˎˊ˗ فـي هـذه الـمـجـمـوعـة: *${groupBots.length}* بـوتـات
 
${botsGroup}`

const mentionList = groupBots.map(bot => bot.endsWith("@s.whatsapp.net") ? bot : `${bot}@s.whatsapp.net`)

return conn.reply(m.chat, info, fkontak, rcanal, { mentions: mentionList })

} catch (error) {
let infoError = `⚠︎ حـدث خـطأ أثـنـاء جـلـب الـقـائمة.\n> اسـتـخدم *${usedPrefix}بلاغ* لـلإبـلاغ عـنـه.\n\n${error.message}`
conn.reply(m.chat, infoError, fkontak, rcanal)
}}

handler.tags = ["الـمـطـور"]
handler.help = ["بووتات"]
handler.command = ["بووتات", "listbots", "قائمة_البوتات", "البوتات", "sockets"]

export default handler
