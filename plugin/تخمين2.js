import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const charactersData = require('../src/data/animeCharacters.js') // تأكد من تسمية ملف البيانات لديك

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let guessGames = new Map()

const GUEST_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية للعبة (يمكنك تغييرها)
const reward = 10
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_guess|')) {
        let game = guessGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctCharacter] = text.split('|')

        if (userChoice === correctCharacter) {
            clearTimeout(game.timeoutId)
            guessGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n👤 الشخصية هي: *${correctCharacter}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                guessGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الشخصية الصحيحة كانت: *${correctCharacter}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_تخمين') {
        let game = guessGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        guessGames.delete(chatId)
        let info = `🚪 انسحبت! الشخصية كانت: *${game.currentCharacter.name}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (guessGames.has(chatId)) {
        let info = '⚠️ توجد لعبة جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء جولة جديدة
    try {
        if (!charactersData || charactersData.length === 0) {
            let info = '❌ ملف بيانات الشخصيات غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedChar = charactersData[Math.floor(Math.random() * charactersData.length)]
        
        // استخراج 3 أسماء خاطئة عشوائية + الاسم الصحيح وخلطهم
        let allNames = charactersData.map(item => item.name)
        let wrongOptions = [...new Set(allNames.filter(name => name !== selectedChar.name))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedChar.name].sort(() => 0.5 - Math.random())

        guessGames.set(chatId, {
            currentCharacter: selectedChar,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (guessGames.has(chatId)) {
                    guessGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n👤 الشخصية كانت: *${selectedChar.name}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let gameMedia = await prepareWAMessageMedia({ image: { url: GUEST_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_guess|${choice}|${selectedChar.name}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_تخمين` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: gameMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🧠 *من تكون هذه الشخصية؟*\n\n💬 "${selectedChar.description}"\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر اسم الشخصية المناسب من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Character Guess Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        guessGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['تخمين2']
handler.tags = ['الـالـعـاب']
handler.command = /^(تخمين2)$/i

export default handler
