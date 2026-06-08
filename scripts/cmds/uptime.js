const moment = require("moment-timezone");
const axios = require("axios");
const { performance } = require("perf_hooks");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const os = require("os");

moment.tz.setDefault("Asia/Dhaka");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    version: "2.0.0",
    role: 0,
    credits: "•Omor TE•",
    description: "Shows bot uptime with text on custom secured image",
    category: "system",
    guide: "{p}upt or {p}uptime"
  },

  onStart: async function ({ api, event }) {
    try {
      const startTime = performance.now();

      const currentDate = moment().format("DD/MM/YYYY");

      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptimeText = `${h}h ${m}m ${s}s`;

      const cpuUsage = (os.loadavg()[0] * 10).toFixed(1);

      const osType = os.type();
      const osRelease = os.release();
      const osText = `${osType} ${osRelease}`;

      const backgroundUrl = "https://i.postimg.cc/3wbvnfHP/Polish-20260511-164744529.jpg";
      const __B = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      // ✅ ফন্ট সাইজ 61px (আগের মতো)
      const fontSize = 61;
      // ✅ ফন্ট পরিবর্তন - আরও আধুনিক ও মসৃণ
      ctx.font = `bold ${fontSize}px "Poppins", "Segoe UI", "Roboto", "Sans-serif"`;
      ctx.lineWidth = 3;

      // ✅ নতুন কালার স্কিম (সবুজ/নীল/সাদা টোন - চোখে আরামদায়ক)
      const lineColors = [
        "#FFFFFF", // সাদা (Uptime)
        "#00FFAA", // উজ্জ্বল মিন্ট গ্রিন (Ping)
        "#00AAFF", // উজ্জ্বল নীল (CPU)
        "#FFAA00", // কমলা (OS)
        "#FF00AA", // গোলাপি (Date)
        "#AAFF00"  // লেবু গ্রিন (Owner)
      ];

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // ✅ আগের থেকে 2px উপরে (posY কমিয়েছি)
      let posY = __C.height / 2 - 122;  // আগে ছিল -120, এখন -122 (2px উপরে)
      const posX = 70;
      const lineHeight = 78;

      function drawLines(linesArray, context, yStart) {
        let tempY = yStart;
        for (let i = 0; i < linesArray.length; i++) {
          const line = linesArray[i];
          const color = lineColors[i % lineColors.length];

          context.fillStyle = color;
          context.strokeStyle = "#000000";
          context.lineWidth = 2.5;

          context.strokeText(line, posX, tempY);
          context.fillText(line, posX, tempY);

          tempY += lineHeight;
        }
      }

      const tempLines = [
        `⚡ Uptime : ${uptimeText}`,
        `📡 Ping   : ...ms`,
        `💻 CPU    : ${cpuUsage}%`,
        `🖥️ OS     : ${osText}`,
        `📅 Date   : ${currentDate}`,
        `👑 Owner  : • OMOR TE •`
      ];
      drawLines(tempLines, ctx, posY);

      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);

      const canvasFinal = createCanvas(__C.width, __C.height);
      const ctxFinal = canvasFinal.getContext("2d");
      ctxFinal.drawImage(__C, 0, 0, __C.width, __C.height);
      ctxFinal.font = `bold ${fontSize}px "Poppins", "Segoe UI", "Roboto", "Sans-serif"`;
      ctxFinal.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctxFinal.shadowBlur = 10;
      ctxFinal.shadowOffsetX = 2;
      ctxFinal.shadowOffsetY = 2;

      const finalLines = [
        `⚡ Uptime : ${uptimeText}`,
        `📡 Ping   : ${ping}ms`,
        `💻 CPU    : ${cpuUsage}%`,
        `🖥️ OS     : ${osText}`,
        `📅 Date   : ${currentDate}`,
        `👑 Owner  : • OMOR TE •`
      ];

      let finalY = posY;
      for (let i = 0; i < finalLines.length; i++) {
        ctxFinal.fillStyle = lineColors[i % lineColors.length];
        ctxFinal.strokeStyle = "#000000";
        ctxFinal.lineWidth = 2.5;
        ctxFinal.strokeText(finalLines[i], posX, finalY);
        ctxFinal.fillText(finalLines[i], posX, finalY);
        finalY += lineHeight;
      }

      ctxFinal.shadowBlur = 0;

      const finalBuffer = canvasFinal.toBuffer("image/png");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `uptime_${Date.now()}.png`);
      fs.writeFileSync(filePath, finalBuffer);

      return api.sendMessage(
        { body: "", attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => {
          try { fs.unlinkSync(filePath); } catch (e) {}
        },
        event.messageID
      );

    } catch (err) {
      console.log("Uptime error:", err);
      return api.sendMessage("❌ Error creating uptime image.", event.threadID, event.messageID);
    }
  }
};
