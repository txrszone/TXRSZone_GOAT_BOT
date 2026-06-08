const si = require('systeminformation');
const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "system",
    aliases: ["sys", "server"],
    version: "1.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "System Information",
    longDescription: "Get server/system information",
    category: "info",
    guide: "{p}system"
  },

  onStart: async function ({ message, event, api }) {
    const timeStart = Date.now();

    try {
      const cpuData = await si.cpu();
      const tempData = await si.cpuTemperature();
      const loadData = await si.currentLoad();
      const diskData = await si.diskLayout();
      const memData = await si.memLayout();
      const memStats = await si.mem();
      const osData = await si.osInfo();

      const { manufacturer, brand, speed, physicalCores, cores } = cpuData;
      const mainTemp = tempData.main;
      const load = loadData.currentLoad;
      const diskInfo = diskData[0];
      const memInfo = memData[0];
      const { total: totalMem, available: availableMem } = memStats;
      const { platform: OSPlatform, build: OSBuild } = osData;

      // ✅ বাংলাদেশের সময় (বাংলাদেশ সময় অঞ্চল)
      const bangladeshTime = moment().tz("Asia/Dhaka");
      const currentTime = bangladeshTime.format("hh:mm:ss A");
      const currentDate = bangladeshTime.format("DD/MM/YYYY");
      const currentDay = bangladeshTime.format("dddd");

      const botUptime = process.uptime();
      const botHours = Math.floor(botUptime / 3600).toString().padStart(2, '0');
      const botMinutes = Math.floor((botUptime % 3600) / 60).toString().padStart(2, '0');
      const botSeconds = Math.floor(botUptime % 60).toString().padStart(2, '0');

      const byte2mb = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

      const systemInfo = `
╭──────────────────╮
│        📊 SYSTEM INFO            │
╰──────────────────╯

🕐 **BANGLADESH TIME**
├ 📅 Date: ${currentDate}
├ 📆 Day: ${currentDay}
└ 🕒 Time: ${currentTime}

🖥️ **CPU INFO**
├ 🔹 Model: ${manufacturer || 'N/A'} ${brand || ''}
├ ⚡ Speed: ${speed || 'N/A'} GHz
├ 🧠 Cores: ${physicalCores || 'N/A'} (${cores || 'N/A'} threads)
├ 🌡️ Temp: ${mainTemp ? mainTemp + '°C' : 'N/A'}
└ 📈 Load: ${load ? load.toFixed(1) + '%' : 'N/A'}

💾 **MEMORY INFO**
├ 📦 Total: ${byte2mb(totalMem)}
├ 📀 Type: ${memInfo?.type || 'N/A'}
└ 🟢 Available: ${byte2mb(availableMem)}

💿 **DISK INFO**
├ 🏷️ Name: ${diskInfo?.name || 'N/A'}
├ 📏 Size: ${diskInfo?.size ? byte2mb(diskInfo.size) : 'N/A'}
├ 🔧 Type: ${diskInfo?.type || 'N/A'}
└ 🌡️ Temp: ${diskInfo?.temperature ? diskInfo.temperature + '°C' : 'N/A'}

🖧 **OS INFO**
├ 🔹 Platform: ${OSPlatform || 'N/A'}
├ 🔨 Build: ${OSBuild || 'N/A'}
└ 🤖 Bot Uptime: ${botHours}:${botMinutes}:${botSeconds}

━━━━━━━━━━━━━━━━━━━━
⏱️ Response: ${Date.now() - timeStart}ms
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot | OWNER: OMOR TE`;

      // Random images array
      const images = [
        "https://i.imgur.com/YY14Wdl.jpeg",
        "https://i.imgur.com/IetbODK.jpeg",
        "https://i.imgur.com/H1B8VZ4.jpeg",
        "https://i.imgur.com/on9p0FK.jpg",
        "https://i.imgur.com/mriBW5m.jpg",
        "https://i.imgur.com/ZwEP7z6.jpeg",
        "https://i.imgur.com/BsJ7otS.jpeg"
      ];
      
      const randomImg = images[Math.floor(Math.random() * images.length)];
      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, "system.jpg");
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Download image
      request(encodeURI(randomImg))
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => {
          api.sendMessage({
            body: systemInfo,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => {
            try { fs.unlinkSync(filePath); } catch(e) {}
          }, event.messageID);
        })
        .on("error", (err) => {
          console.error("Image download error:", err);
          api.sendMessage(systemInfo, event.threadID, event.messageID);
        });

    } catch (err) {
      console.error("System info error:", err);
      message.reply(`❌ Failed to fetch system information.\n💡 ${err.message}`);
    }
  }
};
