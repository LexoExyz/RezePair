import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// دالة تحويل الوقت إلى تنسيق 12 ساعة عربي
function toArabic12HourFormat(time24) {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'م' : 'ص';
  hour = hour % 12 || 12;
  return `${hour}:${minute}${period}`;
}

let handler = async (m, { conn, args, text }) => {
  try {
    // معالجة "اذان شرح ..."
    if (args[0] === 'شرح') {
      const type = args[1]?.toLowerCase();

      if (type === 'صلاه' || type === 'صلاة') {
        const prayerName = args[2];

        if (!prayerName) {
          let info = `🕌 **كيفية الصلاة:**

1. الطهارة والوضوء.
2. استقبال القبلة.
3. النية في القلب.
4. تكبيرة الإحرام.
5. قراءة الفاتحة وسورة.
6. الركوع ثم الرفع.
7. السجود مرتين.
8. التشهد والسلام.

☝️ كل صلاة لها عدد ركعات ووقت محدد، ويمكنك كتابة:
\`.اذان شرح صلاه الفجر\` أو \`.اذان شرح صلاه العصر\` وهكذا.`
          return conn.reply(m.chat, info, fkontak, rcanal);
        }

        const prayerExplanations = {
          'الفجر': `🌅 **صلاة الفجر** - 2 ركعتين فرض  
- السنة قبلها: 2 ركعتين سنة مؤكدة  
- الوقت: من الفجر الصادق حتى شروق الشمس.`,
          'الظهر': `🕛 **صلاة الظهر** - 4 ركعات فرض  
- السنة قبلها: 4  
- السنة بعدها: 2  
- الوقت: بعد الزوال حتى دخول العصر.`,
          'العصر': `🕒 **صلاة العصر** - 4 ركعات فرض  
- لا سنة راتبة مؤكدة قبلها أو بعدها  
- الوقت: من بعد الظهر حتى غروب الشمس.`,
          'المغرب': `🌆 **صلاة المغرب** - 3 ركعات فرض  
- السنة بعدها: 2  
- الوقت: من غروب الشمس حتى غياب الشفق.`,
          'العشاء': `🌙 **صلاة العشاء** - 4 ركعات فرض  
- السنة بعدها: 2  
- الوتر بعد العشاء مستحب  
- الوقت: من الشفق الأحمر حتى الفجر.`
        };

        const explanation = prayerExplanations[prayerName];
        if (explanation) {
          return conn.reply(m.chat, explanation, fkontak, rcanal);
        } else {
          let info = `❗ لم يتم التعرف على اسم الصلاة "${prayerName}".  
جرب: الفجر، الظهر، العصر، المغرب، العشاء.`
          return conn.reply(m.chat, info, fkontak, rcanal);
        }
      }

      if (type === 'الوضوء' || type === 'وضوء') {
        let info = `🧼 **كيفية الوضوء:**

1. النية.
2. التسمية: بسم الله.
3. غسل اليدين 3 مرات.
4. المضمضة 3 مرات.
5. الاستنشاق 3 مرات.
6. غسل الوجه 3 مرات.
7. غسل اليدين إلى المرفقين 3 مرات.
8. مسح الرأس.
9. مسح الأذنين.
10. غسل القدمين إلى الكعبين 3 مرات.

☝️ السنن: الترتيب، الموالاة، التثليث (الغسل ثلاثًا).`
        return conn.reply(m.chat, info, fkontak, rcanal);
      }

      let info = `❓ لا يمكن التعرف على نوع الشرح المطلوب.  
اكتب مثلًا:
- \`.اذان شرح صلاه\`
- \`.اذان شرح صلاه العصر\`
- \`.اذان شرح الوضوء\``
      return conn.reply(m.chat, info, fkontak, rcanal);
    }

    // معالجة "اذان تذكير [المكان] [الصلاة]"
    if (args[0] === 'تذكير') {
      if (args.length < 3) {
        let info = '❗ استخدم الصيغة: `.اذان تذكير [المدينة] [الصلاة]`\nمثال: `.اذان تذكير القاهرة العصر`'
        return conn.reply(m.chat, info, fkontak, rcanal);
      }

      const reminderCity = args.slice(1, -1).join(' ');
      const reminderPrayer = args[args.length - 1];
      const allowedPrayers = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

      if (!allowedPrayers.includes(reminderPrayer)) {
        let info = `❗ اسم الصلاة غير صحيح. جرب: ${allowedPrayers.join(', ')}`
        return conn.reply(m.chat, info, fkontak, rcanal);
      }

      const reminder = {
        user: m.sender,
        city: reminderCity,
        prayer: reminderPrayer,
        timestamp: Date.now()
      };

      const filePath = path.join(__dirname, '../database/reminders.json');
      if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      let data = [];
      if (fs.existsSync(filePath)) data = JSON.parse(fs.readFileSync(filePath));
      data.push(reminder);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      let info = `✅ تم حفظ تذكير الصلاة (${reminderPrayer}) في "${reminderCity}".\nسيتم منشنك عند دخول الوقت بإذن الله.`
      return conn.reply(m.chat, info, fkontak, rcanal);
    }

    // -------- جلب مواقيت الصلاة --------
    if (!text) {
      let info = '❗ من فضلك اكتب اسم الدولة أو المدينة بعد الأمر.\nمثال: `.اذان مصر القاهرة` أو `.اذان سوريا حلب`'
      return conn.reply(m.chat, info, fkontak, rcanal);
    }

    await m.react('🕌');

    const geo = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { format: 'json', q: text },
      headers: { 'User-Agent': 'Mozilla/5.0 (PrayerApp)' }
    });

    if (!geo.data || geo.data.length === 0) {
      let info = `❌ لم يتم العثور على موقع "${text}". تأكد من صحة الاسم.`
      return conn.reply(m.chat, info, fkontak, rcanal);
    }

    const { lat, lon, display_name } = geo.data[0];

    const prayer = await axios.get(`https://api.aladhan.com/v1/timings`, {
      params: { latitude: lat, longitude: lon, method: 5 }
    });

    const t = prayer.data.data.timings;
    const now = new Date();
    const timeNow = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateNow = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let response = `📅 *التاريخ:* ${dateNow}\n`;
    response += `🕰️ *الساعة الآن:* ${timeNow}\n`;
    response += `🕌 *مواقيت الصلاة في:* ${text}\n\n`;
    response += `🌅 *الفجر:* ${toArabic12HourFormat(t.Fajr)}\n`;
    response += `🌇 *الشروق:* ${toArabic12HourFormat(t.Sunrise)}\n`;
    response += `🕛 *الظهر:* ${toArabic12HourFormat(t.Dhuhr)}\n`;
    response += `🕒 *العصر:* ${toArabic12HourFormat(t.Asr)}\n`;
    response += `🌆 *المغرب:* ${toArabic12HourFormat(t.Maghrib)}\n`;
    response += `🌙 *العشاء:* ${toArabic12HourFormat(t.Isha)}\n\n`;
    response += `📍 *الموقع:* ${display_name}\n`;

    await conn.reply(m.chat, response, fkontak, rcanal);

  } catch (error) {
    console.error(error);
    let info = '⚠️️ حدث خطأ أثناء جلب البيانات. تأكد من اتصال الإنترنت أو كتابة الموقع بشكل صحيح.'
    conn.reply(m.chat, info, fkontak, rcanal);
  }
};

handler.help = ['اذان'];
handler.tags = ['الـديــن'];
handler.command = ['اذان', 'أذان', 'مواقيت'];

export default handler;
