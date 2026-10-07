let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const args = text.trim().split(' ');
        const minutes = parseInt(args[0]);
        const reminder = args.slice(1).join(' ') || '🔔 تـذكـيـر!';

        if (!minutes || isNaN(minutes) || minutes <= 0) {
            let info = `❌ يـرجـى تـحـديـد عـدد الـدقـائـق أولاً.\n> *مـثـال:* ${usedPrefix + command} 10 صلاة العصر`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        const senderJid = m.sender;
        const senderNumber = senderJid.split('@')[0];

        await m.react('⏰')
        
        let info = `⏱️ أبـشـر، سـأقوم بـتـذكـيـرك بـعـد ${minutes} دقـيـقـة.`
        await conn.reply(m.chat, info, fkontak, rcanal, {
            mentions: [senderJid]
        })

        // ضبط المؤقت للـتـذكـيـر
        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: `🔔 تـذكـيـر لـ @${senderNumber}:\n\n> ${reminder}`,
                mentions: [senderJid]
            }, { quoted: m });
        }, minutes * 60 * 1000);

    } catch (error) {
        console.error('❌ Reminder Error:', error);
        let info = '❌ حـدث خـطأ أثـنـاء ضـبـط الـتـذكـيـر.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['ذكرني <عدد الدقائق> <النص>']
handler.tags = ['الـأعـضـاء']
handler.command = ['ذكرني', 'تذكير', 'remind']

export default handler
