import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const SUGGEST_IMAGE = "https://files.catbox.moe/w8ycz1.jpg"

// بنك اقتراحات الأنمي الموسع (أكثر من 55 أنمي)
const animeSuggestions = [
    { name: "Attack on Titan", arabic: "هجوم العمالقة", genre: "شونين/أكشن/دراما", description: "بشر يحاربون عمالقة يأكلون البشر في عالم محاط بأسوار ضخمة", rating: "⭐ 9.1/10" },
    { name: "Death Note", arabic: "مذكرة الموت", genre: "نفسي/غموض/جريمة", description: "طالب عبقري يجد مذكرة سحرية تمكنه من قتل أي شخص يكتب اسمه فيها", rating: "⭐ 8.9/10" },
    { name: "Demon Slayer", arabic: "قاتل الشياطين", genre: "أكشن/فانتازيا/شونين", description: "فتى يصبح قاتل شياطين لينقذ أخته التي تحولت إلى شيطان", rating: "⭐ 8.7/10" },
    { name: "One Piece", arabic: "ون بيس", genre: "مغامرات/كوميديا/أكشن", description: "قراصنة يبحثون عن الكنز الأسطوري ليصبحوا ملوك القراصنة", rating: "⭐ 8.7/10" },
    { name: "Jujutsu Kaisen", arabic: "جوجوتسو كايسن", genre: "شياطين/أكشن/مدرسة", description: "طالب ثانوي يأكل إصبع شيطان ويصبح مضيفًا لأقوى شيطان", rating: "⭐ 8.6/10" },
    { name: "Hunter x Hunter", arabic: "هنتر x هنتر", genre: "مغامرة/أكشن/شونين", description: "فتى يصبح صيادًا للعثور على والده والاستكشاف في عالم مليء بالمخاطر", rating: "⭐ 9.0/10" },
    { name: "Your Name", arabic: "اسمك", genre: "رومانسي/دراما/فانتازيا", description: "فتى وفتاة يتبادلان الأجساد بشكل غامض ويحاولان العثور على بعضهما", rating: "⭐ 8.9/10" },
    { name: "Spy x Family", arabic: "سباي x فاميلي", genre: "كوميدي/تجسس/عائلي", description: "جاسوس يشكل عائلة مزيفة لإكمال مهمته، لكن العائلة لديها أسرارها", rating: "⭐ 8.7/10" },
    { name: "Frieren", arabic: "فرييرن: ما بعد الرحلة", genre: "فانتازيا/دراما/مغامرة", description: "ساحرة خالدة تعيد تقييم علاقاتها البشرية بعد انتهاء رحلة البطل", rating: "⭐ 9.2/10" },
    { name: "Naruto", arabic: "ناروتو", genre: "أكشن/نينجا/شونين", description: "نينجا يطمح لتحقيق حلمه بأن يصبح هوكاجي القرية ويكتسب احترام الجميع", rating: "⭐ 8.4/10" },
    { name: "Bleach", arabic: "بليتش", genre: "أكشن/خارق للطبيعة/شونين", description: "مراهق يكتسب قوى الشينيغامي ويحمي العالم من الهولو والشرور", rating: "⭐ 8.2/10" },
    { name: "Fullmetal Alchemist: Brotherhood", arabic: "الخيميائي الفولاذي", genre: "مغامرة/فانتازيا/دراما", description: "أخوان يبحثان عن حجر الفلاسفة لاستعادة أجسامهما بعد تجربة محرمة", rating: "⭐ 9.1/10" },
    { name: "Steins;Gate", arabic: "شتاينز غيت", genre: "خيال علمي/إثارة/نفسي", description: "مجموعة علماء يكتشفون طريقة لإرسال رسائل للماضي ويغيرون خط الزمن", rating: "⭐ 9.1/10" },
    { name: "Vinland Saga", arabic: "ملحمة فينلاند", genre: "تاريخي/أكشن/دراما", description: "شاب فايكنغ يسعى للانتقام لمقتل والده في عالم قاسي ودموي", rating: "⭐ 8.8/10" },
    { name: "Mob Psycho 100", arabic: "موب سايكو 100", genre: "أكشن/كوميديا/خارق للطبيعة", description: "فتى يمتلك قدرات نفسية هائلة يحاول العيش كشخص عادي", rating: "⭐ 8.6/10" },
    { name: "Chainsaw Man", arabic: "رجل المنشار", genre: "أكشن/دموي/شونين", description: "شاب يعيش حياة فقيرة يندمج مع شيطان منشار ليصبح صياد شياطين", rating: "⭐ 8.5/10" },
    { name: "Blue Lock", arabic: "بلو لوك", genre: "رياضي/كرة قدم/إثارة", description: "مشروع تدريبي مكثف لخلق أنانية مهاجمين يهدف لصنع أقوى مهاجم لليابان", rating: "⭐ 8.3/10" },
    { name: "Haikyuu!!", arabic: "هايكيو!!", genre: "رياضي/مدرسي/كوميديا", description: "فريق طائرة ثانوي يطمح للوصول إلى القمة والبطولات الوطنية", rating: "⭐ 8.7/10" },
    { name: "Tokyo Revengers", arabic: "طوكيو ريفينجرز", genre: "أكشن/دراما/سفر عبر الزمن", description: "شاب يعود بالزمن لإنقاذ صديقة طفولته من عصابة طوكيو مانجي", rating: "⭐ 8.0/10" },
    { name: "Dr. Stone", arabic: "دكتور ستون", genre: "خيال علمي/مغامرة/كوميديا", description: "عبقري يعيد بناء الحضارة البشرية بالعلم بعد تحجر البشرية لآلاف السنين", rating: "⭐ 8.2/10" },
    { name: "Solo Leveling", arabic: "سولو ليفلينج", genre: "أكشن/فانتازيا/مغامرة", description: "أضعف صياد يحصل على نظام فريد يتيح له التطور والارتقاء بلامحدودية", rating: "⭐ 8.5/10" },
    { name: "Classroom of the Elite", arabic: "نخبة القاعات الدراسية", genre: "نفسي/دراما/مدرسي", description: "مدرسة ثانوية فريدة تمنح حرية مطلقة للطلاب وتعتمد على التنافس والذكاء", rating: "⭐ 7.9/10" },
    { name: "The Eminence in Shadow", arabic: "بزوغ الظل", genre: "إيسيكاي/كوميديا/فانتازيا", description: "شاب مهووس بدور العقل المدبر في الظل يُعاد إحياءه في عالم سحري", rating: "⭐ 8.1/10" },
    { name: "Mushoku Tensei", arabic: "موشوكو تينسي", genre: "إيسيكاي/فانتازيا/مغامرة", description: "رجل عاطل يُولد من جديد في عالم سحري ليقرر عيش حياته بجدية تامة", rating: "⭐ 8.4/10" },
    { name: "Overlord", arabic: "أوفرلورد", genre: "إيسيكاي/فانتازيا/أكشن", description: "لاعب يبقى عالقًا داخل لعبته المفضلة بشخصية ملك الموت العظمى", rating: "⭐ 8.0/10" },
    { name: "Re:Zero", arabic: "ري:زيرو", genre: "إيسيكاي/نفسي/دراما", description: "شاب ينتقل لع عالم آخر ويكتسب قدرة العودة بالزمن عبر الموت", rating: "⭐ 8.3/10" },
    { name: "Kaguya-sama: Love is War", arabic: "كاغويا-ساما: الحب حرب", genre: "رومانسي/كوميديا/مدرسي", description: "طالبان عبقريان يحاولان جعل الآخر يعترف بحبه أولاً كحرب عقلية", rating: "⭐ 8.6/10" },
    { name: "Horimiya", arabic: "هوريميا", genre: "رومانسي/كوميديا/مدرسي", description: "طالبان يبدوان مختلفين تمامًا بالمدرسة لكنهما يكتشفان أسرار بعضهما بالواقع", rating: "⭐ 8.2/10" },
    { name: "My Dress-Up Darling", arabic: "محبوبتي المرتدية للأزياء", genre: "رومانسي/كوميديا/شريحة من الحياة", description: "فتى يصمم ملابس تنكرية لفتاة مشهورة لتتطور بينهما علاقة خاصة", rating: "⭐ 8.1/10" },
    { name: "Anohana", arabic: "أنوهانا: الزهرة التي رأيناها ذلك اليوم", genre: "دراما/خارق للطبيعة/حزين", description: "أصدقاء طفولة تفرقوا يجتمعون مجددًا بعد ظهور طيف صديقتهم الراحلة", rating: "⭐ 8.3/10" },
    { name: "Violet Evergarden", arabic: "فايليت إيفرغاردن", genre: "دراما/خيال علمي/شريحة من الحياة", description: "فتاة آلة حرب سابقة تبحث عن معنى كلمة أحبك من خلال كتابة الرسائل", rating: "⭐ 8.7/10" },
    { name: "A Silent Voice", arabic: "صوت صامت", genre: "دراما/مدرسي/رومانسي", description: "شاب يتنمر على فتاة صماء بالمدرسة يقرر البحث عنها لتكفير خطأه", rating: "⭐ 8.9/10" },
    { name: "Weathering with You", arabic: "الطقس معك", genre: "رومانسي/فانتازيا/دراما", description: "مراهق يهرب لطوكيو ويلتقي بفتاة تستطيع التحكم بالطقس بصلواتها", rating: "⭐ 7.6/10" },
    { name: "Suzume", arabic: "سوزومي", genre: "مغامرة/فانتازيا/دراما", description: "فتاة تساعد شابًا في إغلاق أبواب غامضة تسبب الكوارث عبر اليابان", rating: "⭐ 7.7/10" },
    { name: "Cyberpunk: Edgerunners", arabic: "سايبربانك: عابرو الحافة", genre: "خيال علمي/أكشن/دراما", description: "فتى شوارع يكافح للبقاء في مدينة مستقبلية تعتمد على التكنولوجيا الفائقة", rating: "⭐ 8.5/10" },
    { name: "Arcane", arabic: "أركاين", genre: "خيال علمي/أكشن/دراما", description: "صراع بين مدينتين شقيقتين وتقنيات سحرية تغير مصير الأبطال", rating: "⭐ 9.0/10" },
    { name: "Bungou Stray Dogs", arabic: "كلاب بونغو الضالة", genre: "أكشن/غموض/خارق للطبيعة", description: "وكالة تحקيق يمتلك أفرادها قدرات مستوحاة من أدباء عالميين", rating: "⭐ 8.1/10" },
    { name: "Blue Period", arabic: "الفترة الزرقاء", genre: "دراما/فني/مدرسي", description: "طالب متفوق يكتشف شغفه المفاجئ بالفن والرسم ويقرر احترافه", rating: "⭐ 8.0/10" },
    { name: "Parasyte", arabic: "الطفيليات", genre: "رعب/خيال علمي/أكشن", description: "مخلوقات فضائية تغزو الأرض وتستحوذ على أدمغة البشر إلا طالباً واحداً", rating: "⭐ 8.3/10" },
    { name: "Made in Abyss", arabic: "صنع في الهاوية", genre: "مغامرة/غموض/خيال مظلم", description: "فتتاة وروبوت يغوصان في حفرة عميقة وغامضة للبحث عن والدتها", rating: "⭐ 8.8/10" },
    { name: "The Promised Neverland", arabic: "المنفى الموعود", genre: "غموض/إثارة/خيال علمي", description: "أطفال أيتام يكتشفون الحقيقة المرعبة خلف ملجأهم ويخططون للهروب", rating: "⭐ 8.4/10" },
    { name: "Black Clover", arabic: "البرسيم الأسود", genre: "أكشن/فانتازيا/شونين", description: "فتى يولد بلا سحر في عالم سحري يطمح ليصبح إمبراطور السحر", rating: "⭐ 8.1/10" },
    { name: "Drifters", arabic: "دريفتيرز", genre: "أكشن/تاريخي/خيال", description: "محاربون تاريخيون يُنقلون لعالم آخر لخوض حروب طاحنة", rating: "⭐ 7.8/10" },
    { name: "Hell's Paradise", arabic: "جنة الجحيم", genre: "أكشن/تاريخي/فانتازيا مظلمة", description: "محكومون بالإعدام وسيافون يبحثون عن إكسسير الحياة بجزيرة غامضة", rating: "⭐ 8.0/10" },
    { name: "Mashle", arabic: "ماشل: السحر والعضلات", genre: "كوميدي/أكشن/فانتازيا", description: "شاب بلا قدرات سحرية يعتمد كلياً على عضلاته الجبارة في عالم سحري", rating: "⭐ 7.7/10" },
    { name: "Kaiju No. 8", arabic: "الوحش رقم 8", genre: "أكشن/خيال علمي/شونين", description: "رجل ثلاثيني يندمج مع وحش عملاق ليصبح جزءاً من قوة الدفاع", rating: "⭐ 7.9/10" },
    { name: "Fire Force", arabic: "فرقة الإطفاء النارية", genre: "أكشن/خارق للطبيعة/شونين", description: "فرقة إطفاء خاصة تحارب بشريين تحولوا إلى كائنات نارية ملتهبة", rating: "⭐ 7.6/10" },
    { name: "Soul Eater",arabic: "صائد الأرواح", genre: "أكشن/كوميديا/فانتازيا", description: "طلاب مدرسة لأسلحة وشياطين يجمعون أرواح الشر لترقية أسلحتهم", rating: "⭐ 7.8/10" },
    { name: "Assassination Classroom", arabic: "قسم الاغتيال", genre: "كوميدي/أكشن/مدرسي", description: "طلاب فاشلون يكلفون باغتيال معلم غريب على شكل كائن غريب يدمر الأرض", rating: "⭐ 8.0/10" },
    { name: "Noragami", arabic: "نوراغامي", genre: "أكشن/فانتازيا/كوميدي", description: "إله فقير مغمور يسعى لكسب شهرة واتباع ومساعدات البشر", rating: "⭐ 7.9/10" },
    { name: "The Rising of the Shield Hero", arabic: "صعود بطل الدرع", genre: "إيسيكاي/أكشن/فانتازيا", description: "بطل يُستدعى لعالم آخر مسلحاً بدرع فقط ويواجه المؤامرات والخيانة", rating: "⭐ 7.9/10" },
    { name: "Log Horizon", arabic: "لوغ هورايزون", genre: "إيسيكاي/خيال علمي/استراتيجي", description: "لاعبو لعبة إلكترونية يعلقون داخلها ويحاولون بناء مجتمع ونظام", rating: "⭐ 7.9/10" },
    { name: "No Game No Life", arabic: "لا لعبة لا حياة", genre: "إيسيكاي/ذكاء/استراتيجي", description: "أخوان عبقريان في الألعاب يُنقلان لعالم تُحسم فيه كل الأمور بالألعاب", rating: "⭐ 8.1/10" },
    { name: "Kuroko's Basketball", arabic: "سلة كوروكو", genre: "رياضي/مدرسي/أكشن", description: "لاعب خفي بمهارات مذهلة ينضم لفريق ثانوي لمواجهة معجزي كرة السلة", rating: "⭐ 8.2/10" },
    { name: "Slam Dunk", arabic: "سلام دانك", genre: "رياضي/كوميدي/دراما", description: "جانح يدخل عالم كرة السلة بالصدفة ليقع في حب الرياضة", rating: "⭐ 8.7/10" }
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender
    const tag = '@' + senderId.split('@')[0]

    // --- 1. معالجة رسالة الشكر ---
    if (text === 'شكرا') {
        const thanksMessages = [
            `✨ ${tag} شكراً لك! نتمنى لك مشاهدة ممتعة!`,
            `🎉 ${tag} نرجو أن يعجبك الاقتراح! استمتع!`,
            `🍿 ${tag} شكراً على التفاعل! استمتع بمشاهدتك!`
        ]
        let info = thanksMessages[Math.floor(Math.random() * thanksMessages.length)]
        return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] })
    }

    // --- 2. عرض الاقتراح العشوائي ---
    if (text === 'suggest_now') {
        const randomAnime = animeSuggestions[Math.floor(Math.random() * animeSuggestions.length)]
        let media = await prepareWAMessageMedia({ image: { url: SUGGEST_IMAGE } }, { upload: conn.waUploadToServer })

        const caption = `🎬 *${randomAnime.arabic}*\n*${randomAnime.name}*\n\n📝 *الوصف:*\n${randomAnime.description}\n\n🏷️️ *التصنيف:* ${randomAnime.genre}\n${randomAnime.rating}\n\n🙋‍♂️ المقترح لـ: ${tag}`

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "استمتع بالمشاهدة! 🍿" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔄 اقتراح آخر", id: `${usedPrefix + command} suggest_now` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "⭐ تقييم رائع", id: `${usedPrefix + command} شكرا` }) }
                            ]
                        })
                    })
                }
            }
        }, { quoted: fkontak })

        return await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })
    }

    // --- 3. عرض الواجهة الرئيسية ---
    let media = await prepareWAMessageMedia({ image: { url: SUGGEST_IMAGE } }, { upload: conn.waUploadToServer })

    const mainCaption = `🎬 *مقترحات الأنمي* اكتشف انميات رائعة و متنوعة! 🌟  

📚 *مجموعة واسعة من التصنيفات:*
🔹 أكشن ومغامرات | دراما | غموض
🔹 إيسيكاي | رياضي | رومانسي | كوميديا

🎯 *اضغط الزر أدناه لتحصل على اقتراح عشوائي* 👇`

    const mainMsg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                    body: proto.Message.InteractiveMessage.Body.create({ text: mainCaption }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "اكتشف عالم الأنمي" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 احصل على أنمي", id: `${usedPrefix + command} suggest_now` }) }
                        ]
                    })
                })
            }
        }
    }, { quoted: fkontak })

    await conn.relayMessage(chatId, mainMsg.message, { messageId: mainMsg.key.id })
}

handler.help = ['اقترح']
handler.tags = ['الـأعـضـاء']
handler.command = /^(اقترح|انمي|anime|suggest)$/i

export default handler
