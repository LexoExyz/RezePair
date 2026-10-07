import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const mikuData = require('../src/data/miku5.json')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let animeGames = new Map()

const ANIME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة افتراضية (يمكنك تغييرها)
const reward = 20
const gameTime = 30000 // 30 ثانية للإجابة

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. التحقق من الإجابة عبر الأزرار التفاعلية
    if (text.includes('check_anime|')) {
        let game = animeGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctResponse] = text.split('|')

        if (userChoice.trim() === correctResponse.trim()) {
            clearTimeout(game.timeoutId)
            animeGames.delete(chatId)
            let info = `✅ *إجابة صحيحة يا أوتاكو!* 🎉\n🎯 الشخصية: *${correctResponse}*\n🏆 الفائز المميز: @${senderId.split('@')[0]}\n📊 المكافأة: +${reward} نقطة`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* باقي معك محاولة واحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                animeGames.delete(chatId)
                let info = `💀 *انتهت المحاولات!* الشخصية الصحيحة كانت: *${correctResponse}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. الانسحاب من اللعبة
    if (text === 'انسحاب_انمي') {
        let game = animeGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد مسابقة أنمي جارية حالياً.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        animeGames.delete(chatId)
        let info = `🚪 انسحبت! الشخصية كانت: *${game.currentAnime.response}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (animeGames.has(chatId)) {
        let info = '⚠️ توجد لعبة أنمي جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء سؤال أنمي جديد
    try {
        if (!mikuData || mikuData.length === 0) {
            let info = '❌ ملف بيانات الأنمي غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedAnime = mikuData[Math.floor(Math.random() * mikuData.length)]
        
        // استخراج 3 إجابات خاطئة عشوائية + الإجابة الصحيحة وخلطهم
        let allResponses = mikuData.map(item => item.response)
        let wrongOptions = [...new Set(allResponses.filter(res => res !== selectedAnime.response))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedAnime.response].sort(() => 0.5 - Math.random())

        animeGames.set(chatId, {
            currentAnime: selectedAnime,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (animeGames.has(chatId)) {
                    animeGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n💡 الشخصية الصحيحة كانت: *${selectedAnime.response}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let animeMedia = await prepareWAMessageMedia({ image: { url: ANIME_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_anime|${choice}|${selectedAnime.response}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_انمي` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: animeMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🎌 *لعبة حزر شخصية الأنمي*\n\nمن هو صاحب هذا الوصف؟\n💬 "${selectedAnime.question}"\n\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الشخصية المناسبة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Anime Guess Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        animeGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تشغيل لعبة الأنمي، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['انمي2']
handler.tags = ['الـالـعـاب']
handler.command = /^(انمي2)$/i

export default handler
