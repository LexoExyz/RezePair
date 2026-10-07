// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import { promises as fs } from 'fs';
import path from 'path';

/**
 * clean_bak.js
 * حذف ملفات النسخ الاحتياطية (.bak) - للمطور فقط
 */

let handler = async (m, { conn, isROwner }) => {
    // التحقق من أن المستخدم هو المطور (صاحب البوت)
    if (!isROwner) return; 

    const baseDir = path.resolve('./');
    let deletedCount = 0;

    // دالة داخلية للبحث والحذف بشكل متكرر (Recursive)
    async function cleanDirectory(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // تجاهل المجلدات التي تحتوي على ملفات النظام أو المكتبات الثقيلة
                if (['node_modules', '.git', 'sessions', 'ملف_الاتصال'].includes(entry.name)) continue;
                await cleanDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.bak')) {
                const originalName = entry.name.replace(/\.bak$/, '');
                const originalPath = path.join(dir, originalName);

                try {
                    // نتحقق إذا كان الملف الأصلي موجوداً قبل حذف النسخة الاحتياطية
                    await fs.access(originalPath); 
                    await fs.unlink(fullPath);
                    deletedCount++;
                } catch {
                    // إذا لم يوجد الملف الأصلي، نترك نسخة الـ .bak للأمان
                }
            }
        }
    }

    try {
        let waitInfo = '⏳ جاري فحص الملفات وتنظيف النسخ الاحتياطية...'
        conn.reply(m.chat, waitInfo, fkontak, rcanal)
        
        await cleanDirectory(baseDir);

        let info = deletedCount
            ? `🧹 تم بنجاح حذف *${deletedCount}* ملف نسخة احتياطية (.bak).`
            : '✅ النظام نظيف، لا توجد نسخ احتياطية زائدة.';

        return conn.reply(m.chat, info, fkontak, rcanal)
    } catch (e) {
        console.error(e);
        let info = '❌ حدث خطأ أثناء عملية التنظيف.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['نظف'];
handler.tags = ['الـمـطـور'];
handler.command = ['نظف', 'تنظيف', 'clean'];
handler.rowner = true; 

export default handler;
