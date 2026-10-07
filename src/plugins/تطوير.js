// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
import fs from 'fs'
import path from 'path'

const devPath = path.resolve('./data/devmode.txt')

let handler = async (m, { conn, isOwner, text, usedPrefix, command }) => {
    // 1. التحقق من المطور فقط (شيلنا النخبة)
    if (!isOwner) return conn.reply(m.chat, '> هــذا الامـــر مخــصص للمـــطور.... 💤', fkontak, rcanal)

    // التأكد من وجود مجلد data
    if (!fs.existsSync(path.dirname(devPath))) fs.mkdirSync(path.dirname(devPath), { recursive: true })

    // إذا لم يرسل on أو off أرسل الأزرار الأصلية
    if (!text) {
        const buttons = [
            { buttonId: `${usedPrefix + command} on`, buttonText: { displayText: 'تشغيل 🔧' }, type: 1 },
            { buttonId: `${usedPrefix + command} off`, buttonText: { displayText: 'إيقاف ✨' }, type: 1 }
        ]

        const buttonMessage = {
            text: `*🔧 إعدادات وضع التطوير*\n*يرجى اختيار الحالة المطلوبة للبوت:*`,
            footer: `𝒚𝒖𝒕𝒂 𝒃𝒐𝒕`,
            buttons: buttons,
            headerType: 1
        }

        return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let botProfilePic
    try {
        botProfilePic = await conn.profilePictureUrl(conn.user.jid, 'image')
    } catch {
        botProfilePic = 'https://files.catbox.moe/w8ycz1.jpg'
    }

    if (text === 'on') {
        fs.writeFileSync(devPath, '[on]', 'utf8')
        await m.react('🔧')
        
        return conn.sendMessage(m.chat, {
            text: "🔧 البوت دخل وضع التطوير 💻\n\n🚫 الأوامر الآن متاحة للمطورين فقط.",
            contextInfo: {
                externalAdReply: {
                    title: "Yuta Bot 🔧",
                    body: "Dev Mode Activated 🚀",
                    thumbnailUrl: botProfilePic,
                    sourceUrl: `https://wa.me/${conn.user.jid.split('@')[0]}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
    }

    if (text === 'off') {
        fs.writeFileSync(devPath, '[off]', 'utf8')
        await m.react('✅')
        
        return conn.sendMessage(m.chat, {
            text: "✅ البوت خرج من وضع التطوير ✨\n\n💡 الأوامر رجعت شغالة مع الجميع.",
            contextInfo: {
                externalAdReply: {
                    title: "Yuta Bot ✨",
                    body: "Dev Mode Disabled 🌙",
                    thumbnailUrl: botProfilePic,
                    sourceUrl: `https://wa.me/${conn.user.jid.split('@')[0]}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
    }
}

handler.help = ['تطوير']
handler.tags = ['الـمـطـور']
handler.command = ['تطوير', 'devmode']
handler.rowner = true // حصري للمطور الأساسي

export default handler
