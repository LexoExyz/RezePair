import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    // التحقق من وجود رسالة مردود عليها
    if (!m.quoted) {
        let info = '*⚠️ الـرجاء الـرد عـلـى صـورة أو فـيـديـو (لـمـرة واحدة) بـكـتـابـة (ع)*'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // تحديد نوع الوسائط المردود عليها (حتى لو كانت ViewOnce)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // التحقق إذا كانت الوسائط مدعومة
    if (!/image|video|audio/.test(mime)) {
        let info = '*❌ هـذه الـرسـالـة لـيـسـت صـورة أو فـيـديـو أو صـوت*'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    await m.react('🔓')

    try {
        // تحميل الميديا (البفر)
        let buffer = await m.quoted.download()
        let caption = q.text || ''

        // إرسال الميديا بناءً على نوعها
        if (/image/.test(mime)) {
            return conn.sendMessage(m.chat, { image: buffer, caption: caption }, { quoted: m })
        } else if (/video/.test(mime)) {
            return conn.sendMessage(m.chat, { video: buffer, caption: caption }, { quoted: m })
        } else if (/audio/.test(mime)) {
            return conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        let info = '*❌ عـذراً، فـشلـت في تـحـميـل الـوسائـط، قـد تـكون تـالـفـة*'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['عرض']
handler.tags = ['الـأعـضـاء']
handler.command = ['ع', 'عرض', 'vv', 'readviewonce']

export default handler
