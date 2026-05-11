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
    category: "info",
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

      // CPU Usage
      const cpuUsage = (os.loadavg()[0] * 10).toFixed(1);

      const osType = os.type();
      const osRelease = os.release();
      const osText = `${osType} ${osRelease}`;

      // আপনার দেওয়া ছবির লিংক
      const backgroundUrl = "https://i.postimg.cc/3wbvnfHP/Polish-20260511-164744529.jpg";
      const __B = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      // ✅ লেখার সাইজ ঠিক করা হয়েছে (40px)
      const fontSize = 40;
      ctx.font = `${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctx.lineWidth = 3;

      const lineColors = [
        "#ff4b4b", "#00ffcc", "#ffd93d",
        "#4b7bff", "#ff6bff", "#00ff7f"
      ];

      let posY = __C.height / 2 - 60;
      const posX = 50;

      function drawLines(linesArray, context, yStart) {
        let tempY = yStart;
        for (let i = 0; i < linesArray.length; i++) {
          const line = linesArray[i];
          const color = lineColors[i % lineColors.length];

          context.fillStyle = color;
          context.strokeStyle = "black";
          context.shadowColor = color;
          context.shadowBlur = 20;

          context.strokeText(line, posX, tempY);
          context.fillText(line, posX, tempY);

          tempY += 50; // লাইনের ফাঁকা
        }
      }

      // টেম্প লাইন (পিং ছাড়া)
      const tempLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ...ms`,
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : •-Omor TE-•`
      ];
      drawLines(tempLines, ctx, posY);
      ctx.shadowBlur = 0;

      // আসল পিং
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);

      // ফাইনাল ক্যানভাস (সঠিক পিং সহ)
      const canvasFinal = createCanvas(__C.width, __C.height);
      const ctxFinal = canvasFinal.getContext("2d");
      ctxFinal.drawImage(__C, 0, 0, __C.width, __C.height);
      ctxFinal.font = `${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctxFinal.lineWidth = 3;

      const finalLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ${ping}ms`,
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : •-Omor TE-•`
      ];

      let finalY = posY;
      for (let i = 0; i < finalLines.length; i++) {
        ctxFinal.fillStyle = lineColors[i % lineColors.length];
        ctxFinal.strokeStyle = "black";
        ctxFinal.shadowColor = lineColors[i % lineColors.length];
        ctxFinal.shadowBlur = 20;
        ctxFinal.strokeText(finalLines[i], posX, finalY);
        ctxFinal.fillText(finalLines[i], posX, finalY);
        finalY += 50;
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
