import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let animeGames = new Map()
const ANIME_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" 

// بنك الأسئلة الموسع (50 سؤالاً)
const animeQuestions = [
  { q: "من هو كابتن طاقم قبعة القش في ون بيس؟", options: ["زورو", "لوفي", "سانجي"], answer: "لوفي" },
  { q: "من هو قاتل عائلة تانجيرو في قاتل الشياطين؟", options: ["موزان", "رينغوكو", "زينتسو"], answer: "موزان" },
  { q: "من هو بطل أنمي ناروتو؟", options: ["ساسكي", "كاكاشي", "ناروتو"], answer: "ناروتو" },
  { q: "ما هي قدرة لوفي الأساسية؟", options: ["النار", "المطاط", "البرق"], answer: "المطاط" },
  { q: "من هو بطل أنمي ديث نوت؟", options: ["إل", "لايت", "ريوك"], answer: "لايت" },
  { q: "ما اسم قرية ناروتو؟", options: ["كونوها", "ساند", "ميست"], answer: "كونوها" },
  { q: "من هو صديق غوكو الأقرب؟", options: ["فيجيتا", "كريلين", "بيكولو"], answer: "كريلين" },
  { q: "في ون بيس، من أكل فاكهة النار؟", options: ["إيس", "سابو", "لوفي"], answer: "إيس" },
  { q: "من هو والد إرين في هجوم العمالقة؟", options: ["زيك", "غريشا", "ليفاي"], answer: "غريشا" },
  { q: "من هو الشينيغامي الذي أعطى مذكرة الموت؟", options: ["ريوك", "ريم", "شين"], answer: "ريوك" },
  { q: "ما اسم سيف زورو الأول في ون بيس؟", options: ["وادو إيتشيمونجي", "شوسوي", "سانداي كيتيتسو"], answer: "وادو إيتشيمونجي" },
  { q: "من هو مدرب ناروتو الأول في الأكاديمية؟", options: ["إيروكا", "كاكاشي", "جيرايا"], answer: "إيروكا" },
  { q: "ما هو اسم الفيلق الذي ينتمي إليه إرين ييغر؟", options: ["فيلق الاستطلاع", "فيلق الشرطة العسكرية", "الحامية"], answer: "فيلق الاستطلاع" },
  { q: "من هو مبتكر أنمي دراغون بول؟", options: ["أكيرا تورياما", "إييتشيرو أودا", "ماساشي كيشيموتو"], answer: "أكيرا تورياما" },
  { q: "ما اسم القط الأثري في أنمي سيلور مون؟", options: ["لونا", "توتو", "ماكو"], answer: "لونا" },
  { q: "من هو قائد فرقة الفرسان السوداء في بلاك كلوفر؟", options: ["يامي سكوكي", "ناشت", "وليام"], answer: "يامي سكوكي" },
  { q: "ما اسم الكرات التي يبحث عنها غوكو وأصدقاؤه؟", options: ["كرات التنين", "الكرات السحرية", "كرات الطاقة"], answer: "كرات التنين" },
  { q: "من هو البطل الرئيسي في أنمي ون كيتش (القناص / هنتر × هنتر)؟", options: ["كيلوا", "غون", "كورابيكا"], answer: "غون" },
  { q: "ما اسم المدينة التي يعيش فيها كونان إيدوغاوا؟", options: ["طوكيو", "أوساكا", "كيوتو"], answer: "طوكيو" },
  { q: "من هو رفيق لوفي الذي يستخدم ثلاثة سيوف؟", options: ["زورو", "سانجي", "أوسوب"], answer: "زورو" },
  { q: "ما اسم الأنمي الذي يتحدث عن عمالقة يأكلون البشر؟", options: ["هجوم العمالقة", "قاتل الشياطين", "طوكيو غول"], answer: "هجوم العمالقة" },
  { q: "من هو الابتكار الأروع في نظر سايكي كوسو؟", options: ["القهوة بالمشروبات", "القوى الخارقة", "النظارات المانعة"], answer: "النظارات المانعة" },
  { q: "ما هو اسم الشخصية الرئيسية في أنمي بلاك كلوفر؟", options: ["أستا", "يونو", "نويل"], answer: "أستا" },
  { q: "من هو الشخص الذي قتل ليتل نايت في بليتش؟", options: ["إيتشيغو", "آيزن", "باكويا"], answer: "إيتشيغو" },
  { q: "ما هو اسم مدرسة الأبطال في أنمي بورد هيرو أكاديميا؟", options: ["يوي", "شيكيتسو", "كاتسورا"], answer: "يوي" },
  { q: "من هو أقوى ساحر في أنمي ججوتسو كايسن؟", options: ["غوجو ساتورو", "سوكونا", "يوجي"], answer: "غوجو ساتورو" },
  { q: "ما اسم سيف إيتشيغو كوروساکی الرئيسي؟", options: ["زانباكتو", "كاتانا", "فوجين"], answer: "زانباكتو" },
  { q: "من هو بطل أنمي طوكيو غول؟", options: ["كانيكي كين", "توكا", "أتاكا"], answer: "كانيكي كين" },
  { q: "ما اسم الفتاة التي تحب نبيذ الفراولة في دراغون بول؟",options: ["بولما", "تشي تشي", "فيديل"], answer: "بولما" },
  { q: "من هو الملك الحاكم للشياطين في السبع الخطايا المميتة؟", options: ["ميليوداس", "بان", "الملك الشيطاني"], answer: "الملك الشيطاني" },
  { q: "ما هو الاسم الحقيقي لـ إل في ديث نوت؟", options: ["لاب", "لاوليت", "ريو"], answer: "لاوليت" },
  { q: "من هو معلّم غون وكيلوا في نين؟", options: ["ويسك", "بسكويت", "وينغ"], answer: "وينغ" },
  { q: "ما اسم طائرة ناروتو المفضلة في النينجتسو؟", options: ["راسينغان", "تشيدوري", "كاتون"], answer: "راسينغان" },
  { q: "من هو خصم لوفي الرئيسي في قوس إنيس لوبي؟", options: ["لوتشي", "كروكوديل", "دوفلامينغو"], answer: "لوتشي" },
  { q: "ما هي الفاكهة التي أكلها تساكاي في دراغون بول؟", options: ["لا توجد فواكه", "فاكهة الموز", "فاكهة النار"], answer: "لا توجد فواكه" },
  { q: "من هو أول هوكاغي في قرية كونوها؟", options: ["هاشيراما سينجو", "توبيراما", "هيروزين"], answer: "هاشيراما سينجو" },
  { q: "ما هو اسم فاكهة الشيطان الخاصة بـ إيس؟", options: ["ميلا ميلا نو مي", "غومو غومو نو مي", "هيا هيا نو مي"], answer: "ميلا ميلا نو مي" },
  { q: "من هو مبتكر مذكرة الموت في ديث نوت؟", options: ["ريوك", "لايت", "أوباتا"], answer: "ريوك" },
  { q: "ما اسم الكوكب الذي دمر سيد غوكو؟", options: ["فيجيتا", "ناميك", "إيرث"], answer: "فيجيتا" },
  { q: "من هو مساعد كاكاشي الدائم في إنجاز المهام؟", options: ["ناروتو", "ساكورا", "ساسكي"], answer: "ناروتو" },
  { q: "ما اسم العشيرة التي ينتمي إليها ساسكي؟", options: ["أوتشيها", "هيوغا", "سنجو"], answer: "أوتشيها" },
  { q: "من هو الشخص الذي درّب لوفي على استخدام الهاكي؟", options: ["ريلي", "شانكس", "غارب"], answer: "ريلي" },
  { q: "ما اسم سلاح تانجيرو الأساسي؟", options: ["سيف النيشيرين", "السلاح المسحور", "الخنجر الأسود"], answer: "سيف النيشيرين" },
  { q: "من هو قائد الفرسان السبعة المميتة؟", options: ["ميليوداس", "إيسكانور", "بان"], answer: "ميليوداس" },
  { q: "ما هو اسم قطة إيتشيغو المرشدة في العالم الآخر؟", options: ["كون", "روكيا", "توشيرو"], answer: "كون" },
  { q: "من هو الصديق الأفضل لـ يوجي إيتادوري؟", options: ["ميغومي", "نوبارا", "غوجو"], answer: "ميغومي" },
  { q: "ما هو اسم مدرسة الأبطال في دراغون بول؟", options: ["مدرسة الرهبان", "مدرسة جزيرة السلاحف", "لا توجد مدرسة محددة"], answer: "مدرسة جزيرة السلاحف" },
  { q: "من هو الإمبراطور الذي يحكم وانو في ون بيس؟", options: ["كايدو", "بيغ مام", "شانكس"], answer: "كايدو" },
  { q: "ما هو الاسم المستعار لـ لايت ياغامي كمجرم؟", options: ["كيرا", "شين", "إل"], answer: "كيرا" },
  { q: "من هو الشخص الذي ضحى بروحه لإنقاذ غارا في ناروتو؟", options: ["تشيو", "ساسوري", "تيماري"], answer: "تشيو" }
]

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender

    // --- 1. معالجة التحقق من الإجابة عبر الأزرار ---
    if (text.includes('check_anime|')) {
        let game = animeGames.get(chatId)
        if (!game) return 
        
        let [_, userChoice, correctAnswer] = text.split('|')

        if (userChoice === correctAnswer) {
            clearTimeout(game.timeoutId)
            animeGames.delete(chatId)
            let info = `✅ *إجابة صحيحة!* 🎉\n🎌 الجواب: *${correctAnswer}*\n🏆 الفائز: @${senderId.split('@')[0]}\n📊 الجائزة: +10 نقاط`
            return conn.reply(chatId, info, fkontak, rcanal)
        } else {
            game.attempts -= 1
            if (game.attempts > 0) {
                let info = `❌ *إجابة خاطئة!* لسا فاضل معك محاولة وحدة ⏳\nركز يا أوتاكو!`
                return conn.reply(chatId, info, fkontak, rcanal)
            } else {
                clearTimeout(game.timeoutId)
                animeGames.delete(chatId)
                let info = `💀 *خسرت!* محاولاتك انتهت.\n🏁 الإجابة الصحيحة كانت: *${correctAnswer}*`
                return conn.reply(chatId, info, fkontak, rcanal)
            }
        }
    }

    // --- 2. معالجة الانسحاب ---
    if (text === 'انسحاب') {
        let game = animeGames.get(chatId)
        if (!game) {
            let info = '❌ لا توجد لعبة جارية.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }
        clearTimeout(game.timeoutId)
        let ans = game.correctAnswer
        animeGames.delete(chatId)
        let info = `🚪 انسحبت! الإجابة كانت: *${ans}*`
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    if (animeGames.has(chatId)) {
        let info = '⚠️ توجد لعبة أسئلة جارية بالفعل!'
        return conn.reply(chatId, info, fkontak, rcanal)
    }

    // --- 3. بدء جولة جديدة ---
    try {
        const random = animeQuestions[Math.floor(Math.random() * animeQuestions.length)]
        const choices = random.options.sort(() => 0.5 - Math.random())

        animeGames.set(chatId, {
            correctAnswer: random.answer,
            attempts: 2,
            timeoutId: setTimeout(() => {
                if (animeGames.has(chatId)) {
                    animeGames.delete(chatId)
                    let info = `❌ *انتهى الوقت!* محدش عرف الجواب.\n🏁 الإجابة كانت: *${random.answer}*`
                    conn.reply(chatId, info, fkontak, rcanal)
                }
            }, 30000)
        })

        let media = await prepareWAMessageMedia({ image: { url: ANIME_IMAGE } }, { upload: conn.waUploadToServer })

        const buttons = choices.map(choice => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: choice,
                id: `${usedPrefix + command} check_anime|${choice}|${random.answer}`
            })
        }))
        buttons.push({ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب` }) })

        const gameMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `🎌 *تحدي الأوتاكو الذكي*\n\n❓ ${random.q}\n\n⏳ الوقت: 30 ثانية\n❤️ المحاولات: 2` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "تحديات الأنمي" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, gameMsg.message, { messageId: gameMsg.key.id })

    } catch (err) {
        console.error(err)
        animeGames.delete(chatId)
        let info = '❌ حدث خطأ، حاول مرة أخرى.'
        conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['أسئلة']
handler.tags = ['الـالـعـاب']
handler.command = /^(أسئلة|anime|أسئله)$/i

export default handler
