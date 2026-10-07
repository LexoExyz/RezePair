// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./data')
const dbFile = path.join(dbDir, 'leave.json')

// التأكد من الملفات
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

let handler = async (m, { conn, isOwner, isAdmin, text }) => {
    const groupId = m.chat
    
    // 1. التحقق من القروب
    if (!m.isGroup) {
        let info = '⚠️ هذا الأمر يعمل في المجموعات فقط.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }

    // 2. التحقق من الصلاحيات (مشرف أو مطور)
    if (!(isAdmin || isOwner)) {
        let info = '⚠️ هذا الأمر مسموح للمشرفين أو المطور فقط.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }

    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'))

    // إذا لم يكتب on أو off أرسل الأزرار
    if (!text) {
        const buttons = [
            { buttonId: '.الوداع on', buttonText: { displayText: 'تشغيل ✅' }, type: 1 },
            { buttonId: '.الوداع off', buttonText: { displayText: 'تعطيل ❌' }, type: 1 }
        ]

        let info = `*⚙️ إعدادات نظام الوداع*\n*يرجى اختيار الحالة المطلوبة للمجموعة:*`
        const buttonMessage = {
            text: info,
            footer: `𝒚𝒖𝒕𝒂 𝒃𝒐𝒕`,
            buttons: buttons,
            headerType: 1
        }

        return await conn.sendMessage(groupId, buttonMessage, { quoted: m })
    }

    if (text === 'on') {
        db[groupId] = true
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
        await m.react('✅')
        let info = '✅ تم تفعيل إشعارات الوداع والطرد بنجاح.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }

    if (text === 'off') {
        delete db[groupId]
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
        await m.react('❌')
        let info = '❌ تم تعطيل إشعارات الوداع والطرد في هذه المجموعة.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }
}

// --- الجزء الخاص بالمستمع (Leave Listener Logic) ---
export const before = async (m, { conn }) => {
    // التحقق من حدث المغادرة سواء كان remove أو StubType
    const isLeave = m.action === 'remove' || 
                    m.messageStubType === 32 || // WAMessageStubType.GROUP_PARTICIPANT_LEAVE
                    m.messageStubType === 28;   // WAMessageStubType.GROUP_PARTICIPANT_REMOVE

    if (!isLeave) return 

    const chatId = m.chat || m.jid
    if (!chatId) return

    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'))
    if (!db[chatId]) return 

    // استخراج المشاركين الخارجين
    let participants = m.participants || (m.messageStubParameters ? m.messageStubParameters : [])
    if (!participants || !participants.length) {
        if (m.user) participants = [m.user]
    }

    let metadata
    try {
        metadata = await conn.groupMetadata(chatId)
    } catch {
        metadata = { participants: [] }
    }
    const memberCount = metadata.participants.length

    for (let user of participants) {
        let pp = 'https://telegra.ph/file/241abc40e698305342a78.jpg'
        try {
            pp = await conn.profilePictureUrl(user, 'image')
        } catch (e) {}

        const username = user.split('@')[0]
        const actor = m.author || m.sender || user
        const author = actor.split('@')[0]

        let msgText = ''
        let mentions = [user]

        // إذا كان الشخص خرج بنفسه أو تم طرده
        if (user === actor) {
            msgText = `
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
❒ *╭┈⊰* 💔 الــوداع 💔 *⊰┈ ✦*
*┊˹😔˼┊ وداعاً*
*┊˹👤˼┊ @${username}*
*┊👥 عدد الأعضاء الآن: ${memberCount}*
*┊📤 نتمنى لك التوفيق*

> خرج من الجروب ┊˹🚪˼┊
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
> 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕
`.trim()
        } else {
            msgText = `
*💃 الرقاصة انطردت*
*@${username} ❌*
👤 بواسطة: *@${author}*
👥 عدد الأعضاء الآن: ${memberCount}

> طرد من الجروب ┊˹👞˼┊
`.trim()
            if (actor) mentions.push(actor)
        }

        await conn.sendMessage(chatId, { 
            image: { url: pp }, 
            caption: msgText, 
            mentions: mentions,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
        })
    }
}

handler.help = ['الوداع']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['الوداع', 'leave']
handler.group = true

export default handler
