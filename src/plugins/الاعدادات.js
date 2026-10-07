import { promises as fs } from 'fs'

const handler = async (m, {conn, participants, groupMetadata}) => {
const chat = global.db.data.chats[m.chat]
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
const { antiLink, detect, welcome, sWelcome, sBye, modoadmin, isBanned, primaryBot } = global.db.data.chats[m.chat]
const groupAdmins = participants.filter(p => p.admin)
const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
const creador = (!owner || owner.startsWith('1203') || owner.length < 15) ? 'غير معروف' : `@${owner.split('@')[0]}`
const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
const botprimary = rawPrimary.endsWith('@s.whatsapp.net') ? `@${rawPrimary.split('@')[0]}` : 'عشوائي';  
const totalreg = Object.keys(global.db.data.users).length

const text = `「✦」 مـعـلـومـات الـمـجـمـوعـة ◤

❀ *الـمـنـشـئ* » ${creador}
✦ *الأعـضـاء* » ${participants.length} عضو
ꕥ *الـمـشـرفـيـن* » ${groupAdmins.length}
☆ *الـمـسـجـلـيـن* » ${totalreg.toLocaleString()}
❖ *الـبـوت الـرئـيـسـي* » ${botprimary}

*▢ الإعـدادات :*
> ◆ *الـحـالـة* » ${isBanned ? '✗ مـعـطل' : '✓ مـفـعـل'}
> ◆ *الـتـرْحـيـب* » ${welcome ? '✓ مـفـعـل' : '✗ مـعـطل'}
> ◆ *الـتـنـبـيـهـات* » ${detect ? '✓ مـفـعـل' : '✗ مـعـطل'}
> ◆ *مـضـاد الـروابـط* » ${antiLink ? '✓ مـفـعـل' : '✗ مـعـطل'}
> ◆ *الـمـشـرفـيـن فـقـط* » ${modoadmin ? '✓ مـفـعـل' : '✗ مـعـطل'}

*▢ الـرسـائـل :*
> ● *الـتـرحـيـب* » ${(sWelcome || 'لا توجد رسالة ترحيب').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'لا يوجد وصف'}*`)}
> ● *الـوداع* » ${(sBye || 'لا توجد رسالة وداع').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'لا يوجد وصف'}*`)}`

return conn.reply(m.chat, text, fkontak, rcanal, { mentions: [owner, rawPrimary, m.sender] })
}

handler.help = ['الاعدادات']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['الاعدادت', 'تفاصيل', 'gp', 'infogrupo']
handler.group = true

export default handler
