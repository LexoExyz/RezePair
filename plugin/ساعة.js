import moment from 'moment-timezone'

let handler = async (m, { conn }) => {
    const countries = [
        ['🇸🇦 السعودية', 'Asia/Riyadh'],
        ['🇪🇬 مصر', 'Africa/Cairo'],
        ['🇦🇪 الإمارات', 'Asia/Dubai'],
        ['🇶🇦 قطر', 'Asia/Qatar'],
        ['🇰🇼 الكويت', 'Asia/Kuwait'],
        ['🇮🇶 العراق', 'Asia/Baghdad'],
        ['🇱🇧 لبنان', 'Asia/Beirut'],
        ['🇯🇴 الأردن', 'Asia/Amman'],
        ['🇸🇾 سوريا', 'Asia/Damascus'],
        ['🇩🇿 الجزائر', 'Africa/Algiers'],
        ['🇲🇦 المغرب', 'Africa/Casablanca'],
        ['🇹🇳 تونس', 'Africa/Tunis'],
        ['🇴🇲 عمان', 'Asia/Muscat'],
        ['🇧🇭 البحرين', 'Asia/Bahrain'],
        ['🇵🇸 فلسطين', 'Asia/Gaza'],
        ['🇸🇩 السودان', 'Africa/Khartoum'],
        ['🇱🇾 ليبيا', 'Africa/Tripoli'],
        ['🇲🇷 موريتانيا', 'Africa/Nouakchott'],
        ['🇰🇲 جزر القمر', 'Indian/Comoro'],
        ['🇺🇸 أمريكا', 'America/New_York'],
        ['🇬🇧 بريطانيا', 'Europe/London'],
        ['🇯🇵 اليابان', 'Asia/Tokyo'],
        ['🇹🇷 تركيا', 'Europe/Istanbul'],
        ['🇩🇯 جيبوتي', 'Africa/Djibouti']
    ];

    let response = `*🕒 الـوقـت الآن حـول الـعـالـم 🌍*\n`
    response += `*‏⎔ ٠ ┈─ ━╼ • ◞🕊️◜ • ╾━ ─┈‏ ٠ ⎔*\n\n`

    for (let [name, zone] of countries) {
        const time = moment().tz(zone).format('hh:mm A');
        response += `*┃ ${name}* ⮕ \`${time}\`\n`;
    }

    response += `\n*‏⎔ ٠ ┈─ ━╼ • ◞🕊️◜ • ╾━ ─┈‏ ٠ ⎔*`

    // استخدام نظام الرد الموثق الخاص بك
    return conn.reply(m.chat, response, fkontak, rcanal)
}

handler.help = ['اوقات']
handler.tags = ['الـأعـضـاء']
handler.command = ['اوقات', 'الساعة', 'time']

export default handler
