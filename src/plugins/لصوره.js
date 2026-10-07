// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
    // التحقق من وجود ملصق أو رد على ملصق
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!/webp/.test(mime)) {
        let info = `❌ يرجى الرد على ملصق بـ *${usedPrefix + command}* ليتـم تحويله لصورة.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    await m.react('🖼️')

    try {
        // تحميل الملصق (البفر)
        let media = await q.download()
        
        // إرسال الصورة الناتجة
        await conn.sendMessage(m.chat, { 
            image: media, 
            caption: "🖼️ تـم تحويـل الملصـق إلى صـورة بنجـاح." 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        let info = `❌ عذراً، حدث خطأ أثناء التحويل. تأكد أن الملصق ليس متحركاً (GIF).`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['لصوره']
handler.tags = ['الـتـحـويـلات']
handler.command = ['لصوره', 'لصورة', 'toimg']

export default handler
