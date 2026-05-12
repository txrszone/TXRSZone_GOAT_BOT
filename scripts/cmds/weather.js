const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

// ফন্ট রেজিস্টার (যদি ফাইল থাকে)
const fontSemiBold = path.join(__dirname, "assets", "font", "BeVietnamPro-SemiBold.ttf");
const fontRegular = path.join(__dirname, "assets", "font", "BeVietnamPro-Regular.ttf");

if (fs.existsSync(fontSemiBold)) {
  Canvas.registerFont(fontSemiBold, { family: "BeVietnamPro-SemiBold" });
}
if (fs.existsSync(fontRegular)) {
  Canvas.registerFont(fontRegular, { family: "BeVietnamPro-Regular" });
}

function convertFtoC(F) {
  return Math.floor((F - 32) / 1.8);
}

function formatHours(hours) {
  return moment(hours).tz("Asia/Dhaka").format("HH[h]mm[p]");
}

module.exports = {
  config: {
    name: "weather",
    version: "1.2",
    author: "NTKhang (Converted by OMOR TE)",
    countDown: 5,
    role: 0,
    shortDescription: "Weather Forecast",
    longDescription: "View current and next days weather forecast",
    guide: "{p}weather <location>",
    category: "other"
  },

  onStart: async function ({ message, args }) {
    const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
    const area = args.join(" ");
    
    if (!area) {
      return message.reply(`🌤️ **WEATHER FORECAST**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: weather Dhaka\n📌 উদাহরণ: weather London\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    // কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`🌤️ **Fetching weather for ${area}...**\n━━━━━━━━━━━━━━━━━━━━\n⏳ Please wait!`);

    try {
      // 1. লোকেশন সার্চ
      const locationRes = await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=en`);
      
      if (locationRes.data.length === 0) {
        try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
        return message.reply(`❌ Location not found: ${area}`);
      }

      const location = locationRes.data[0];
      const areaKey = location.Key;
      const areaName = location.LocalizedName;
      const country = location.Country?.LocalizedName || "";

      // 2. আবহাওয়ার তথ্য
      const weatherRes = await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=en`);
      const weatherData = weatherRes.data;
      const dailyForecasts = weatherRes.data.DailyForecasts;
      const today = dailyForecasts[0];

      // টেক্সট মেসেজ
      const msg = `🌤️ **WEATHER FORECAST**\n━━━━━━━━━━━━━━━━━━━━\n📍 ${areaName}, ${country}\n📅 ${moment().format("DD MMMM YYYY")}\n━━━━━━━━━━━━━━━━━━━━\n📌 ${weatherData.Headline?.Text || "Today's forecast"}\n━━━━━━━━━━━━━━━━━━━━\n🌡️ Min: ${convertFtoC(today.Temperature.Minimum.Value)}°C\n🌡️ Max: ${convertFtoC(today.Temperature.Maximum.Value)}°C\n🌡️ Feels like: ${convertFtoC(today.RealFeelTemperature.Minimum.Value)}°C - ${convertFtoC(today.RealFeelTemperature.Maximum.Value)}°C\n━━━━━━━━━━━━━━━━━━━━\n🌅 Sunrise: ${formatHours(today.Sun.Rise)}\n🌄 Sunset: ${formatHours(today.Sun.Set)}\n🌃 Moonrise: ${formatHours(today.Moon.Rise)}\n🏙️ Moonset: ${formatHours(today.Moon.Set)}\n━━━━━━━━━━━━━━━━━━━━\n☀️ Day: ${today.Day.LongPhrase || "N/A"}\n🌙 Night: ${today.Night.LongPhrase || "N/A"}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;

      // ইমেজ জেনারেট করার চেষ্টা (যদি ব্যাকগ্রাউন্ড থাকে)
      const bgPath = path.join(__dirname, "assets", "image", "bgWeather.jpg");
      let attachment = null;

      if (fs.existsSync(bgPath)) {
        try {
          const bg = await Canvas.loadImage(bgPath);
          const { width, height } = bg;
          const canvas = Canvas.createCanvas(width, height);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(bg, 0, 0, width, height);
          
          let X = 100;
          ctx.fillStyle = "#ffffff";
          const sevenDays = dailyForecasts.slice(0, 7);
          
          for (const item of sevenDays) {
            try {
              const iconUrl = `http://vortex.accuweather.com/adc2010/images/slate/icons/${item.Day.Icon}.svg`;
              const iconRes = await axios.get(iconUrl, { responseType: "arraybuffer" });
              const icon = await Canvas.loadImage(iconRes.data);
              ctx.drawImage(icon, X, 210, 80, 80);
            } catch(e) {}
            
            ctx.font = "30px BeVietnamPro-SemiBold";
            const maxC = `${convertFtoC(item.Temperature.Maximum.Value)}°C `;
            ctx.fillText(maxC, X, 366);
            
            ctx.font = "30px BeVietnamPro-Regular";
            const minC = `${convertFtoC(item.Temperature.Minimum.Value)}°C`;
            const day = moment(item.Date).format("DD");
            ctx.fillText(minC, X, 445);
            ctx.fillText(day, X + 20, 140);
            
            X += 135;
          }
          
          const cacheDir = path.join(__dirname, "cache");
          if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
          
          const imgPath = path.join(cacheDir, `weather_${areaKey}.png`);
          fs.writeFileSync(imgPath, canvas.toBuffer());
          attachment = fs.createReadStream(imgPath);
          
          setTimeout(() => {
            try { fs.unlinkSync(imgPath); } catch(e) {}
          }, 30000);
          
        } catch (imgErr) {
          console.error("Image generation error:", imgErr);
        }
      }

      // কনফার্মেশন মেসেজ ডিলিট
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}

      // ফলাফল পাঠানো
      if (attachment) {
        await message.reply({
          body: msg,
          attachment: attachment
        });
      } else {
        await message.reply(msg);
      }

    } catch (error) {
      console.error("Weather error:", error);
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      message.reply(`❌ Error: ${error.message || "Could not fetch weather data"}`);
    }
  }
};
