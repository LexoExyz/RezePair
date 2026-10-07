// تعريب وتعديل: RezeBOT 
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';

const handler = async (m, { conn }) => {
  const name = '𝙇𝙀𝙓𝙊𝙀𝙔𝙕';
  const numCreador = '212701927990'; 
  const empresa = 'RezeBOT INC.';
  const about = '💫 المطور الرسمي لـ 𝒓𝒆𝒛𝒆 𝒃𝒐𝒕';
  const correo = 'publexo@gmail.com';
  const web = 'https://github.com/LexoExyz';
  const direccion = 'Tanger, Morocco 🇲🇦';
  const fotoPerfil = 'https://files.catbox.moe/c31zem.jpg';

  // 1. إرسال الأغنية القصيرة أولاً من مجلد src
  // ملاحظة: تأكد من وجود الملف بالمسار الصحيح
  const audioPath = './src/audio.mp3'; 
  if (fs.existsSync(audioPath)) {
    await conn.sendMessage(m.chat, { 
      audio: { url: audioPath }, 
      mimetype: 'audio/mpeg', 
      ptt: true // لإرسالها كمقطع صوتي (Voice Note)
    }, { quoted: m });
  }

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:المطور الأساسي
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:MA
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim();

  const contactMessage = {
    displayName: name,
    vcard
  };

  m.react('👑');

  // 2. إرسال بطاقة المطور مع الرسالة الوهمية
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [contactMessage]
    },
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '𝒓𝒆𝒛𝒆 𝒃𝒐𝒕 - 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍',
        body: '📌 مـعـلـومـات الـمـطـور •💫',
        mediaType: 1,
        thumbnailUrl: fotoPerfil,
        renderLargerThumbnail: true,
        sourceUrl: web,
        showAdAttribution: true
      }
    }
  }, { quoted: m });
};

handler.help = ['المطور'];
handler.tags = ['الـدعـم'];
handler.command = ['المطور', 'المالك', 'owner', 'creator'];

export default handler;
