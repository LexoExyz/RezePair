import fs from "fs";
import { join } from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

function fakeQuoted(chatId) {
  return {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: chatId,
      id: "FAKEGIF_" + Date.now()
    },
    message: {
      videoMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/12345678_gif.mp4",
        mimetype: "video/mp4",
        caption: "⊹ 𝑹𝒆𝒛𝒆 ⊹",
        gifPlayback: true
      }
    }
  };
}

const handler = async (m, { conn }) => {
  try {
    const videoPath = join(process.cwd(), "src/videonote.mp4");

    // التحقق من الرد على فيديو
    if (m.quoted && /video/.test(m.quoted.mimetype || m.quoted.msg?.mimetype)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      // تصحيح استخراج الرسالة: نأخذ الرسالة من داخل الـ quoted مباشرة
      const messageToDownload = m.quoted.msg || m.quoted;
      
      const stream = await downloadContentFromMessage(messageToDownload, "video");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!fs.existsSync(join(process.cwd(), "src"))) {
        fs.mkdirSync(join(process.cwd(), "src"), { recursive: true });
      }
      
      fs.writeFileSync(videoPath, buffer);
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      return m.reply("✅ تم تحديث ملاحظة الفيديو في مجلد src!");
    }

    // إرسال الفيديو المحفوظ
    if (!fs.existsSync(videoPath)) {
      return m.reply("❌ لا يوجد فيديو محفوظ. رد على فيديو واكتب *.نوت*");
    }

    const videoBuffer = fs.readFileSync(videoPath);
    await conn.sendMessage(
      m.chat,
      {
        video: videoBuffer,
        mimetype: "video/mp4",
        fileName: "videonote.mp4",
        ptt: true,
        ptv: true
      },
      { quoted: fakeQuoted(m.chat) }
    );

  } catch (error) {
    console.error(error);
    m.reply(`❌ حدث خطأ:\nتأكد من أنك ترد على "فيديو" وليس "رسالة فيديو" سابقة، أو حاول مجدداً.`);
  }
};

handler.help = ['نوت'];
handler.command = ['نوت', 'videonote'];
handler.tags = ['الـأعـضـاء'];

export default handler;
