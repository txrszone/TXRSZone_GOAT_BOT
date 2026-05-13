const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "weather",
    version: "3.1.0",
    author: "OMOR TE",
    countDown: 2,
    role: 0,
    shortDescription: "Weather Forecast",
    longDescription: "Get essential weather information",
    guide: "{p}weather <city>",
    category: "weather"
  },

  onStart: async function ({ message, event, args, api }) {
    const area = args.join(" ");
    
    if (!area) {
      return message.reply(`🌤️ **WEATHER**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: weather Dhaka\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    const confirmMsg = await message.reply(`⏳ ${area} এর আবহাওয়া খোঁজা হচ্ছে...`);

    try {
      const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
      
      const locationRes = await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=en`);
      
      if (locationRes.data.length === 0) {
        try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
        return message.reply(`❌ "${area}" খুঁজে পাওয়া যায়নি!`);
      }

      const location = locationRes.data[0];
      const weatherRes = await axios.get(`http://api.accuweather.com/forecasts/v1/daily/1day/${location.Key}?apikey=${apikey}&details=true&metric=true&language=en`);
      const today = weatherRes.data.DailyForecasts[0];

      function toC(F) {
        return Math.floor((F - 32) / 1.8);
      }

      // ✅ 12 ঘন্টা ফরম্যাটে সময় দেখানোর ফাংশন
      function formatTime12(timeStr) {
        if (!timeStr) return "N/A";
        const date = new Date(timeStr);
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }

      // 🌅 সূর্যোদয়/সূর্যাস্ত ঠিক করা (UTC to Local)
      function formatSunTime(timeStr) {
        if (!timeStr) return "N/A";
        // AccuWeather থেকে আসা সময় UTC, বাংলাদেশের জন্য +6 ঘন্টা যোগ
        const date = new Date(timeStr);
        date.setHours(date.getHours() + 6); // UTC+6 for Bangladesh
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }

      // তাপমাত্রা
      const minTemp = Math.round(today.Temperature.Minimum.Value);
      const maxTemp = Math.round(today.Temperature.Maximum.Value);
      const feelMin = Math.round(today.RealFeelTemperature.Minimum.Value);
      const feelMax = Math.round(today.RealFeelTemperature.Maximum.Value);
      
      // বাতাস
      let wind = "N/A";
      if (today.Day?.Wind?.Speed?.Value) {
        wind = `${today.Day.Wind.Speed.Value} ${today.Day.Wind.Speed.Unit}`;
      }
      
      // বৃষ্টির সম্ভাবনা
      let rainChance = "N/A";
      if (today.Day?.RainProbability) rainChance = `${today.Day.RainProbability}%`;
      else if (today.Day?.PrecipitationProbability) rainChance = `${today.Day.PrecipitationProbability}%`;
      
      // মেঘ
      let cloud = "N/A";
      if (today.Day?.CloudCover) cloud = `${today.Day.CloudCover}%`;
      
      // UV রেটিং
      const uvIndex = today.Day?.UVIndex || "N/A";
      let uvGuide = "";
      let uvEmoji = "☀️";
      
      if (uvIndex !== "N/A") {
        if (uvIndex <= 2) { uvGuide = "নিরাপদ - বাইরে যেতে পারেন"; uvEmoji = "🟢"; }
        else if (uvIndex <= 5) { uvGuide = "মাঝারি - সানস্ক্রিন ব্যবহার করুন"; uvEmoji = "🟡"; }
        else if (uvIndex <= 7) { uvGuide = "উচ্চ - ছাতা~সানস্ক্রিন লাগবে"; uvEmoji = "🟠"; }
        else if (uvIndex <= 10) { uvGuide = "খুব উচ্চ - দুপুরে বাইরে যাবেন না"; uvEmoji = "🔴"; }
        else { uvGuide = "চরম উচ্চ - বাইরে যাওয়া বিপজ্জনক!!"; uvEmoji = "⚫"; }
      }

      // ✅ সূর্যোদয়/সূর্যাস্ত (ঠিক সময়)
      const sunrise = formatSunTime(today.Sun?.Rise);
      const sunset = formatSunTime(today.Sun?.Set);
      
      // ✅ চন্দ্রোদয়/চন্দ্রাস্ত
      const moonrise = formatTime12(today.Moon?.Rise);
      const moonset = formatTime12(today.Moon?.Set);

      // ☀️ দিনের আবহাওয়া
      const dayWeather = today.Day?.LongPhrase || "N/A";
      
      // 🌙 রাতের আবহাওয়া
      const nightWeather = today.Night?.LongPhrase || "N/A";

      const msg = `
╭───────────────────╮
│    🌤️ WEATHER FORECAST     │
╰───────────────────╯

📍 ${location.LocalizedName}, ${location.Country?.LocalizedName || ""}
📅 ${moment().format("DD/MM/YYYY")}

─────────────────────

🌡️ ${minTemp}°C ~ ${maxTemp}°C
🌡️ ফিলস লাইক: ${feelMin}°C ~ ${feelMax}°C

💨 বাতাস: ${wind}
☔ বৃষ্টি: ${rainChance}
☁️ মেঘ: ${cloud}
☀️ ইউভি: ${uvIndex} ${uvEmoji} (${uvGuide})

─────────────────────

🌅 সূর্যোদয়: ${sunrise}
🌄 সূর্যাস্ত: ${sunset}
🌙 চন্দ্রোদয়: ${moonrise}
🌙 চন্দ্রাস্ত: ${moonset}

─────────────────────

☀️ দিন: ${dayWeather}
🌙 রাত: ${nightWeather}

─────────────────────

📌 ${weatherRes.data.Headline?.Text || "Today's forecast"}

─────────────────────
⚡ MW Legends Bot ☸️
      `;

      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      await message.reply(msg);

    } catch (error) {
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      message.reply(`❌ "${area}" এর আবহাওয়া পাওয়া যায়নি।`);
    }
  }
};
