import fs from 'fs'
import path from 'path'

// دالة حساب المسافة بين الكلمات (للبحث الذكي)
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findClosestMatch(input, options, maxDistance = 3) {
  let closest = null;
  let minDistance = Infinity;
  for (const option of options) {
    const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase());
    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      closest = option;
    }
  }
  return closest;
}

let handler = async (m, { conn, text, isOwner }) => {
    // مخصص للمطور فقط
    if (!isOwner) {
        let info = '⚠️ هذا الأمر مخصص للمطور فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const trashDir = path.resolve('./trash');
    if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir);

    const trashFiles = fs.readdirSync(trashDir).filter(file => file.endsWith('.js'));
    const fileNames = trashFiles.map(v => v.replace('.js', ''));

    // 1️⃣ حالة حذف الكل
    if (text === 'كلهم') {
      if (fileNames.length === 0) {
          let info = '🗑️ مفيش ملفات في التراش.'
          return conn.reply(m.chat, info, fkontak, rcanal)
      }
      
      for (const file of trashFiles) {
        fs.unlinkSync(path.join(trashDir, file));
      }
      let info = `🧹 تم حذف *جميع ملفات التراش* (${fileNames.length} ملف).`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2️⃣ حالة عرض القائمة (لو مفيش نص)
    if (!text) {
      const list = fileNames.map((v, i) => `${i + 1}. ${v}`).join('\n');
      let info = `🗃️️ *قائمة ملفات التراش:*\n━━━━━━━━━━━━━━━━\n🔢 الإجمالي: ${fileNames.length} ملف\n━━━━━━━━━━━━━━━━\n${list || 'المجلد فارغ'}\n━━━━━━━━━━━━━━━━\n✍️ اكتب رقم، اسم الملف، أو كلمة "كلهم".\nمثال: .تراش-حذف 1`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let selectedFile = '';

    // 3️⃣ البحث بالرقم
    if (/^\d+$/.test(text)) {
      const index = parseInt(text) - 1;
      if (index >= 0 && index < fileNames.length) {
        selectedFile = fileNames[index];
      } else {
        let info = `⚠️ الرقم خارج النطاق! اختر من 1 إلى ${fileNames.length}`
        return conn.reply(m.chat, info, fkontak, rcanal)
      }
    } 
    // 4️⃣ البحث بالاسم أو أقرب تطابق
    else {
      if (fileNames.includes(text)) {
        selectedFile = text;
      } else {
        const closestMatch = findClosestMatch(text, fileNames);
        let info = `⚠️ الملف "${text}" غير موجود.`;
        if (closestMatch) info += `\n🔎 ربما تقصد: *${closestMatch}*`;
        return conn.reply(m.chat, info, fkontak, rcanal)
      }
    }

    // 5️⃣ تنفيذ الحذف النهائي
    const filePath = path.join(trashDir, `${selectedFile}.js`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      let info = `🧹 تم حذف الملف *${selectedFile}.js* بنجاح.`
      return conn.reply(m.chat, info, fkontak, rcanal)
    } else {
      let info = `❌ حدث خطأ، الملف غير موجود فعلياً.`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['تراش-حذف']
handler.tags = ['الـمـطـور']
handler.command = ['تراش-حذف', 'حذف-تراش', 'deltrash']
handler.owner = true

export default handler
