import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let flagGames = new Map()

const FLAG_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

// قاعدة البيانات (تمت إضافة دول إضافية)
const flags = {
  سهل: [
    { country: 'مصر', url: 'https://flagcdn.com/w320/eg.png' },
    { country: 'السعودية', url: 'https://flagcdn.com/w320/sa.png' },
    { country: 'المغرب', url: 'https://flagcdn.com/w320/ma.png' },
    { country: 'العراق', url: 'https://flagcdn.com/w320/iq.png' },
    { country: 'الجزائر', url: 'https://flagcdn.com/w320/dz.png' },
    { country: 'تونس', url: 'https://flagcdn.com/w320/tn.png' },
    { country: 'الأردن', url: 'https://flagcdn.com/w320/jo.png' }
  ],
  متوسط: [
    { country: 'فرنسا', url: 'https://flagcdn.com/w320/fr.png' },
    { country: 'اليابان', url: 'https://flagcdn.com/w320/jp.png' },
    { country: 'البرازيل', url: 'https://flagcdn.com/w320/br.png' },
    { country: 'ألمانيا', url: 'https://flagcdn.com/w320/de.png' },
    { country: 'إيطاليا', url: 'https://flagcdn.com/w320/it.png' },
    { country: 'تركيا', url: 'https://flagcdn.com/w320/tr.png' }
  ],
  صعب: [
    { country: 'سريلانكا', url: 'https://flagcdn.com/w320/lk.png' },
    { country: 'نيبال', url: 'https://flagcdn.com/w320/np.png' },
    { country: 'بوتان', url: 'https://flagcdn.com/w320/bt.png' },
    { country: 'كيريباتي', url: 'https://flagcdn.com/w320/ki.png' },
    { country: 'تركمانستان', url: 'https://flagcdn.com/w320/tm.png' }
  ]
}

const rewardMap = { سهل: 5, متوسط: 10, صعب: 15 }
const timeMap = { سهل: 30000, متوسط: 20000, صعب: 15000 }

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // 1. معالجة التحقق من الإجابة (عبر الـ ID الخاص بالأزرار)
    if (text.includes('check_flag|')) {
        let game = flagGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctCountry] = text.split('|')

        if (userChoice === correctCountry) {
            clearTimeout(game.timeoutId)
            flagGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n🏁 الدولة: *${correctCountry}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 النقاط: +${rewardMap[game.level]}`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *جواب غلط!* لسا فاضل معك محاولة وحدة ⏳`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                flagGames.delete(chatId)
                let info = `💀 *خسرت!* المحاولات انتهت.\n🏁 الإجابة كانت: *${correctCountry}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // 2. معالجة الانسحاب
    if (text === 'انسحاب') {
        let game = flagGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة جارية.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        flagGames.delete(chatId)
        let info = `🚪 انسحبت! الدولة كانت: *${game.flag.country}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (flagGames.has(chatId)) {
        let info = '⚠️ توجد لعبة جارية بالفعل!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    let level = text.trim()
    
    // 3. عرض قائمة المستويات
    if (!['سهل', 'متوسط', 'صعب'].includes(level)) {
        let media = await prepareWAMessageMedia({ image: { url: FLAG_IMAGE } }, { upload: conn.waUploadToServer })
        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🏳️ *لعبة خمن العلم*\nاختر مستوى الصعوبة لبدء اللعبة 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة الأعلام" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🟢 سهل", id: `${usedPrefix + command} سهل` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🟡 متوسط", id: `${usedPrefix + command} متوسط` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔴 صعب", id: `${usedPrefix + command} صعب` }) }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })
        return await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })
    }

    // 4. بدء جولة العلم
    try {
        const flagList = flags[level] || flags['سهل']
        const selectedFlag = flagList[Math.floor(Math.random() * flagList.length)]
        
        let allCountries = Object.values(flags).flat().map(f => f.country)
        let wrongOptions = [...new Set(allCountries.filter(c => c !== selectedFlag.country))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        let choices = [...wrongOptions, selectedFlag.country].sort(() => 0.5 - Math.random())

        flagGames.set(chatId, {
            level: level,
            flag: selectedFlag,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (flagGames.has(chatId)) {
                    flagGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\nالدولة كانت: *${selectedFlag.country}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, timeMap[level])
        })

        let flagMedia = await prepareWAMessageMedia({ image: { url: selectedFlag.url } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_flag|${choice}|${selectedFlag.country}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: flagMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🏳️ *ما اسم علم هذه الدولة ؟*\n⏳ الوقت: ${timeMap[level]/1000} ثانية\n🎯 المستوى: ${level}` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة الأعلام" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        flagGames.delete(chatId)
        let info = '❌ حدث خطأ أثناء تحميل العلم، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['علم']
handler.tags = ['الـالـعـاب']
handler.command = /^(علم|أعلام|flag)$/i

export default handler
