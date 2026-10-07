let handler = async (m, { conn, chatId }) => {
    try {
        // الوصول إلى كاش الأجهزة
        const data = conn.ws.config.userDevicesCache.data || {};
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.id.replace(/@s\.whatsapp\.net$/, ''));

        const devicesMap = {};
        for (const number of Object.keys(data)) {
            if (participants.includes(number)) {
                const count = ((data[number].v || []).length) - 1; // طرح الجهاز الرئيسي
                if (count > 0) {
                    devicesMap[number] = count;
                }
            }
        }

        const multiDevices = Object.entries(devicesMap);

        const deviceList = multiDevices.map(
            ([num, count]) => `│┊ ۬.͜ـ📡˖ ⟨@${num} ⌯ الأجهزة: ${count}☇`
        ).join('\n');

        const info = multiDevices.length === 0
            ? `✅ مافي أي عضو عنده أجهزة مرتبطة 👌`
            : `
╮••─๋︩︪──๋︩︪─═⊐‹📡›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ الأعضــاء اللـي عندهـم أجـهـزة مـُرتـَبـِطـَة
── • ◈ • ──
${deviceList}
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹⚠️›⊏═┈ ─๋︩︪─┈⥶`;

        // استخدام الرد الموثق الخاص بك
        return conn.reply(m.chat, info, fkontak, rcanal)

    } catch (error) {
        console.error('❌ خطأ في أمر بوتات:', error);
        let infoError = '❌ حدث خطأ أثناء التحقق من الأجهزة.'
        return conn.reply(m.chat, infoError, fkontak, rcanal)
    }
}

handler.help = ['بوتات']
handler.tags = ['الـمـطـور']
handler.command = ['بوتات', 'bots', 'الاجهزة', 'multi']
handler.owner = true // حصري للمطور
handler.group = true // يعمل في المجموعات فقط لجلب الأعضاء

export default handler

