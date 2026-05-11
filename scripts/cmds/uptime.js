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

      // ✅ আপনার দেওয়া নতুন ইমেজ লিংক
      const backgroundUrl = "https://i.postimg.cc/RFzSTwDQ/images-(4).jpg";
      const __B = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      // ✅ বড় ফন্ট সাইজ (পুরনো 48px → 56px)
      const fontSize = 56;
      ctx.font = `${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctx.lineWidth = 4;

      const lineColors = [
        "#ff4b4b", "#00ffcc", "#ffd93d",
        "#4b7bff", "#ff6bff", "#00ff7f"
      ];

      let posY = __C.height / 2 - 80;
      const posX = 60; // একটু ডানদিকে সরানো হয়েছে পড়ার সুবিধার্থে

      // টেক্সট ড্র করার ফাংশন (পিং ছাড়া প্রথমবার)
      function drawLines(linesArray) {
        let tempY = posY;
        for (let i = 0; i < linesArray.length; i++) {
          const line = linesArray[i];
          const color = lineColors[i % lineColors.length];

          ctx.fillStyle = color;
          ctx.strokeStyle = "black";
          ctx.shadowColor = color;
          ctx.shadowBlur = 25;

          ctx.strokeText(line, posX, tempY);
          ctx.fillText(line, posX, tempY);

          tempY += 65; // লাইনের ফাঁকা বাড়ানো হয়েছে
        }
      }

      // প্রথমবার আপাতত পিং ছাড়া আঁকা
      const tempLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ...ms`,
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : •-Omor TE-•`
      ];
      drawLines(tempLines);

      ctx.shadowBlur = 0;

      // আসল পিং নির্ণয়
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);

      // দ্বিতীয়বার ছবি এঁকে সঠিক পিং বসানো
      const canvasFinal = createCanvas(__C.width, __C.height);
      const ctxFinal = canvasFinal.getContext("2d");
      ctxFinal.drawImage(__C, 0, 0, __C.width, __C.height);
      ctxFinal.font = `${fontSize}px "Segoe UI", "Poppins", "Sans-serif"`;
      ctxFinal.lineWidth = 4;

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
        ctxFinal.shadowBlur = 25;
        ctxFinal.strokeText(finalLines[i], posX, finalY);
        ctxFinal.fillText(finalLines[i], posX, finalY);
        finalY += 65;
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
