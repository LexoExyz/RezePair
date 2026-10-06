const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command }) => {
  // الرسالة الملحقة بالتاغ إن وجدت
  const pesan = args.join(' ') || 'لا توجد رسالة';
  const oi = `*» الـرسـالـة : البوت يسلم عليكم وآسف على الازعاج*`;
  
  let teks = `*📢 مـنـشـن عـام لـلـجـمـيـع !*\n`;
  teks += `*👥 عـدد الأعـضـاء:* ${participants.length}\n\n`;
  teks += ` ${oi}\n\n`;
  teks += `╭  ┄ 𝅄 ۪꒰ \`تنبيه عام\` ꒱ ۟ 𝅄 ┄\n`;

  // حلقة تكرار لعمل منشن لكل عضو
  for (const mem of participants) {
    teks += `┊ꕥ @${mem.id.split('@')[0]}\n`;
  }

  teks += `╰⸼ ┄ ┄ ┄ ─  ꒰  ׅ୭ *SYSTEM* ୧ ׅ ꒱  ┄  ─ ┄⸼`;

  // إرسال الرسالة مع تفعيل المنشنات
  conn.sendMessage(m.chat, { 
    text: teks, 
    mentions: participants.map((a) => a.id) 
  }, { quoted: m });
};

handler.help = ['تاغ'];
handler.tags = ['الـمـشـرفـيـن'];
handler.command = ['تاغ', 'الجميع', 'tagall', 'todos'];
handler.admin = true; // متاح للمشرفين فقط
handler.group = true; // يعمل في المجموعات فقط

export default handler;
