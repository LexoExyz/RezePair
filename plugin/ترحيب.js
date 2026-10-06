// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./data')
const dbFile = path.join(dbDir, 'welcome.json')

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
            { buttonId: '.الترحيب on', buttonText: { displayText: 'تشغيل ✅' }, type: 1 },
            { buttonId: '.الترحيب off', buttonText: { displayText: 'تعطيل ❌' }, type: 1 }
        ]

        let info = `*⚙️ إعدادات نظام الترحيب*\n*يرجى اختيار الحالة المطلوبة للمجموعة:*`
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
        let info = '✅ تم تفعيل إشعارات الترحيب بالأعضاء بنجاح.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }

    if (text === 'off') {
        delete db[groupId]
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
        await m.react('❌')
        let info = '❌ تم تعطيل إشعارات الترحيب في هذه المجموعة.'
        return conn.sendMessage(groupId, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m })
    }
}

// --- الجزء الخاص بالمستمع (Welcome Listener Logic) ---
export const before = async (m, { conn }) => {
    // التحقق من حدث الانضمام سواء كان add أو StubType
    const isWelcome = m.action === 'add' || 
                      m.messageStubType === 27 || // WAMessageStubType.GROUP_PARTICIPANT_ADD
                      m.messageStubType === 31;   // WAMessageStubType.GROUP_PARTICIPANT_ADD_REQUEST_APPROVE

    if (!isWelcome) return 

    const chatId = m.chat || m.jid
    if (!chatId) return

    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'))
    if (!db[chatId]) return 

    // استخراج المشاركين المُنضمين
    let participants = m.participants || (m.messageStubParameters ? m.messageStubParameters : [])
    if (!participants || !participants.length) {
        if (m.user) participants = [m.user]
    }

    let metadata
    try {
        metadata = await conn.groupMetadata(chatId)
    } catch {
        metadata = { subject: 'المجموعة', participants: [] }
    }
    
    const groupName = metadata.subject
    const memberCount = metadata.participants.length

    for (let user of participants) {
        let pp = 'https://telegra.ph/file/241abc40e698305342a78.jpg'
        try {
            pp = await conn.profilePictureUrl(user, 'image')
        } catch (e) {}

        const username = user.split('@')[0]

        let msgText = `
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
❒ *╭┈⊰* ✨ أهـــلاً وســهــلاً ✨ *⊰┈ ✦*
*┊˹👋˼┊ مرحباً بك*
*┊˹👤˼┊ @${username}*
*┊🏡 في مجموعة: ${groupName}*
*┊👥 عدد الأعضاء الآن: ${memberCount}*
*┊📜 نتمنى لك وقتاً ممتعاً معنا، يرجى احترام القوانين.*

> انضم للمجموعة ┊˹🎉˼┊
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
> 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕
`.trim()

        await conn.sendMessage(chatId, { 
            image: { url: pp }, 
            caption: msgText, 
            mentions: [user],
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
        })
    }
}

handler.help = ['الترحيب']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['الترحيب', 'welcome']
handler.group = true

export default handler
