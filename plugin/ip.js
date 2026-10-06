// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, text }) => {
if (!text) {
return conn.reply(m.chat, `❀ يـرجـى إدخـال عـنـوان *IP* لـفـحـصـه.`, fkontak, rcanal)
}

try {
await m.react('🕒')

const res = await axios.get(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
const data = res.data

if (String(data.status) !== "success") {
throw new Error(data.message || "فـشـل الـجـلـب")
}

let ipsearch = `✧ *مـعـلـومـات الـ IP* ✧

» الـعـنـوان : ${data.query}
» الـدولـة : ${data.country} (${data.countryCode})
» الـمـنـطـقـة : ${data.regionName}
» الـمـديـنـة : ${data.city}
» الـحـي/الـضـاحـيـة : ${data.district || 'غـيـر مـتـوفـر'}
» الـرمـز الـبـريـدي : ${data.zip}
» الـتـوقـيـت : ${data.timezone}
» مـزود الـخـدمـة (ISP) : ${data.isp}
» الـمـنـظـمـة : ${data.org}
» الـنـظـام الـمـسـتـقـل (AS) : ${data.as}
» اتـصـال هـاتـف : ${data.mobile ? "نـعـم" : "لا"}
» اسـتـضـافـة (Hosting) : ${data.hosting ? "نـعـم" : "لا"}`.trim()

return conn.reply(m.chat, ipsearch, fkontak, rcanal)
await m.react('✔️')

} catch (error) {
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ حـدث خـطأ أثـنـاء جـلـب الـبـيـانـات.\n> اسـتـخـدم *${usedPrefix}بلاغ* لـلإبـلاغ عـنـه.\n\n${error.message}`, fkontak, rcanal)
}}

handler.help = ['ip <عنوان الـ ip>']
handler.tags = ['الـبـحث']
handler.command = ['ip', 'فحص_اي_بي']

export default handler
