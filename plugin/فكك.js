import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fakakData = require('../src/data/فكك.json')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let fakakGames = new Map()

const FAKAK_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية (يمكنك تغييرها)
const reward = 20
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة عبر الأزرار
    if (text.includes('check_fakak|')) {
        let game = fakakGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            fakakGames.delete(chatId)
            let info = `✅ *إجابة صحيحة يا بطل!* 🎉\n🎯 التفكيك الصحيح: *${correctResponse}*\n🏆 الفائز المميز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* باقي معك محاولة واحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                fakakGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* التفكيك الصحيح كان: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_فكك') {
        let game = fakakGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة فكك جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        fakakGames.delete(chatId)
        let info = `🚪 انسحبت! الإجابة الصحيحة كانت: *${game.currentFakak.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (fakakGames.has(chatId)) {
        let info = '⚠️ توجد لعبة فكك جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء جولة فكك جديدة
    try {
        if (!fakakData || fakakData.length === 0) {
            let info = '❌ ملف بيانات فكك غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedFakak = fakakData[Math.floor(Math.random() * fakakData.length)]
        
        // استخراج 3 إجابات خاطئة عشوائية + الإجابة الصحيحة وخلطهم
        let allResponses = fakakData.map(item => item.response)
        let wrongOptions = [...new Set(allResponses.filter(res => res !== selectedFakak.response))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedFakak.response].sort(() => 0.5 - Math.random())

        fakakGames.set(chatId, {
            currentFakak: selectedFakak,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (fakakGames.has(chatId)) {
                    fakakGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 التفكيك الصحيح كان: *${selectedFakak.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let fakakMedia = await prepareWAMessageMedia({ image: { url: FAKAK_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_fakak|${choice}|${selectedFakak.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_فكك` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: fakakMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🧩 *لعبة فكك الكلمات*\n\nفكك الاسم التالي:\n🔸 *${selectedFakak.question}*\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر التفكيك الصحيح من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Fakak Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        fakakGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['فكك']
handler.tags = ['الـالـعـاب']
handler.command = /^(فكك)$/i

export default handler
