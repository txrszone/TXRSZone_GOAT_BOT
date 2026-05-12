const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "weather",
    version: "1.2",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Weather Forecast",
    longDescription: "Get current weather forecast for any city",
    guide: "{p}weather <city>",
    category: "other"
  },

  onStart: async function ({ message, event, args, api }) {
    const area = args.join(" ");
    
    if (!area) {
      return message.reply(`🌤️ **WEATHER FORECAST**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: weather Dhaka\n📌 উদাহরণ: weather London\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    // ✅ কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`🌤️ Fetching weather for ${area}...`);

    try {
      const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
      
      // লোকেশন সার্চ
      const locationRes = await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=en`);
      
      if (locationRes.data.length === 0) {
        try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
        return message.reply(`❌ Location not found: ${area}`);
      }

      const location = locationRes.data[0];
      const areaKey = location.Key;
      const areaName = location.LocalizedName;
      const country = location.Country?.LocalizedName || "";

      // আবহাওয়ার তথ্য
      const weatherRes = await axios.get(`http://api.accuweather.com/forecasts/v1/daily/1day/${areaKey}?apikey=${apikey}&details=true&language=en`);
      const today = weatherRes.data.DailyForecasts[0];

      function convertFtoC(F) {
        return Math.floor((F - 32) / 1.8);
      }

      function formatTime(timeStr) {
        if (!timeStr) return "N/A";
        const date = new Date(timeStr);
        return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      // ✅ সুন্দর ফরম্যাট (পাশাপাশি দেখাবে)
      const msg = `
╭─────────────────────╮
│   🌤️ WEATHER FORECAST   │
╰─────────────────────╯

📍 ${areaName}, ${country}
📅 ${moment().format("DD/MM/YYYY")}

─────────────────────

📌 ${weatherRes.data.Headline?.Text || "Today's forecast"}

─────────────────────

🌡️ Min Temp : ${convertFtoC(today.Temperature.Minimum.Value)}°C
🌡️ Max Temp : ${convertFtoC(today.Temperature.Maximum.Value)}°C
🌡️ Feels Like: ${convertFtoC(today.RealFeelTemperature.Minimum.Value)}°C - ${convertFtoC(today.RealFeelTemperature.Maximum.Value)}°C

─────────────────────

🌅 Sunrise   : ${formatTime(today.Sun.Rise)}
🌄 Sunset    : ${formatTime(today.Sun.Set)}
🌃 Moonrise  : ${formatTime(today.Moon.Rise)}
🏙️ Moonset   : ${formatTime(today.Moon.Set)}

─────────────────────

☀️ Day   : ${today.Day.LongPhrase || "N/A"}
🌙 Night : ${today.Night.LongPhrase || "N/A"}

─────────────────────
⚡ MW Legends Bot
      `;

      // ✅ কনফার্মেশন মেসেজ ডিলিট
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {
        console.log("Could not unsend confirmation message");
      }

      // ✅ ফলাফল পাঠানো
      await message.reply(msg);

    } catch (error) {
      console.error("Weather error:", error);
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
      message.reply(`❌ Could not fetch weather for "${area}". Please check the city name and try again.`);
    }
  }
};
