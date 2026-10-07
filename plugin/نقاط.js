// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import fs from 'fs'
import path from 'path'

// إعداد المسارات لبيئة Termux
const pointsPath = path.join(process.cwd(), 'data', 'points.json')
const POINTS_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
if (!fs.existsSync(pointsPath)) fs.writeFileSync(pointsPath, '{}')

const loadJSON = (file) => JSON.parse(fs.readFileSync(file))
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// دوال المنطق (التصنيفات والتقدم)
const getLevel = (points) => {
    if (points >= 1000000000) return 'المطور 👑'
    if (points >= 100000000) return 'الملك 🌀'
    if (points >= 10000000) return 'الرئيس 💀'
    if (points >= 1000000) return 'الزعيم 🔥🔥'
    if (points >= 100000) return 'القاتل المتسلسل 🔪🩸'
    if (points >= 10000) return 'الأسطور 🦁'
    if (points >= 1000) return 'المحترف 💎'
    if (points >= 500) return 'المبتدئ 🔥'
    if (points >= 200) return 'النوب 🌱'
    if (points < -10) return 'البوت 🪫'
    return 'بوت برو ماكس 🌱'
}

const getProgressBar = (points, maxPoints = 1000) => {
    const percentage = Math.min((points / (points > maxPoints ? points : maxPoints)) * 100, 100)
    const filledBlocks = Math.round(percentage / 10)
    const emptyBlocks = 10 - filledBlocks
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks) + ` ${Math.round(percentage)}%`
}

// دالة لتنقية وتنظيم معرف الواتساب لضمان عمل المنشن
const parseJid = (jid = '') => {
    if (!jid) return ''
    return jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = parseJid(m.sender)
    let points = loadJSON(pointsPath)

    // --- 1. عرض المتصدرين ---
    if (text === 'top') {
        const topEntries = Object.entries(points)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)

        const mentions = topEntries.map(([userId]) => parseJid(userId))
        const topUsers = topEntries.map(([userId, userPoints], index) => {
            const rankEmoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || '🔸'
            return `${rankEmoji} @${parseJid(userId).split('@')[0]} - ${userPoints} (${getLevel(userPoints)})`
        })

        let media = await prepareWAMessageMedia({ image: { url: POINTS_IMAGE } }, { upload: conn.waUploadToServer })
        let info = `🏆 *أفضل 10 لاعبين في 𝑹𝒆𝒛𝒆*\n\n${topUsers.join('\n')}\n\n🎯 تنافس مع الأصدقاء واصعد إلى القمة!`

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: info }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لوحة المتصدرين" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📊 نقاطي", id: `${usedPrefix + command} me` }) }]
                        }),
                        contextInfo: {
                            mentionedJid: mentions
                        }
                    })
                }
            }
        }, { quoted: m })
        
        return await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })
    }

    // --- 2. عرض نقاط المستخدم أو الشخص الممنشن ---
    let rawTarget = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : (text === 'me' ? m.sender : null))
    
    // إذا لم يحدد هدفا ولم يطلب "me" أو "top"، نعرض القائمة الرئيسية
    if (!rawTarget && text !== 'me') {
        let media = await prepareWAMessageMedia({ image: { url: POINTS_IMAGE } }, { upload: conn.waUploadToServer })
        let info = `📊 *نظام النقاط والتصنيفات*\nاستخدم الأزرار أدناه للتحكم 👇`

        const mainMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: info }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝑹𝒆𝒛𝒆" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📊 نقاطي", id: `${usedPrefix + command} me` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🏆 المتصدرين", id: `${usedPrefix + command} top` }) }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })
        
        return await conn.relayMessage(chatId, mainMsg.message, { messageId: mainMsg.key.id })
    }

    // تنقية وتحديث معرف الهدف
    let target = parseJid(rawTarget || senderId)
    
    // البحث عن النقاط بالمعرف المنقى أو المفتاح المخزن في الملف
    const userPoints = points[target] || points[rawTarget] || points[m.sender] || 0
    const userRank = getLevel(userPoints)
    const progressBar = getProgressBar(userPoints)

    let media = await prepareWAMessageMedia({ image: { url: POINTS_IMAGE } }, { upload: conn.waUploadToServer })
    let info = `📊 *إحصائيات النقاط*\n\n👤 اللاعب: @${target.split('@')[0]}\n🎖️ التصنيف: *${userRank}*\n💰 النقاط: *${userPoints}*\n📈 التقدم: ${progressBar}`

    const statsMsg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                    body: proto.Message.InteractiveMessage.Body.create({ text: info }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "استمر في اللعب لتحسين تصنيفك!" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🏆 المتصدرين", id: `${usedPrefix + command} top` }) }
                        ]
                    }),
                    contextInfo: {
                        mentionedJid: [target]
                    }
                })
            }
        }
    }, { quoted: m })

    return await conn.relayMessage(chatId, statsMsg.message, { messageId: statsMsg.key.id })
}

handler.help = ['نقاط']
handler.tags = ['الـأعـضـاء']
handler.command = /^(نقاط|نقاطي|points)$/i

export default handler
