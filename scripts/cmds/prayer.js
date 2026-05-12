const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "prayer",
    version: "3.0 REL_GLOBAL",
    author: "OMOR TE",
    countDown: 3,
    role: 0,
    shortDescription: "Prayer Times",
    longDescription: "Get prayer times for any city in the world",
    guide: "{p}prayer <city>, <country>",
    category: "islamic"
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ");
    
    if (!input) {
      return message.reply(`🕌 **Prayer Times**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: prayer <শহর>, <দেশ>\n\n📝 উদাহরণ:\n• prayer Dhaka, Bangladesh\n• prayer London, UK\n• prayer Makkah, Saudi Arabia\n• prayer New York, USA\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    const now = moment().tz("Asia/Dhaka");
    const date = now.format("DD MMMM YYYY");
    const day = now.format("dddd");
    
    try {
      // ✅ আপনার দেওয়া OpenCage API Key
      const OPENCAGE_KEY = "182ea05e202843aaa3bfeaa662dc856f";
      
      const geoResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(input)}&key=${OPENCAGE_KEY}&limit=1`);
      
      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        return message.reply(`❌ "${input}" খুঁজে পাওয়া যায়নি!\n━━━━━━━━━━━━━━━━━━━━\n💡 সঠিক বানান ও ফরম্যাট ব্যবহার করুন\n📌 উদাহরণ: prayer Makkah, Saudi Arabia`);
      }
      
      const location = geoResponse.data.results[0];
      const lat = location.geometry.lat;
      const lon = location.geometry.lng;
      const city = location.components.city || location.components.town || location.components.village || input;
      const country = location.components.country || "Unknown";
      
      // নামাজের সময় API 
      const prayerResponse = await axios.get(`https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=1`);
      
      const timings = prayerResponse.data.data.timings;
      
      const msg = `
╔════════════════════════════╗
║    🕌 নামাজের সময়সূচি 🕌    ║
╚════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 **${city}, ${country}**
📅 ${date} | ${day}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌙 **সেহরি শেষ:** ${timings.Fajr}
🕌 **ফজর:** ${timings.Fajr}
☀️ **সূর্যোদয়:** ${timings.Sunrise}

☀️ **যোহর:** ${timings.Dhuhr}
🌤️ **আসর:** ${timings.Asr}

🌅 **মাগরিব (ইফতার):** ${timings.Maghrib}
🌙 **ইশা:** ${timings.Isha}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤲 **আল্লাহ আমাদের সকলের ইবাদত কবুল করুন**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ 𝐌𝐖 𝐋𝐞𝐠𝐞𝐧𝐝𝐬 𝐁𝐨𝐭
      `;
      
      await message.reply(msg);
      
    } catch (error) {
      console.error("Prayer API error:", error);
      message.reply(`❌ নামাজের সময় বের করতে ব্যর্থ হয়েছে!\n━━━━━━━━━━━━━━━━━━━━\n💡 ${input} সঠিক শহর/দেশ লিখুন\n📌 উদাহরণ: prayer London, UK`);
    }
  }
};
