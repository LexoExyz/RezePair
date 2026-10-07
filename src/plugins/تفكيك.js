import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import fs from 'fs'
import path from 'path'

// إعداد المسارات لبيئة التخزين
const pointsPath = path.join(process.cwd(), 'data', 'points.json')
const GAME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
if (!fs.existsSync(pointsPath)) fs.writeFileSync(pointsPath, '{}')

const loadJSON = (file) => JSON.parse(fs.readFileSync(file))
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const rewardMap = { سهل: 50, متوسط: 100, صعب: 200 }
const timeMap = { سهل: 15000, متوسط: 20000, صعب: 30000 }

// الكلمات التي سيقوم اللاعب بتفكيكها
const words = {
    سهل: ['ناروتو', 'ساسكي', 'ايتاتشي', 'لوفي', 'زورو', 'سانجي', 'نامي', 'غوكو', 'فيجيتا'],
    متوسط: ['ناروتو اوزوماكي', 'مونكي دي لوفي', 'رورونوا زورو', 'فينسموك سانجي'],
    صعب: ['ناروتو اوزوماكي هوكاغي', 'مونكي دي لوفي ملك القراصنة', 'ايتاتشي اوتشيها بطل كونوها']
}

let tafkikGames = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat

    // --- 1. بدء اللعبة ---
    if (text.startsWith('start_game|')) {
        let level = text.split('|')[1]
        if (tafkikGames.has(chatId)) return m.reply('⚠️ هناك لعبة تفكيك جارية بالفعل!')

        const levelWords = words[level]
        const originalWord = levelWords[Math.floor(Math.random() * levelWords.length)]
        // الإجابة الصحيحة التي يتوقعها البوت (مفككة بمسافات)
        const correctTafkik = originalWord.split('').join(' ').trim()
        
        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
        
        const caption = `✂️ *لعبة التفكيك*\n\nقم بتفكيك الكلمة التالية بوضع مسافة بين كل حرف:\n\n*${originalWord}*\n\n⏳ الوقت: ${timeMap[level] / 1000} ثانية\n🎯 المستوى: ${level}\n🏆 الجائزة: ${rewardMap[level]} نقطة\n\n*مثال للإجابة:* ل و ف ي`

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة التفكيك" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} quit` }) }]
                        })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })

        tafkikGames.set(chatId, {
            target: correctTafkik,
            original: originalWord,
            level,
            timeout: setTimeout(() => {
                if (tafkikGames.has(chatId)) {
                    tafkikGames.delete(chatId)
                    conn.reply(chatId, `❌ *انتهى الوقت!*\nالتفكيك الصحيح كان: *${correctTafkik}*`, fkontak, rcanal)
                }
            }, timeMap[level])
        })
        return
    }

    if (text === 'quit') {
        if (!tafkikGames.has(chatId)) return
        clearTimeout(tafkikGames.get(chatId).timeout)
        tafkikGames.delete(chatId)
        return m.reply('🚪 تم الانسحاب من لعبة التفكيك.')
    }

    // --- 2. القائمة الرئيسية ---
    if (tafkikGames.has(chatId)) return m.reply('⚠️ هناك لعبة جارية بالفعل!')

    let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
    const mainCaption = `✂️ *لعبة التفكيك*\n\nسأعطيك كلمة متصلة، وعليك تفكيكها بوضع مسافات بين الحروف! 🧠\n\nاضغط على الزر لبدء التحدي 👇`

    const mainMsg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                    body: proto.Message.InteractiveMessage.Body.create({ text: mainCaption }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة التفكيك" }),
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

// --- 3. معالجة الإجابات ---
handler.before = async (m) => {
    let chatId = m.chat
    if (!tafkikGames.has(chatId) || !m.text) return
    
    let game = tafkikGames.get(chatId)
    let userAnswer = m.text.trim().replace(/\s+/g, ' ')

    if (userAnswer === game.target) {
        clearTimeout(game.timeout)
        tafkikGames.delete(chatId)
        
        let points = loadJSON(pointsPath)
        points[m.sender] = (points[m.sender] || 0) + rewardMap[game.level]
        saveJSON(pointsPath, points)

        m.reply(`✅ *تفكيك احترافي!* 🎉\n\n🏆 الفائز: @${m.sender.split('@')[0]}\n📊 نقاطك: ${points[m.sender]} (+${rewardMap[game.level]})`, null, { mentions: [m.sender] })
    }
}

handler.help = ['تفكيك']
handler.tags = ['الـالـعـاب']
handler.command = /^(تفكيك|فكك)$/i

export default handler
