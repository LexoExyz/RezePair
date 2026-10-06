import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import fs from 'fs'
import path from 'path'

// إعداد مسار النقاط
const pointsFile = path.join(process.cwd(), 'data', 'points.json')
if (!fs.existsSync(path.dirname(pointsFile))) fs.mkdirSync(path.dirname(pointsFile), { recursive: true })
if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, JSON.stringify({}))

let guessGames = new Map()
const GAME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // --- 1. معالجة التحقق من الرقم عبر الأزرار ---
    if (text.includes('check_guess|')) {
        let game = guessGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctNumber] = text.split('|')

        if (userChoice === correctNumber) {
            clearTimeout(game.timeoutId)
            guessGames.delete(chatId)

            // تحديث النقاط
            let points = JSON.parse(fs.readFileSync(pointsFile))
            points[senderId] = (points[senderId] || 0) + 5
            fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2))

            let info = `🎉 *إجابة صحيحة!* ذكاء خارق 🔥\n🔢 الرقم كان: *${correctNumber}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 نقاطك الآن: ${points[senderId]} (+5)`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *رقم غلط!* لسا فاضل معك محاولة وحدة ⏳\nحاول تركز في الرقم الجاي!`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                guessGames.delete(chatId)
                let info = `💀 *خسرت!* خلصت محاولاتك.\n🔢 الرقم الصحيح كان: *${correctNumber}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // --- 2. معالجة الانسحاب ---
    if (text === 'انسحاب') {
        let game = guessGames.get(chatId)
        if (!game) {
            let info = '❌ مفيش لعبة شغالة عشان تنسحب.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        guessGames.delete(chatId)
        let info = `🚪 انسحبت! الرقم كان: *${game.correctNumber}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (guessGames.has(chatId)) {
        let info = '⚠️ في لعبة تخمين شغالة حالياً بالجروب!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // --- 3. بدء جولة تخمين جديدة ---
    try {
        const correctNumber = Math.floor(Math.random() * 50) + 1
        
        let choices = new Set()
        choices.add(correctNumber)
        while(choices.size < 5) {
            let rand = Math.floor(Math.random() * 50) + 1
            choices.add(rand)
        }
        let finalChoices = Array.from(choices).sort(() => 0.5 - Math.random())

        // إعداد الجلسة
        guessGames.set(chatId, {
            correctNumber: correctNumber,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (guessGames.has(chatId)) {
                    guessGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* محدش عرف الرقم.\n🔢 الرقم كان: *${correctNumber}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, 30000)
        })

        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = finalChoices.map(num => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: `🔢 ${num}`,
                id: `${usedPrefix + command} check_guess|${num}|${correctNumber}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🎲 *تحدي التخمين الذكي*\n\nخمن الرقم الصحيح من بين الاختيارات أدناه!\n⏳ الوقت: 30 ثانية\n❤️ المحاولات: 2` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Game System" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        guessGames.delete(chatId)
        let info = '❌ حدث خطأ، جرب تاني.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['خمن']
handler.tags = ['الـالـعـاف']
handler.command = /^(عشوائي|خمن|تخمين)$/i

export default handler
