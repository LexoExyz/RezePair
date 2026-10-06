// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
const handler = async (m, {conn}) => {
  // إعادة ضبط الرموز الافتراضية للمشغل
  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  
  let info = `✅️ *تـم إعـادة ضـبـط الـبـريـفـكـس بـنـجـاح!*`;
  
  // استخدام نظام الرد الموثق الخاص بك
  return conn.reply(m.chat, info, fkontak, rcanal)
};

handler.help = ['رجعه'];
handler.tags = ['الـمـطـور'];
handler.command = ['resetprefix', 'رجعه', 'الرمز'];

export default handler;
