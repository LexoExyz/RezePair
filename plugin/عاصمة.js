import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let capitalGames = new Map()

const GAME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

// بنك العواصم المحدث (إضافة عواصم أخرى)
const CAPITALS = {
  "مصر":"القاهرة","السعودية":"الرياض","الإمارات":"أبوظبي","المغرب":"الرباط","الجزائر":"الجزائر","تونس":"تونس",
  "العراق":"بغداد","سوريا":"دمشق","فلسطين":"القدس","لبنان":"بيروت","الأردن":"عمان","الكويت":"الكويت",
  "فرنسا":"باريس","ألمانيا":"برلين","إيطاليا":"روما","إسبانيا":"مدريد","اليابان":"طوكيو","الصين":"بكين",
  "البرازيل":"برازيليا","الأرجنتين":"بوينس آيرس","روسيا":"موسكو","بريطانيا":"لندن","تركيا":"أنقرة",
  "قطر":"الدوحة","البحرين":"المنامة","سلطنة عمان":"مسقط","اليمن":"صنعاء","ليبيا":"طرابلس","السودان":"الخرطوم",
  "موريتانيا":"نواكشوط","الصومال":"مقديشو","جيبوتي":"جيبوتي","جزر القمر":"موروني","الولايات المتحدة":"واشنطن",
  "كندا":"أوتاوا","المكسيك":"مكسيكو سيتي","البرتغال":"لشبونة","هولندا":"أمستردام","بلجيكا":"بروكسل",
  "سويسرا":"برن","أستراليا":"كانبرا","كوريا الجنوبية":"سيول","الهند":"نيودلهي","باكستان":"إسلام آباد"
};

const rewardMap = { سهل: 10, متوسط: 20, صعب: 30 }
const timeMap = { سهل: 45000, متوسط: 30000, صعب: 15000 }

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // --- 1. معالجة التحقق من الإجابة عبر الأزرار ---
    if (text.includes('check_cap|')) {
        let game = capitalGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctCapital] = text.split('|')

        if (userChoice === correctCapital) {
            clearTimeout(game.timeoutId)
            capitalGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n🏛️ العاصمة: *${correctCapital}*\n🌍 الدولة: *${game.country}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 النقاط: +${rewardMap[game.level]}`
            return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *جواب غلط!* لسا فاضل معك محاولة وحدة ⏳\nركز يا بطل!`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                capitalGames.delete(chatId)
                let info = `💀 *خسرت!* المحاولات انتهت.\n🏛️ العاصمة الصحيحة كانت: *${correctCapital}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // --- 2. معالجة الانسحاب ---
    if (text === 'انسحاب') {
        let game = capitalGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة جارية.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        capitalGames.delete(chatId)
        let info = `🚪 انسحبت! عاصمة *${game.country}* هي: *${game.capital}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (capitalGames.has(chatId)) {
        let info = '⚠️ توجد لعبة جارية بالفعل في هذا الجروب!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    let level = text.trim()
    
    // --- 3. عرض قائمة المستويات ---
    if (!['سهل', 'متوسط', 'صعب'].includes(level)) {
        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })
        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🌍 *لعبة الدول والعواصم*\nاختر مستوى الصعوبة لبدء التحدي 👇` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة العواصم" }),
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

    // --- 4. بدء جولة العاصمة ---
    try {
        const countries = Object.keys(CAPITALS)
        const selectedCountry = countries[Math.floor(Math.random() * countries.length)]
        const correctCapital = CAPITALS[selectedCountry]
        
        let allCapitals = Object.values(CAPITALS)
        let wrongOptions = [...new Set(allCapitals.filter(c => c !== correctCapital))]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        let choices = [...wrongOptions, correctCapital].sort(() => 0.5 - Math.random())

        capitalGames.set(chatId, {
            level: level,
            country: selectedCountry,
            capital: correctCapital,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (capitalGames.has(chatId)) {
                    capitalGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* ⏰\n🌍 عاصمة *${selectedCountry}* هي: *${correctCapital}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, timeMap[level])
        })

        let media = await prepareWAMessageMedia({ image: { url: GAME_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_cap|${choice}|${correctCapital}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🌍 *ما هي عاصمة الدولة التالية؟*\n\n🏴 *الدولة:* ${selectedCountry}\n⏳ الوقت: ${timeMap[level]/1000} ثانية\n❤️ المحاولات: 2` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "لعبة العواصم" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        capitalGames.delete(chatId)
        let info = '❌ حدث خطأ، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['عاصمة']
handler.tags = ['الـالـعـاب']
handler.command = /^(عاصمة|عواصم|capital)$/i

export default handler
