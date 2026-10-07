import fs from "fs";
import { join } from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const handler = async (m, { conn, text }) => {
  const videoPath = join(process.cwd(), "src/تست.mp4");

  try {
    // 1. حالة التحديث: لو رديت على فيديو
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (m.quoted && /video/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      
      const msgToDownload = m.quoted.msg || m.quoted;
      const stream = await downloadContentFromMessage(msgToDownload, "video");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      if (!fs.existsSync(join(process.cwd(), "src"))) fs.mkdirSync(join(process.cwd(), "src"), { recursive: true });
      fs.writeFileSync(videoPath, buffer);
      
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      let info = "✅ تم حفظ الفيديو بنجاح كرسالة تست!";
      return conn.reply(m.chat, info, fkontak, rcanal);
    }

    // 2. حالة الإرسال: لما تكتب .تست بس
    let videoSource;
    if (fs.existsSync(videoPath)) {
      videoSource = fs.readFileSync(videoPath);
    } else {
      videoSource = { url: "https://files.catbox.moe/8gaelw.mp4" };
    }

    // إرسال النص بنظام الرد الموثق أولاً
    let info = "*شـــغـال يا بطل*";
    await conn.reply(m.chat, info, fkontak, rcanal);

    // إرسال الفيديو الدائري بشكل منفصل
    await conn.sendMessage(m.chat, { 
      video: videoSource,
      mimetype: "video/mp4",
      ptt: true,
      ptv: true // خاصية الفيديو الدائري
    });

  } catch (error) {
    console.error("Error in Test Command:", error);
    let info = "❌ حدث خطأ أثناء تشغيل التست، تأكد من وجود الفيديو في src/تست.mp4";
    return conn.reply(m.chat, info, fkontak, rcanal);
  }
};

handler.help = ['تست'];
handler.command = ['تست', 'test', 'تيت'];
handler.tags = ['الـأعـضـاء'];

export default handler;
