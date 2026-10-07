import fs from 'fs'
import path from 'path'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const antibotPath = path.join(process.cwd(), 'data', 'antibot.json')
const ANTIBOT_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" 

if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
if (!fs.existsSync(antibotPath)) fs.writeFileSync(antibotPath, '{}')

const loadData = () => JSON.parse(fs.readFileSync(antibotPath))
const saveData = (data) => fs.writeFileSync(antibotPath, JSON.stringify(data, null, 2))

const detectedBots = {}

let handler = async (m, { conn, args, usedPrefix, command, isRepoOwner, isAdmin }) => {
    // 1. ميزة تعرف الغروب
    const isGroup = m.chat.endsWith('@g.us')
    if (!isGroup) {
        let info = '❌ هذا الأمر يعمل داخل المجموعات فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. التحقق من الصلاحيات (المطور أو المشرفين)
    if (!isRepoOwner && !isAdmin) {
        let info = '⚠️ هذا الأمر مخصص للمشرفين والمطور فقط!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
    
    let antibott = loadData()
    let action = args[0] ? args[0].toLowerCase() : ''

    if (action === 'طرد') {
        antibott[m.chat] = 'kick'
        saveData(antibott)
        let info = '✅ تم تفعيل الحماية: سيتم *طرد* البوتات تلقائياً.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    } 
    else if (action === 'ابقاء') {
        antibott[m.chat] = 'warn'
        saveData(antibott)
        let info = '✅ تم تفعيل الحماية: سيتم *تنبيه* المشرفين عند وجود بوت.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
    else if (action === 'اوف') {
        delete antibott[m.chat]
        saveData(antibott)
        let info = '❌ تم إيقاف نظام مضاد البوتات.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    } 
    else {
        // واجهة الأزرار للمطور والمشرفين
        let media = await prepareWAMessageMedia({ image: { url: ANTIBOT_IMAGE } }, { upload: conn.waUploadToServer })
        const currentMode = antibott[m.chat] === 'kick' ? '🚫 طرد تلقائي' : antibott[m.chat] === 'warn' ? '⚠️ إنذار فقط' : '⚪ معطل'
        
        const caption = `🛡️ *إعدادات حماية المجموعة*\n\nالوضع الحالي: *${currentMode}*\n\nيرجى اختيار الإجراء المناسب عند رصد بوتات غريبة 👇`

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚫 وضع الطرد", id: `${usedPrefix + command} طرد` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "⚠️ وضع الإبقاء", id: `${usedPrefix + command} ابقاء` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "⚪ إيقاف النظام", id: `${usedPrefix + command} اوف` }) }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }
}

handler.before = async (m, { conn, isBotAdmin }) => {
    const isGroup = m.chat.endsWith('@g.us')
    if (!isGroup || m.fromMe) return

    let antibott = loadData()
    let mode = antibott[m.chat]
    if (!mode) return

    // كشف البوتات (Baileys أو المعرفات القصيرة)
    const isBot = m.key.id.startsWith('BAE5') || (m.key.id.startsWith('3EB0') && m.key.id.length < 25)
    
    if (isBot) {
        if (!detectedBots[m.chat]) detectedBots[m.chat] = []
        if (detectedBots[m.chat].includes(m.sender)) return
        detectedBots[m.chat].push(m.sender)

        if (mode === 'kick') {
            if (!isBotAdmin) return
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
        } 
        else if (mode === 'warn') {
            let info = `⚠️ *رصد بوت!*\nتم اكتشاف بوت آخر: @${m.sender.split('@')[0]}`
            await conn.reply(m.chat, info, fkontak, rcanal)
        }

        setTimeout(() => {
            const index = detectedBots[m.chat].indexOf(m.sender)
            if (index > -1) detectedBots[m.chat].splice(index, 1)
        }, 10000)
    }
}

handler.help = ['لاللبوتات']
handler.tags = ['الـمـشـرفـيـن']
handler.command = /^(لاللبوتات|نوبوت|antibot)$/i

export default handler
