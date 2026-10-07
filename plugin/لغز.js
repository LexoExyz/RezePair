import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const riddlesData = require('../src/data/riddles.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let riddleGames = new Map()

const RIDDLE_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية للغاز (يمكنك تغييرها)
const reward = 10
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_riddle|')) {
        let game = riddleGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            riddleGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n🎯 الجواب: *${correctResponse}*\n🏆 الفائز الذكي: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                riddleGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الإجابة الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_لغز') {
        let game = riddleGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد مسابقة ألغاز جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        riddleGames.delete(chatId)
        let info = `🚪 انسحبت! الإجابة الصحيحة كانت: *${game.currentRiddle.answer}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (riddleGames.has(chatId)) {
        let info = '⚠️ توجد لعبة ألغاز جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء لغز جديد
    try {
        if (!riddlesData || riddlesData.length === 0) {
            let info = '❌ ملف الألغاز غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedRiddle = riddlesData[Math.floor(Math.random() * riddlesData.length)]
        
        // استخراج 3 إجابات خاطئة عشوائية من باقي الألغاز + الإجابة الصحيحة وتوزيعهم عشوائياً
        let allAnswers = riddlesData.map(item => item.answer)
        let wrongOptions = [...new Set(allAnswers.filter(ans => ans !== selectedRiddle.answer))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedRiddle.answer].sort(() => 0.5 - Math.random())

        riddleGames.set(chatId, {
            currentRiddle: selectedRiddle,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (riddleGames.has(chatId)) {
                    riddleGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 الإجابة الصحيحة كانت: *${selectedRiddle.answer}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let riddleMedia = await prepareWAMessageMedia({ image: { url: RIDDLE_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_riddle|${choice}|${selectedRiddle.answer}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_لغز` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: riddleMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🧩 *لعبة ألغاز وفوازير*\n\n${selectedRiddle.question}\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الإجابة المناسبة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Riddles Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        riddleGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['لغز']
handler.tags = ['الـالـعـاب']
handler.command = /^(لغز)$/i

export default handler
