import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const capitalsData = require('../src/data/عواصم.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let capitalGames = new Map()

const CAPITAL_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية (يمكنك تغييرها)
const reward = 20
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة عبر الأزرار
    if (text.includes('check_capital|')) {
        let game = capitalGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            capitalGames.delete(chatId)
            let info = `✅ *إجابة صحيحة يا جغرافي!* 🎉\n🎯 العاصمة: *${correctResponse}*\n🏆 الفائز المميز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* باقي معك محاولة واحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                capitalGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* العاصمة الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_عواصم') {
        let game = capitalGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة عواصم جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        capitalGames.delete(chatId)
        let info = `🚪 انسحبت! العاصمة كانت: *${game.currentCapital.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (capitalGames.has(chatId)) {
        let info = '⚠️ توجد لعبة عواصم جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء جولة عواصم جديدة
    try {
        if (!capitalsData || capitalsData.length === 0) {
            let info = '❌ ملف بيانات العواصم غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedCapital = capitalsData[Math.floor(Math.random() * capitalsData.length)]
        
        // استخراج 3 إجابات خاطئة عشوائية + الإجابة الصحيحة وخلطهم
        let allResponses = capitalsData.map(item => item.response)
        let wrongOptions = [...new Set(allResponses.filter(res => res !== selectedCapital.response))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedCapital.response].sort(() => 0.5 - Math.random())

        capitalGames.set(chatId, {
            currentCapital: selectedCapital,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (capitalGames.has(chatId)) {
                    capitalGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 العاصمة الصحيحة كانت: *${selectedCapital.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let capitalMedia = await prepareWAMessageMedia({ image: { url: CAPITAL_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_capital|${choice}|${selectedCapital.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_عواصم` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: capitalMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🌍 *لعبة عواصم الدول*\n\nما هي عاصمة دولة:\n🏛️ *${selectedCapital.question}*؟\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر العاصمة الصحيحة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Capitals Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        capitalGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['عواصم']
handler.tags = ['الـالـعـاب']
handler.command = /^(عواصم)$/i

export default handler
