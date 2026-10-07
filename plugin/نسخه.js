// تطوير وتعديل: 𝑹𝒆𝒛𝒆 —̳͟͞𝒍𝒆𝒙𝒐
import fs from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = baileys

/**
 * group_manager_pro.js
 * إدارة نسخ المجموعات (نسخ تلقائي، حذف ولصق بالأزرار)
 * الصلاحية: المطور فقط
 */

let handler = async (m, { conn, args, isROwner, usedPrefix, command }) => {
    if (!isROwner) return

    const baseDir = join(process.cwd(), 'src', 'copy-group')
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })

    const action = args[0]?.toLowerCase()
    const name = args.slice(1).join(' ').trim()

    // --- 1. النسخ التلقائي ---
    if (action === 'نسخ') {
        if (!m.isGroup) {
            let info = '❗ يجب أن تكون داخل مجموعة للنسخ.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        
        const meta = await conn.groupMetadata(m.chat)
        const autoName = meta.subject 
        const savePath = join(baseDir, autoName)

        const groupData = {
            subject: meta.subject,
            description: meta.desc || '',
            announce: !!meta.announce,
            restrict: !!meta.restrict
        }

        fs.mkdirSync(savePath, { recursive: true })
        fs.writeFileSync(join(savePath, 'groupData.json'), JSON.stringify(groupData, null, 2))

        try {
            const pfp = await conn.profilePictureUrl(m.chat, 'image')
            const res = await fetch(pfp)
            const buffer = await res.buffer()
            fs.writeFileSync(join(savePath, 'pfp.jpg'), buffer)
        } catch (e) { console.log('لا توجد صورة للمجموعة') }

        let info = `✅ تم حفظ نسخة تلقائية باسم:\n*${autoName}*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // --- 2. اللصق ---
    if (action === 'لصق') {
        if (!m.isGroup) {
            let info = '❗ يجب أن تكون في مجموعة لتطبيق النسخة.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (name) return applyCopy(conn, m, baseDir, name)

        return sendGroupButtons(conn, m, baseDir, usedPrefix, command, 'لصق', '📋 إختر النسخة التي تريد لصقها:')
    }

    // --- 3. الحذف ---
    if (action === 'حذف') {
        if (name) {
            const delPath = join(baseDir, name)
            if (!fs.existsSync(delPath)) {
                let info = '❌ هذه النسخة غير موجودة.'
                return conn.reply(m.chat, info, fkontak, rcanal)
            }
            fs.rmSync(delPath, { recursive: true, force: true })
            let info = `🗑️ تم حذف النسخة *${name}* بنجاح.`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        return sendGroupButtons(conn, m, baseDir, usedPrefix, command, 'حذف', '🗑️ إختر النسخة التي تريد حذفها نهائياً:')
    }

    // --- واجهة الخيارات الرئيسية بالأزرار ---
    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ 
                        text: `*🛠️ إدارة المجموعات (المطور):*\n\nاختر الامر الذي تريد القيام به:` 
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝑹𝒆𝒛𝒆 —̳͟͞𝒍𝒆𝒙𝒐" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "📥 نسخ المجموعة",
                                    id: `${usedPrefix + command} نسخ`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "📋 لصق نسخة",
                                    id: `${usedPrefix + command} لصق`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "🗑️ حذف نسخة",
                                    id: `${usedPrefix + command} حذف`
                                })
                            }
                        ]
                    })
                })
            }
        }
    }, { quoted: m })

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// دالة توليد وإرسال أزرار القائمة (النسخ المحفوظة)
async function sendGroupButtons(conn, m, baseDir, usedPrefix, command, type, bodyText) {
    const list = fs.readdirSync(baseDir)
    if (list.length === 0) {
        let info = '❗ الحافظة فارغة، لا توجد نسخ محفوظة.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let buttons = list.map(n => ({
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
            display_text: `${type === 'لصق' ? '📋' : '🗑️'} ${n}`,
            id: `${usedPrefix + command} ${type} ${n}`
        })
    }))

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝑹𝒆𝒛𝒆 —̳͟͞𝒍𝒆𝒙𝒐" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: buttons
                    })
                })
            }
        }
    }, { quoted: m })

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// دالة تنفيذ اللصق
async function applyCopy(conn, m, baseDir, name) {
    const dataPath = join(baseDir, name, 'groupData.json')
    if (!fs.existsSync(dataPath)) {
        let info = '❌ البيانات مفقودة.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const data = JSON.parse(fs.readFileSync(dataPath))
    let waitInfo = '⏳ جاري تطبيق النسخة...'
    conn.reply(m.chat, waitInfo, fkontak, rcanal)

    try {
        await conn.groupUpdateSubject(m.chat, data.subject)
        await conn.groupUpdateDescription(m.chat, data.description)
        await conn.groupSettingUpdate(m.chat, data.announce ? 'announcement' : 'not_announcement')
        await conn.groupSettingUpdate(m.chat, data.restrict ? 'locked' : 'unlocked')

        const imgPath = join(baseDir, name, 'pfp.jpg')
        if (fs.existsSync(imgPath)) {
            await conn.updateProfilePicture(m.chat, fs.readFileSync(imgPath))
        }
        let info = `✅ تم لصق بيانات *${name}* بنجاح!`
        return conn.reply(m.chat, info, fkontak, rcanal)
    } catch (e) {
        let info = `❌ فشل التحديث (تأكد من رتبة الأدمن).\nالخطأ: ${e.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['نسخة']
handler.tags = ['الـمـطـور']
handler.command = ['نسخة', 'نسخه']
handler.rowner = true

export default handler
