import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const casesData = require('../src/data/cases.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let crimeGames = new Map()

const CASE_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتتاحية للقضية (يمكنك تعديلها)
const reward = 15
const gameTime = 40000 // 40 ثانية للتحقيق

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من القاتل (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_crime|')) {
        let game = crimeGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctKiller] = text.split('|')

        if (userChoice === correctKiller) {
            clearTimeout(game.timeoutId)
            crimeGames.delete(chatId)
            let info = `🕵️‍♂️ *تحقيق ناجح!* 🎉\n⚖️ القاتل الحقيقي هو: *${correctKiller}*\n🏆 المحقق البارع: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *اتهام خاطئ!* المشتبه به بريء، لسا معك محاولة أخيرة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                crimeGames.delete(chatId)
                let info = `💀 *فشل التحقيق!* انتهت المحاولات.\n🔪 القاتل الحقيقي كان: *${correctKiller}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_جريمة') {
        let game = crimeGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد قضية جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        crimeGames.delete(chatId)
        let info = `🚪 انسحبت من التحقيق! القاتل كان: *${game.currentCase.killer}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (crimeGames.has(chatId)) {
        let info = '⚠️️ توجد قضية قيد التحقيق بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء قضية جديدة
    try {
        if (!casesData || casesData.length === 0) {
            let info = '❌ ملف القضايا غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedCase = casesData[Math.floor(Math.random() * casesData.length)]
        
        // خلط المشتبه بهم لإظهارهم بشكل عشوائي على الأزرار
        let shuffledSuspects = [...selectedCase.suspects].sort(() => 0.5 - Math.random())

        crimeGames.set(chatId, {
            currentCase: selectedCase,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (crimeGames.has(chatId)) {
                    crimeGames.delete(crimeGames) // تم التصحيح لـ chatId
                    crimeGames.delete(chatId)
                    let info = `❌ *انتهى وقت التحقيق!* ⏰\n🔪 القاتل هرب! كان: *${selectedCase.killer}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let caseMedia = await prepareWAMessageMedia({ image: { url: CASE_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = shuffledSuspects.map(suspect => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: suspect,
                id: `${usedPrefix + command} check_crime|${suspect}|${selectedCase.killer}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_جريمة` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: caseMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🔍 *لعبة التحقيق والجريمة*\n\n${selectedCase.crime}\n\n⏳ الوقت: ${gameTime/1000} ثانية\n👤 من هو القاتل من بين المشتبه بهم؟ 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Detective Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        crimeGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء بدء التحقيق، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['جريمة']
handler.tags = ['الـالـعـاب']
handler.command = /^(جريمة|قضية|تحقيق|crime)$/i

export default handler
