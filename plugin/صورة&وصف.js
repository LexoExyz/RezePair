// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
import { makeWASocket } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, text, command, usedPrefix }) => {
try {
switch (command) {
case 'صورة': case 'groupimg': {
const q = m.quoted || m
const mime = (q.msg || q).mimetype || ''
if (!/image\/(png|jpe?g)/.test(mime)) {
let info = '❀ يرجى إرسال أو تحديد صورة لتغيير بروفايل المجموعة.'
return conn.reply(m.chat, info, fkontak, rcanal)
}
const img = await q.download()
if (!img) {
let info = '❀ فشل تحميل الصورة، حاول مرة أخرى.'
return conn.reply(m.chat, info, fkontak, rcanal)
}
await m.react('🕒')
await conn.updateProfilePicture(m.chat, img)
await m.react('✔️')
let info = '❀ تم تغيير صورة المجموعة بنجاح.'
conn.reply(m.chat, info, fkontak, rcanal)
break
}
case 'وصف': case 'groupdesc': {
if (!args.length) {
let info = '❀ يرجى كتابة الوصف الجديد الذي تريد وضعه للمجموعة.'
return conn.reply(m.chat, info, fkontak, rcanal)
}
await m.react('🕒')
await conn.groupUpdateDescription(m.chat, args.join(' '))
await m.react('✔️')
let info = '❀ تم تغيير وصف المجموعة بنجاح.'
conn.reply(m.chat, info, fkontak, rcanal)
break
}
}} catch (e) {
await m.react('✖️')
let info = `⚠︎ حدثت مشكلة.\n> تفاصيل الخطأ تظهر بالأسفل. استخدم ${usedPrefix}بلاغ للإبلاغ عنها.\n\n${e.message}`
conn.reply(m.chat, info, fkontak, rcanal)
}}

handler.help = ['صورة', 'وصف']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['صورة', 'groupimg', 'وصف', 'groupdesc']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
