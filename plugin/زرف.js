import fs from 'fs'
import { join } from 'path'

/**
 * zarf_handler.js
 * بلوقن: الزرف الشامل المطور
 * الصلاحية: المطور فقط
 */

let handler = async (m, { conn, isOwner }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❗ هذا الأمر يعمل فقط داخل المجموعات.', fkontak, rcanal)
    if (!isOwner) return conn.reply(m.chat, '❗ هذا الأمر مخصص للمطور فقط.', fkontak, rcanal)

    try {
        const groupJid = m.chat
        const botNumber = conn.user.jid || conn.user.id
        const jsonPath = join(process.cwd(), 'zrf.json')
        
        if (!fs.existsSync(jsonPath)) return m.reply('❌ ملف zrf.json غير موجود.')

        const zarfData = JSON.parse(fs.readFileSync(jsonPath))
        const groupMetadata = await conn.groupMetadata(groupJid)

        // 1. إغلاق المجموعة
        if (!groupMetadata.announce) {
            await conn.groupSettingUpdate(groupJid, 'announcement').catch(() => {})
        }

        // 2. التفاعل
        if (zarfData.reaction_status === "on" && zarfData.reaction) {
            await conn.sendMessage(groupJid, { react: { text: zarfData.reaction, key: m.key } }).catch(() => {})
        }

        // 3. تنزيل المشرفين
        const membersToDemote = groupMetadata.participants
            .filter(p => p.id !== botNumber && p.id !== m.sender && p.admin !== null)
            .map(p => p.id)

        if (membersToDemote.length > 0) {
            await conn.groupParticipantsUpdate(groupJid, membersToDemote, 'demote').catch(() => {})
        }

        // 4. تحديث الاسم والوصف والصورة
        if (zarfData.group?.status === "on") {
            if (zarfData.group.newSubject) await conn.groupUpdateSubject(groupJid, zarfData.group.newSubject).catch(() => {})
            if (zarfData.group.newDescription) await conn.groupUpdateDescription(groupJid, zarfData.group.newDescription).catch(() => {})
        }
        if (zarfData.media?.status === "on" && zarfData.media.image) {
            const imgPath = join(process.cwd(), zarfData.media.image)
            if (fs.existsSync(imgPath)) await conn.updateProfilePicture(groupJid, fs.readFileSync(imgPath)).catch(() => {})
        }

        // 5. الرسائل والوسائط النهائية
        if (zarfData.messages?.status === "on") {
            const allParticipants = groupMetadata.participants.map(p => p.id)
            if (zarfData.messages.mention) await conn.sendMessage(groupJid, { text: zarfData.messages.mention, mentions: allParticipants }).catch(() => {})
            
            if (zarfData.messages.final) {
                await conn.sendMessage(groupJid, { text: zarfData.messages.final }).catch(() => {})

                // إرسال الصوت بالبيانات المطلوبة (التعديل المطلوب)
                if (zarfData.audio?.status === "on" && zarfData.audio.file) {
                    const audioPath = join(process.cwd(), zarfData.audio.file)
                    if (fs.existsSync(audioPath)) {
                        await conn.sendMessage(groupJid, {
                            audio: fs.readFileSync(audioPath),
                            mimetype: 'audio/mpeg',
                            ptt: true,
                            contextInfo: {
                                isForwarded: true,
                                forwardingScore: 999,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363407824639998@newsletter",
                                    newsletterName: "૭ 𝐘𝐮𝐭𝐚 › 𝐁𝐨𝐭  ৴৴ 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐜𝐡𝐚𝐧𝐧𝐞𝐥 ⌕",
                                    serverMessageId: 888
                                }
                            }
                        }).catch(() => {})
                    }
                }

                // إرسال الاستيكر
                if (zarfData.sticker?.status === "on" && zarfData.sticker.file) {
                    const stickerPath = join(process.cwd(), zarfData.sticker.file)
                    if (fs.existsSync(stickerPath)) await conn.sendMessage(groupJid, { sticker: fs.readFileSync(stickerPath) }).catch(() => {})
                }
            }
        }

    } catch (e) {
        console.error(e)
    }
}

handler.help = ['زرف']
handler.tags = ['الـمـطـور']
handler.command = /^(زرف|zrf)$/i
handler.rowner = true 
handler.group = true

export default handler
