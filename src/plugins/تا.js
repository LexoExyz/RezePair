import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const animeImages = require('../src/data/animeImages.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let animeGames = new Map()

const reward = 10
const gameTime = 30000 // 30 ثانية

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_anime|')) {
        let game = animeGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctCharacter] = text.split('|')

        if (userChoice === correctCharacter) {
            clearTimeout(game.timeoutId)
            animeGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n👤 الشخصية: *${correctCharacter}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 النقاط: +${reward}`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *جواب غلط!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                animeGames.delete(chatId)
                let info = `💀 *خسرت!* المحاولات انتهت.\n👤 الشخصية الصحيحة كانت: *${correctCharacter}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب_انمي') {
        let game = animeGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة جارية.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        animeGames.delete(chatId)
        let info = `🚪 انسحبت! الشخصية كانت: *${game.character.name}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (animeGames.has(chatId)) {
        let info = '⚠️ توجد لعبة جارية بالفعل في هذه الدردشة!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // 3. بدء جولة الشخصية
    try {
        if (!animeImages || animeImages.length === 0) {
            let info = '❌ ملف الصور غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        const selectedCharacter = animeImages[Math.floor(Math.random() * animeImages.length)]
        
        // استخراج 4 خيارات عشوائية (الإجابة الصحيحة + 3 إجابات خاطئة)
        let allNames = animeImages.map(item => item.name)
        let wrongOptions = [...new Set(allNames.filter(name => name !== selectedCharacter.name))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        let choices = [...wrongOptions, selectedCharacter.name].sort(() => 0.5 - Math.random())

        animeGames.set(chatId, {
            character: selectedCharacter,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (animeGames.has(chatId)) {
                    animeGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n👤 الشخصية كانت: *${selectedCharacter.name}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, gameTime)
        })

        let animeMedia = await prepareWAMessageMedia({ image: { url: selectedCharacter.url } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_anime|${choice}|${selectedCharacter.name}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_انمي` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: animeMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `⛩️ *من هي شخصية الأنمي في الصورة ؟*\n⏳ الوقت: ${gameTime/1000} ثانية\n🎯 اختر الإجابة الصحيحة من الأسفل 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Anime Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        animeGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تحميل اللعبة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['انمي']
handler.tags = ['الـالـعـاب']
handler.command = /^(انمي|شخصية|anime)$/i

export default handler
