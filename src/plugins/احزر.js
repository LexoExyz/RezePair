import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const emojiData = require('../src/data/miku4.json')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let emojiGames = new Map()

const EMOJI_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية (يمكنك تغييرها)
const reward = 20
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة عبر الأزرار
    if (text.includes('check_emoji|')) {
        let game = emojiGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            emojiGames.delete(chatId)
            let info = `✅ *إجابة صحيحة يا بطل!* 🎉\n🎯 الشخصية: *${correctResponse}*\n🏆 الفائز المتميز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* باقي معك محاولة واحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                emojiGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الشخصية الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_ايموجي') {
        let game = emojiGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة إيموجي جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        emojiGames.delete(chatId)
        let info = `🚪 انسحبت! الشخصية كانت: *${game.currentEmoji.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (emojiGames.has(chatId)) {
        let info = '⚠️ توجد لعبة إيموجي جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء لغز إيموجي جديد
    try {
        if (!emojiData || emojiData.length === 0) {
            let info = '❌ ملف بيانات الإيموجي غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedEmoji = emojiData[Math.floor(Math.random() * emojiData.length)]
        
        // استخراج 3 إجابات خاطئة عشوائية + الإجابة الصحيحة وخلطهم
        let allResponses = emojiData.map(item => item.response)
        let wrongOptions = [...new Set(allResponses.filter(res => res !== selectedEmoji.response))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedEmoji.response].sort(() => 0.5 - Math.random())

        emojiGames.set(chatId, {
            currentEmoji: selectedEmoji,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (emojiGames.has(chatId)) {
                    emojiGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 الشخصية الصحيحة كانت: *${selectedEmoji.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let emojiMedia = await prepareWAMessageMedia({ image: { url: EMOJI_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_emoji|${choice}|${selectedEmoji.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_ايموجي` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: emojiMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🧩 *لعبة احزر الشخصية بالإيموجي*\n\nمن تعني هذه الإيموجيز؟\n${selectedEmoji.question}\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الشخصية المناسبة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Emoji Anime Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        emojiGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['احزر']
handler.tags = ['الـالـعـاب']
handler.command = /^(احزر)$/i

export default handler
