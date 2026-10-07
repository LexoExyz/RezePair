// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
var handler = async (m, { conn, participants, usedPrefix, command }) => {
let mentionedJid = await m.mentionedJid
let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && m.quoted.sender ? m.quoted.sender : null

if (!user) {
    let info = `❀ يرجى منشن العضو أو الرد على رسالته لطرده من المجموعة.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}

try {
const groupInfo = await conn.groupMetadata(m.chat)
const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

// حمايات البوت والمالك
if (user === conn.user.jid) {
    let info = `ꕥ لا يمكنني طرد نفسي من المجموعة.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}
if (user === ownerGroup) {
    let info = `ꕥ لا يمكنني طرد منشئ المجموعة.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}
if (user === ownerBot) {
    let info = `ꕥ لا يمكنني طرد مطوري الرسمي.`
    return conn.reply(m.chat, info, fkontak, rcanal)
}

await m.react('🍼')
await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

} catch (e) {
    let info = `⚠︎ حدث خطأ أثناء محاولة الطرد.\n> استخدم *${usedPrefix}بلاغ* للإبلاغ عن المشكلة.\n\n${e.message}`
    return conn.reply(m.chat, info, fkontak, rcanal)
}}

handler.help = ['طرد']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['طرد', 'طيره', 'kick', 'echar', 'sacar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
