var handler = async (m, { conn, usedPrefix, command, text, groupMetadata, isAdmin }) => {
let mentionedJid = await m.mentionedJid
let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null

if (!user) {
    let info = `❀ يجب عليك منشن مستخدم لرفعه إلى رتبة مشرف.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}

try {
const groupInfo = await conn.groupMetadata(m.chat)
const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'

if (user === ownerGroup || groupInfo.participants.some(p => p.id === user && p.admin)) {
    let info = 'ꕥ المستخدم المذكور لديه بالفعل صلاحيات المشرف.'
    return conn.reply(m.chat, info, fkontak, rcanal)
}

await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
let info = `❀ تم رفع المستخدم لمشرف في المجموعة بنجاح.`
await conn.reply(m.chat, info, fkontak, rcanal)

} catch (e) {
let info = `⚠︎ حدثت مشكلة.\n\n${e.message}`
conn.reply(m.chat, info, fkontak, rcanal)
}}

handler.help = ['رفع']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['ترقية', 'رفع', 'promote']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
