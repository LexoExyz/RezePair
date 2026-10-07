import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const quizData = require('../src/data/islamicQuiz.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let quizGames = new Map()

const QUIZ_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية للأسئلة الإسلامية (يمكنك تغييرها)
const reward = 10
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_quiz|')) {
        let game = quizGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            quizGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n🎯 الجواب: *${correctResponse}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                quizGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الإجابة الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_مسابقة') {
        let game = quizGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد مسابقة جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        quizGames.delete(chatId)
        let info = `🚪 انسحبت! الإجابة الصحيحة كانت: *${game.currentQuiz.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (quizGames.has(chatId)) {
        let info = '⚠️ توجد مسابقة جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء سؤال جديد
    try {
        if (!quizData || quizData.length === 0) {
            let info = '❌ ملف الأسئلة غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedQuiz = quizData[Math.floor(Math.random() * quizData.length)]
        
        // استخراج النص الصافي للسؤال مع تنظيف الخيارات المضمنة في النص لعرضها بشكل مرتب
        let parts = selectedQuiz.question.split('\n').map(p => p.trim()).filter(p => p !== '')
        let questionTitle = parts[0]
        let options = parts.slice(1).sort(() => 0.5 - Math.random()) // خلط الخيارات عشوائياً

        quizGames.set(chatId, {
            currentQuiz: selectedQuiz,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (quizGames.has(chatId)) {
                    quizGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 الإجابة الصحيحة كانت: *${selectedQuiz.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let quizMedia = await prepareWAMessageMedia({ image: { url: QUIZ_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = options.map(opt => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: opt,
                id: `${usedPrefix + command} check_quiz|${opt}|${selectedQuiz.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_مسابقة` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: quizMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🕌 *سؤال إسلامي*\n\n${questionTitle}\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الإجابة المناسبة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Islamic Quiz" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        quizGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء طرح السؤال، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['ديني']
handler.tags = ['الـالـعـاب']
handler.command = /^(ديني)$/i

export default handler
