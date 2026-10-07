// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/video/.test(mime)) {
        let info = `*⚠️ من فضلك قم بالرد على الفيديو الذي تريد تحويله باستخدام ${usedPrefix + command}*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let infoWait = '*⏳ جاري المعالجة...*'
    conn.reply(m.chat, infoWait, fkontak, rcanal)

    try {
        let media = await q.download()
        
        // استخدام مجلد src وحفظ الملف
        let srcDir = path.join('./src')
        if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true }) 

        let videoPath = path.join(srcDir, `vnote_${Date.now()}.mp4`)
        fs.writeFileSync(videoPath, media)

        // إعداد المنشن الوهمي (Fake Quoted)
        let fakeQuoted = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: m.chat,
                id: "FAKEGIF_" + Date.now()
            },
            message: {
                videoMessage: {
                    mimetype: "video/mp4",
                    caption: "⊹ 𝑹𝒆𝒛𝒆 ⊹",
                    gifPlayback: true
                }
            }
        }

        // إرسال الفيديو كرسالة مرئية دائرية (PTT/PTV)
        const videoBuffer = fs.readFileSync(videoPath)
        await conn.sendMessage(
            m.chat,
            {
                video: videoBuffer,
                mimetype: "video/mp4",
                fileName: "videonote.mp4",
                ptt: true, // لإرساله كرسالة صوتية/مرئية
                ptv: true  // خاصية Video Note الدائرية
            },
            { quoted: fakeQuoted }
        )

        // حذف الملف فوراً من مجلد src للحفاظ على نظافة البوت
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath)
        }

    } catch (error) {
        console.error(error)
        let infoError = `*❌ حدث خطأ:*\n*تأكد من أنك ترد على "فيديو" وليس "رسالة فيديو" سابقة، أو حاول مجدداً.*`
        conn.reply(m.chat, infoError, fkontak, rcanal)
        
        // محاولة مسح الملف في حالة وقوع خطأ
        const files = fs.readdirSync('./src')
        for (const file of files) {
            if (file.startsWith('vnote_')) fs.unlinkSync(path.join('./src', file))
        }
    }
}

handler.help = ['لنوت']
handler.tags = ['الـتـحـويـلات']
handler.command = ['لنوت', 'vnote']

export default handler
