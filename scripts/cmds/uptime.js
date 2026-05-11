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

      const cpuUsage = (os.loadavg()[0] * 10).toFixed(1);

      const osType = os.type();
      const osRelease = os.release();
      const osText = `${osType} ${osRelease}`;

      // আপনার দেওয়া ছবির লিংক
      const backgroundUrl = "https://i.postimg.cc/RFzSTwDQ/images-(4).jpg";
      const __B = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      // ✅ পারফেক্ট সাইজ: 48px (মাঝারি - খুব বড়ও না, খুব ছোটও না)
      const fontSize = 48;
      ctx.font = `bold ${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctx.lineWidth = 2;

      // ✅ আধুনিক ও চোখধাঁধানো রং (Neon + Pastel মিক্স)
      const lineColors = [
        "#FFD700", // সোনালী (Uptime)
        "#FF6B6B", // লালচে গোলাপি (Ping)
        "#4ECDC4", // টকটকে নীলাভ সবুজ (CPU)
        "#FFE66D", // হালকা সোনালী (OS)
        "#A8E6CF", // পেস্টেল সবুজ (Date)
        "#FF8C94"  // পেস্টেল গোলাপি (Owner)
      ];

      // ব্যাকগ্রাউন্ডে হালকা ছায়া টেক্সটের জন্য
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      let posY = __C.height / 2 - 70;
      const posX = 55;
      const lineHeight = 58;

      function drawLines(linesArray, context, yStart) {
        let tempY = yStart;
        for (let i = 0; i < linesArray.length; i++) {
          const line = linesArray[i];
          const color = lineColors[i % lineColors.length];

          context.fillStyle = color;
          context.strokeStyle = "#000000";
          context.lineWidth = 2;

          // স্ট্রোক (কালো আউটলাইন)
          context.strokeText(line, posX, tempY);
          // ফিল (কালারফুল)
          context.fillText(line, posX, tempY);

          tempY += lineHeight;
        }
      }

      // টেম্প লাইন
      const tempLines = [
        `⚡ Uptime : ${uptimeText}`,
        `📡 Ping   : ...ms`,
        `💻 CPU    : ${cpuUsage}%`,
        `🖥️ OS     : ${osText}`,
        `📅 Date   : ${currentDate}`,
        `👑 Owner  : •-Omor TE-•`
      ];
      drawLines(tempLines, ctx, posY);

      // আসল পিং
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);

      // ফাইনাল ক্যানভাস
      const canvasFinal = createCanvas(__C.width, __C.height);
      const ctxFinal = canvasFinal.getContext("2d");
      ctxFinal.drawImage(__C, 0, 0, __C.width, __C.height);
      ctxFinal.font = `bold ${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctxFinal.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctxFinal.shadowBlur = 8;
      ctxFinal.shadowOffsetX = 2;
      ctxFinal.shadowOffsetY = 2;

      const finalLines = [
        `⚡ Uptime : ${uptimeText}`,
        `📡 Ping   : ${ping}ms`,
        `💻 CPU    : ${cpuUsage}%`,
        `🖥️ OS     : ${osText}`,
        `📅 Date   : ${currentDate}`,
        `👑 Owner  : •-Omor TE-•`
      ];

      let finalY = posY;
      for (let i = 0; i < finalLines.length; i++) {
        ctxFinal.fillStyle = lineColors[i % lineColors.length];
        ctxFinal.strokeStyle = "#000000";
        ctxFinal.lineWidth = 2;
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
