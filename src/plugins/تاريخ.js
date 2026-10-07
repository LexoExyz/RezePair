import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire(import.meta.url)

// قراءة ملف الـ JSON مباشرة لدعم صيغة .json
const historyData = JSON.parse(fs.readFileSync('./src/data/تاريخ.json', 'utf8'))

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let historyGames = new Map()

const HISTORY_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية للعبة التاريخ (يمكنك تغييرها)
const reward = 15
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_history|')) {
        let game = historyGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            historyGames.delete(chatId)
            let info = `✅ *إجابة تاريخية صحيحة!* 🎉\n🎯 الجواب: *${correctResponse}*\n🏆 المؤرخ الفائز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                historyGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الإجابة الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_تاريخ') {
        let game = historyGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد مسابقة تاريخية جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        historyGames.delete(chatId)
        let info = `🚪 انسحبت! الإجابة الصحيحة كانت: *${game.currentHistory.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (historyGames.has(chatId)) {
        let info = '⚠️ توجد مسابقة تاريخية جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء سؤال تاريخي جديد
    try {
        if (!historyData || historyData.length === 0) {
            let info = '❌ ملف البيانات التاريخية غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedHistory = historyData[Math.floor(Math.random() * historyData.length)]
        
        // استخراج إجابات خاطئة عشوائية من باقي الأسئلة لتوليد 3 خيارات خطأ + الإجابة الصحيحة
        let allResponses = historyData.map(item => item.response)
        let wrongOptions = [...new Set(allResponses.filter(res => res !== selectedHistory.response))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedHistory.response].sort(() => 0.5 - Math.random())

        historyGames.set(chatId, {
            currentHistory: selectedHistory,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (historyGames.has(chatId)) {
                    historyGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 الإجابة الصحيحة كانت: *${selectedHistory.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let historyMedia = await prepareWAMessageMedia({ image: { url: HISTORY_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_history|${choice}|${selectedHistory.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_تاريخ` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: historyMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `📜 *سؤال تاريخي*\n\n${selectedHistory.question}\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الإجابة المناسبة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "History Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        historyGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء طرح السؤال التاريخي، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['تاريخ', 'تاريخي']
handler.tags = ['الـالـعـاب']
handler.command = /^(تاريخ|تاريخي|history)$/i

export default handler
