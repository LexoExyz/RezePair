// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import fs from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";

const handler = async (m, { conn, command }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        // التحقق هل المرفق فيديو
        if (!/video/.test(mime)) {
            let info = `🎥 يرجى الرد على *فيديو* بالأمر .${command} لتحويله إلى صوت.`;
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

        // تحميل الفيديو المقتبس
        const buffer = await q.download();
        
        // إعداد المسارات المؤقتة في مجلد tmp
        const tempDir = join(process.cwd(), "tmp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const inputFile = join(tempDir, `video_${Date.now()}.mp4`);
        const outputFile = join(tempDir, `audio_${Date.now()}.mp3`);
        
        fs.writeFileSync(inputFile, buffer);

        // عملية التحويل باستخدام FFmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .toFormat("mp3")
                .on("end", resolve)
                .on("error", reject)
                .save(outputFile);
        });

        // إرسال الملف الصوتي الناتج
        await conn.sendMessage(m.chat, {
            audio: { url: outputFile },
            mimetype: "audio/mpeg",
            ptt: false // اجعلها true إذا أردت إرسالها كريكورد (بصمة)
        }, { quoted: m });

        // مسح الملفات المؤقتة بعد الإرسال
        if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("⚠️ خطأ في أمر لصوت:", err);
        let info = `❌ حدث خطأ أثناء تحويل الفيديو لصوت:\n${err.message}`;
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['لصوت'];
handler.command = ['لصوت', 'tomp3', 'صوت'];
handler.tags = ['الـتـحـويـلات'];

export default handler;
