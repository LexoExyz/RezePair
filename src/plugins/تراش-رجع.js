import fs from 'fs'
import path from 'path'

// دالة حساب المسافة بين الكلمات (للبحث الذكي)
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  matrix[0] = Array.from({ length: a.length + 1 }, (_, j) => j);

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
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
    const pluginsDir = path.resolve('./plugins');

    if (!fs.existsSync(trashDir)) {
        let info = '🗑️ مجلد التراش غير موجود حالياً.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const trashFiles = fs.readdirSync(trashDir).filter(f => f.endsWith('.js'));
    const fileNames = trashFiles.map(f => f.replace('.js', ''));

    // دالة الاسترجاع
    const restoreFile = (fileName) => {
      const src = path.join(trashDir, `${fileName}.js`);
      const dest = path.join(pluginsDir, `${fileName}.js`);
      if (!fs.existsSync(src)) return `❌ الملف ${fileName} مش موجود.`;
      fs.renameSync(src, dest);
      return `✅ تم استرجاع: *${fileName}*`;
    };

    // 1️⃣ حالة استرجاع الكل
    if (text === 'كلهم') {
      if (fileNames.length === 0) {
          let info = '🗑️️ مفيش ملفات في التراش.'
          return conn.reply(m.chat, info, fkontak, rcanal)
      }
      
      const results = fileNames.map(name => restoreFile(name));
      let info = `♻️ *نتائج الاسترجاع:*\n\n${results.join('\n')}`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2️⃣ حالة عرض القائمة (لو مفيش نص)
    if (!text) {
      if (fileNames.length === 0) {
          let info = '🗑️ مفيش ملفات في التراش لاسترجاعها.'
          return conn.reply(m.chat, info, fkontak, rcanal)
      }
      const list = fileNames.map((v, i) => `${i + 1}. ${v}`).join('\n');
      let info = `♻️ *ملفات التراش القابلة للاسترجاع:*\n━━━━━━━━━━━━━━━━\n🔢 الإجمالي: ${fileNames.length} ملف\n━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━\n✍️ اكتب رقم، اسم الملف، أو "كلهم" للاسترجاع.`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let selectedFile = '';

    // 3️⃣ البحث بالرقم
    if (/^\d+$/.test(text)) {
      const index = parseInt(text) - 1;
      if (index >= 0 && index < fileNames.length) {
        selectedFile = fileNames[index];
      } else {
        let info = `⚠️ الرقم خارج النطاق! اختر من 1 لـ ${fileNames.length}`
        return conn.reply(m.chat, info, fkontak, rcanal)
      }
    } 
    // 4️⃣ البحث بالاسم أو أقرب تطابق
    else {
      let input = text.toLowerCase().trim();
      if (fileNames.includes(input)) {
        selectedFile = input;
      } else {
        const closest = findClosestMatch(input, fileNames);
        let info = `⚠️ الملف "${text}" غير موجود في التراش.`;
        if (closest) info += `\n🔍 ممكن تقصد: *${closest}*`;
        return conn.reply(m.chat, info, fkontak, rcanal)
      }
    }

    // 5️⃣ التنفيذ النهائي
    const result = restoreFile(selectedFile);
    return conn.reply(m.chat, result, fkontak, rcanal)
}

handler.help = ['تراش-رجع']
handler.tags = ['الـمـطـور']
handler.command = ['تراش-رجع', 'restoretrash']
handler.owner = true

export default handler
