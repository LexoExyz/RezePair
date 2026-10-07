import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./database')
const monitorFile = path.join(dbDir, 'monitorState.json')

// إعداد الملفات
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
if (!fs.existsSync(monitorFile)) fs.writeFileSync(monitorFile, JSON.stringify({}))

let handler = async (m, { conn, isOwner, text, usedPrefix, command }) => {
    const groupId = m.chat

    // 1. التحقق من القروب
    if (!m.isGroup) {
        let info = '❌ هذا الأمر يعمل فقط داخل المجموعات.'
        return conn.reply(groupId, info, fkontak, rcanal)
    }

    // 2. التحقق من المطور
    if (!isOwner) {
        let info = '> هــذا الامـــر مخــصص للمـــطور.... 💤'
        return conn.reply(groupId, info, fkontak, rcanal)
    }

    const state = JSON.parse(fs.readFileSync(monitorFile))

    // إذا تم إرسال حالة معينة
    if (text === 'on') {
        state[groupId] = true
        fs.writeFileSync(monitorFile, JSON.stringify(state, null, 2))
        await m.react('🛡️')
        let info = '✅ تم تفعيل نظام مراقبة الرتب وحصر الإشراف للمطورين فقط.'
        return conn.reply(groupId, info, fkontak, rcanal)
    }

    if (text === 'off') {
        delete state[groupId]
        fs.writeFileSync(monitorFile, JSON.stringify(state, null, 2))
        await m.react('🔓')
        let info = '❎ تم إيقاف نظام حماية الرتب في هذه المجموعة.'
        return conn.reply(groupId, info, fkontak, rcanal)
    }

    // إرسال رسالة الأزرار الأصلية (Native Flow)
    let msg = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: `*🛡️ نـظـام حـمـايـة الـرتب*` },
                    body: { text: `عند تفعيل هذا الوضع، سيقوم البوت تلقائياً بسحب الإشراف من أي شخص يتم ترقيته ما لم يكن من مطوري البوت.` },
                    footer: { text: `𝐒𝐲𝐬𝐭𝐞𝐦` },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "تشغيل الحماية ✅",
                                    id: `${usedPrefix + command} on`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "إيقاف الحماية ❌",
                                    id: `${usedPrefix + command} off`
                                })
                            }
                        ]
                    }
                }
            }
        }
    }

    await conn.relayMessage(groupId, msg, {})
}

// الجزء المسؤول عن المراقبة التلقائية (Listener)
export const before = async (m, { conn, isOwner }) => {
    if (!m.isGroup) return
    
    // التحقق من حالة المراقبة للمجموعة
    const state = JSON.parse(fs.readFileSync(monitorFile))
    if (!state[m.chat]) return

    // مراقبة أحداث المجموعة (الترقية / الإضافة)
    if (m.messageStubType === 29 || m.messageStubType === 30 || m.action === 'add') {
        const metadata = await conn.groupMetadata(m.chat)
        const botId = conn.user.jid || conn.user.id
        
        let toDemote = []
        
        for (let participant of metadata.participants) {
            // سحب الإشراف إذا كان مشرفاً وليس مطوراً وليس البوت وليس صاحب المجموعة
            if (participant.admin && !global.owner.some(o => o[0] === participant.id.split('@')[0]) && participant.id !== botId && participant.id !== metadata.owner) {
                toDemote.push(participant.id)
            }
        }

        if (toDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')
            let info = `🛡️ *تـنبـيـه حـمـايـة:* تم سحب الرتبة من أعضاء غير مصرح لهم بموجب نظام الحماية.`
            await conn.reply(m.chat, info, fkontak, rcanal)
        }
    }
}

handler.help = ['حماية']
handler.tags = ['الـمـطـور']
handler.command = ['حماية', 'الحماية', 'protection']
handler.rowner = true // حصري للمطور الأساسي

export default handler
