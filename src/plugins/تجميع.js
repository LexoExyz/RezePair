import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import fs from 'fs'
import path from 'path'

// إعداد المسارات لبيئة Termux
const pointsPath = path.join(process.cwd(), 'data', 'points.json')
const GAME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
if (!fs.existsSync(pointsPath)) fs.writeFileSync(pointsPath, '{}')

const loadJSON = (file) => JSON.parse(fs.readFileSync(file))
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const rewardMap = { سهل: 50, متوسط: 100, صعب: 200 }
const timeMap = { سهل: 15000, متوسط: 20000, صعب: 30000 }

const scramble = (word) => word.split('').join(' ').trim()

const words = {
    سهل: ['ناروتو', 'ساسكي', 'ايتاتشي', 'لوفي', 'زورو', 'سانجي', 'نامي', 'غوكو', 'فيجيتا', 'غون', 'كيلوا', 'كيسوكي', 'هيناتا', 'ميكاسا', 'ليفاي', 'اريرين', 'كاكاشي'],
    متوسط: ['ناروتو اوزوماكي', 'مونكي دي لوفي', 'رورونوا زورو', 'فينسموك سانجي', 'بورتجاس دي ايس', 'تراغالغار لاو', 'سايتاما الصلع', 'يوجي ايتادوري', 'ساتورو غوجو', 'شوتو تودوروكي'],
    صعب: ['ناروتو اوزوماكي هوكاغي', 'مونكي دي لوفي ملك القراصنة', 'ايتاتشي اوتشيها بطل كونوها', 'ارلوين سميث قائد الفيلق', 'ادوارد نيوجيت اللحية البيضاء', 'ترافلجار لاو جراح الموت']
}

let tajmi3Games = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat

    // --- 1. بدء اللعبة ---
    if (text.startsWith('start_game|')) {
        let level = text.split('|')[1]
        if (tajmi3Games.has(chatId)) {
            let info = '⚠️ هناك لعبة تجميع جارية بالفعل!'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        const levelWords = words[level]
        const originalWord = levelWords[Math.floor(Math.random() * levelWords.length)]
        const scrambledWord = scramble(originalWord) 
        
        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
        
        const caption = `🧩 *لعبة التجميع*\n\nجمع الحروف التالية لتكوين الكلمة:\n\n*${scrambledWord}*\n\n⏳ الوقت: ${timeMap[level] / 1000} ثانية\n🎯 المستوى: ${level}\n🏆 الجائزة: ${rewardMap[level]} نقطة`

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "قسم الألعاب • System" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} quit` }) }]
                        })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })

        tajmi3Games.set(chatId, {
            word: originalWord,
            level,
            timeout: setTimeout(() => {
                if (tajmi3Games.has(chatId)) {
                    tajmi3Games.delete(chatId)
                    let info = `❌ *انتهى الوقت!*\nالكلمة كانت: *${originalWord}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, timeMap[level])
        })
        return
    }

    if (text === 'quit') {
        if (!tajmi3Games.has(chatId)) return
        clearTimeout(tajmi3Games.get(chatId).timeout)
        tajmi3Games.delete(chatId)
        let info = '🚪 تم الانسحاب من اللعبة.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // --- 2. القائمة الرئيسية ---
    if (tajmi3Games.has(chatId)) {
        let info = '⚠️ هناك لعبة جارية بالفعل!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
    const mainCaption = `🧩 *لعبة التجميع (الأوتـاكو)*\n\nسأعطيك حروفاً مفككة، وعليك تجميعها وكتابة الكلمة الصحيحة! 🧠\n\nاضغط على الزر لبدء التحدي 👇`

    const mainMsg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                    body: proto.Message.InteractiveMessage.Body.create({ text: mainCaption }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "قسم الألعاب • System" }),
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
handler.before = async (m, { conn }) => {
    let chatId = m.chat
    if (!tajmi3Games.has(chatId) || !m.text) return
    
    let game = tajmi3Games.get(chatId)
    let userAnswer = m.text.trim().replace(/\s+/g, '')
    let correctAnswer = game.word.replace(/\s+/g, '')

    if (userAnswer === correctAnswer) {
        clearTimeout(game.timeout)
        tajmi3Games.delete(chatId)
        
        let points = loadJSON(pointsPath)
        points[m.sender] = (points[m.sender] || 0) + rewardMap[game.level]
        saveJSON(pointsPath, points)

        let info = `✅ *تجميع صحيح!* 🎉\n\n🏆 الفائز: @${m.sender.split('@')[0]}\n📊 نقاطك: ${points[m.sender]} (+${rewardMap[game.level]})`
        conn.reply(m.chat, info, fkontak, rcanal, { mentions: [m.sender] })
    }
}

handler.help = ['تجميع']
handler.tags = ['الـالـعـاب']
handler.command = /^(تجميع|جمع)$/i

export default handler
