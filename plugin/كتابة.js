/*
░▒▓█ لعبة كتابة الكلمات (كت) █▓▒░
*/

import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import fs from 'fs'
import path from 'path'

// إعداد المسارات لبيئة Termux
const pointsPath = path.join(process.cwd(), 'data', 'points.json')
const ranksPath = path.join(process.cwd(), 'data', 'ranks.json')
const GAME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

// التأكد من وجود المجلدات والملفات
if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
if (!fs.existsSync(pointsPath)) fs.writeFileSync(pointsPath, '{}')
if (!fs.existsSync(ranksPath)) fs.writeFileSync(ranksPath, '{}')

// دوال المساعدة
const loadJSON = (file) => JSON.parse(fs.readFileSync(file))
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const rewardMap = { سهل: 50, متوسط: 100, صعب: 200 }
const timeMap = { سهل: 15000, متوسط: 20000, صعب: 30000 }

const words = {
    سهل: ['ناروتو', 'ساسكي', 'ايتاتشي', 'لوفي', 'زورو', 'سانجي', 'كاكاشي', 'غوكو'],
    متوسط: ['ناروتو اوزوماكي', 'ساسكي أوتشيها', 'مونكي دي لوفي', 'رورونوا زورو'],
    صعب: ['ناروتو اوزوماكي هوكاغي القرية', 'ساسكي أوتشيها صاحب الشارينغان', 'إيتاتشي أوتشيها بطل كونوها']
}

let takfikGames = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // --- 1. معالجة بدء اللعبة بمستوى معين ---
    if (text.startsWith('start_game|')) {
        let level = text.split('|')[1]
        if (takfikGames.has(chatId)) return m.reply('⚠️ هناك لعبة جارية بالفعل في هذه المجموعة!')

        const levelWords = words[level]
        const word = levelWords[Math.floor(Math.random() * levelWords.length)]
        
        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
        
        const caption = `📖 *اكتب الكلمة التالية:*\n\n*${word}*\n\n⏳ الوقت: ${timeMap[level] / 1000} ثانية\n🎯 المستوى: ${level}\n🏆 الجائزة: ${rewardMap[level]} نقطة\n\n*أرسل الكلمة الصحيحة الآن!*`

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} quit` }) }]
                        })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })

        takfikGames.set(chatId, {
            word, level, senderId,
            timeout: setTimeout(() => {
                if (takfikGames.has(chatId)) {
                    takfikGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!*\nالكلمة كانت: *${word}*`
                    return conn.reply(chatId, info, fkontak, rcanal)
                }
            }, timeMap[level])
        })
        return
    }

    // --- 2. معالجة الانسحاب ---
    if (text === 'quit') {
        if (!takfikGames.has(chatId)) return
        clearTimeout(takfikGames.get(chatId).timeout)
        takfikGames.delete(chatId)
        let info = '🚪 تم إنهاء اللعبة بنجاح.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // --- 3. عرض قائمة اختيار المستوى (الواجهة الرئيسية) ---
    if (takfikGames.has(chatId)) return m.reply('⚠️ هناك لعبة جارية بالفعل!')

    let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
    const mainCaption = `📖 *لعبة كتابة الكلمات*\n\nاختبر سرعتك في الكتابة! 🧠\n\n🎯 *المستويات:* (سهل، متوسط، صعب)\n\nاضغط على الزر لبدء التحدي 👇`

    const mainMsg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                    body: proto.Message.InteractiveMessage.Body.create({ text: mainCaption }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🟢 سهل", id: `${usedPrefix + command} start_game|سهل` }) },
                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🟡 متوسط", id: `${usedPrefix + command} start_game|متوسط` }) },
                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔴 صعب", id: `${usedPrefix + command} start_game|صعب` }) }
                        ]
                    })
                })
            }
        }
    }, { quoted: m })

    await conn.relayMessage(chatId, mainMsg.message, { messageId: mainMsg.key.id })
}

// معالجة الإجابات
handler.before = async (m, { conn }) => {
    let chatId = m.chat
    if (!takfikGames.has(chatId) || !m.text) return
    
    let game = takfikGames.get(chatId)
    if (m.text.trim() === game.word) {
        clearTimeout(game.timeout)
        takfikGames.delete(chatId)
        
        let points = loadJSON(pointsPath)
        points[m.sender] = (points[m.sender] || 0) + rewardMap[game.level]
        saveJSON(pointsPath, points)

        let info = `✅ *إجابة صحيحة!* 🎉\n\n🏆 الفائز: @${m.sender.split('@')[0]}\n📊 نقاطك: ${points[m.sender]} (+${rewardMap[game.level]})`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['كت']
handler.tags = ['الـالـعـاب']
handler.command = /^(كتابة|كت)$/i

export default handler
