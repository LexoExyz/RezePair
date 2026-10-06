import moment from 'moment-timezone'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
if (!text) {
    let info = `❀ يرجى إدخال الرقم الذي تريد إرسال دعوة المجموعة إليه.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}
if (text.includes('+')) {
    let info = `ꕥ أدخل الرقم مباشرة بدون علامة (+)`
    return conn.reply(m.chat, info, fkontak, rcanal)
}
if (isNaN(text)) {
    let info = `ꕥ يرجى إدخال أرقام فقط (بدون مسافات).`
    return conn.reply(m.chat, info, fkontak, rcanal)
}

let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
let tag = m.sender ? '@' + m.sender.split('@')[0] : 'مستخدم'
const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'مجموعة') : 'خاص'

// تعديل التوقيت ليكون حسب توقيت المغرب (Casablanca)
const horario = `${moment.tz('Africa/Casablanca').format('DD/MM/YYYY hh:mm:ss A')}`

const invite = `❀ *دعـوة للانـضـمـام إلـى مـجـمـوعـة*\n\nꕥ *المرسل* » ${tag}\n✿ *المجموعة* » ${chatLabel}\n✰ *التاريخ* » ${horario}\n✦ *الرابط* » ${link}`

await conn.reply(`${text}@s.whatsapp.net`, invite, fkontak, { ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: [m.sender] }, mentions: [m.sender] })

let info = `❀ تم إرسال رابط الدعوة إلى الرقم المذكور بنجاح.`
return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['دعوة']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['دعوة', 'add', 'invite', 'اضافة']
handler.group = true
handler.botAdmin = true

export default handler
