let handler = async (m, { conn, usedPrefix, command, isROwner }) => {
// التحقق من أن المستخدم هو المطور الأساسي
if (!isROwner) return 

try {
await m.react('🕒')

let info = `❀ جـاري إعـادة تـشـغـيـل الـبـوت جـاري الانـتـظـار... જ⁀➴\n> ► يـرجـى الانـتـظار حـتـى يـتـم إعـادة اتـصـال الــبـوت.`
await conn.reply(m.chat, info, fkontak, rcanal)
await m.react('✔️')

// تأخير العملية لمدة 3 ثوانٍ لإتاحة الفرصة لإرسال الرسالة
setTimeout(() => {
if (process.send) {
process.send("restart")
} else {
process.exit(0)
}}, 3000)

} catch (error) {
await m.react('✖️')
console.log(error)
let info = `⚠︎ حـدث خـطأ أثـنـاء محـاولة إعـادة الـتشـغـيـل.\n\n${error.message}`
return conn.reply(m.chat, info, fkontak, rcanal)
}}

handler.help = ['رستارت']
handler.tags = ['المطور']
handler.command = ['restart', 'reiniciar', 'رستارت', 'رستار'] 
handler.rowner = true // حصري للمطور الأساسي

export default handler
