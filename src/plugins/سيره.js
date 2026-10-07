import baileys from '@whiskeysockets/baileys'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const storiesData = require('../src/data/seerahStories.js')

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const STORY_IMAGE = "https://files.catbox.moe/w8ycz1.jpg" // صورة تعبيرية للقصص (يمكنك تغييرها)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat

    try {
        if (!storiesData || storiesData.length === 0) {
            let info = '❌ ملف القصص غير متوفر أو فارغ.'
            return conn.reply(chatId, info, fkontak, rcanal)
        }

        // اختيار قصة عشوائية من القائمة
        const selectedStory = storiesData[Math.floor(Math.random() * storiesData.length)]

        let storyMedia = await prepareWAMessageMedia({ image: { url: STORY_IMAGE } }, { upload: conn.waUploadToServer })

        // تجهيز زر "قصة أخرى" التفاعلي
        const buttons = [{
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "📖 قصة أخرى",
                id: `${usedPrefix + command}`
            })
        }]

        const storyMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: storyMedia.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: `✨ *${selectedStory.title || 'من قصص السيرة والأنبياء'}* ✨\n\n${selectedStory.story || selectedStory}\n\n👇 اضغط على الزر أدناه لقراءة قصة أخرى:` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Seerah & Prophets Stories" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(chatId, storyMsg.message, { messageId: storyMsg.key.id })

    } catch (err) {
        console.error(err)
        let info = '❌ حدث خطأ أثناء إرسال القصة، حاول مرة أخرى.'
        return conn.reply(chatId, info, fkontak, rcanal)
    }
}

handler.help = ['سيره']
handler.tags = ['الـديــن']
handler.command = /^(سيره)$/i

export default handler
