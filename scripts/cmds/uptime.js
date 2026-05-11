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
      // আসল Ping পরিমাপের জন্য API কলের আগে সময় নেওয়া
      const startTime = performance.now();

      const currentDate = moment().format("DD/MM/YYYY");

      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptimeText = `${h}h ${m}m ${s}s`;

      // CPU Usage (pidusage ছাড়া)
      const cpuUsage = (os.loadavg()[0] * 10).toFixed(1);

      const osType = os.type();
      const osRelease = os.release();
      const osText = `${osType} ${osRelease}`;

      function __lock(a) {
        return Buffer.from(a, "base64").toString("utf8");
      }

      // ✅ আপনার দেওয়া নতুন ব্যাকগ্রাউন্ড ইমেজ লিংক (Base64 না করলেও চলে)
      const backgroundUrl = "https://i.postimg.cc/vBSQw5Nq/liquify-fluid-color-banner-background-free-vector.jpg";
      const __B = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      const infoLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ...ms`,      // টেম্প মান, পরে আসল Ping বসবে
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : •-Omor TE-•`
      ];

      const lineColors = [
        "#ff4b4b",
        "#00ffcc",
        "#ffd93d",
        "#4b7bff",
        "#ff6bff",
        "#00ff7f"
      ];

      ctx.font = "48px Sans-serif";
      ctx.lineWidth = 3;

      let posY = __C.height / 2 - 80;
      const posX = 50;

      for (let i = 0; i < infoLines.length; i++) {
        const line = infoLines[i];
        const color = lineColors[i % lineColors.length];

        ctx.fillStyle = color;
        ctx.strokeStyle = "black";
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;

        ctx.strokeText(line, posX, posY);
        ctx.fillText(line, posX, posY);

        posY += 55;
      }

      ctx.shadowBlur = 0;

      // আবার Ping নির্ণয় করা হলো (পুরো অপারেশন শেষে)
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      
      // Ping আপডেট করতে পুরো ইমেজটা আবার আঁকতে হবে, তাই আগের লাইন 'Ping   : ...ms' কে নতুন দিয়ে বসাই
      // তবে এই মুহূর্তে পুরো ইমেজ রি-ড্র না করলে আমরা ping সঠিকভাবে দেখাতে পারি।
      // সেজন্য নিচে ফাইনাল PNG ব্যানারে Ping টেক্সট বসিয়ে পাঠাবো।
      
      // আসলে আমরা Ping লেখার আগেই startTime নিয়েছিলাম, তাই এবার দ্বিতীয়বার context update করে Ping বসানো সহজ নয়।
      // তাই পুরনো canvas ড্রয়িং পুনরায় করা ভাল। কিন্তু যেহেতু আপনি কাছে আসল কোড যথাসম্ভব অপরিবর্তিত চান,
      // আমরা Ping কে মেসেজের বডি হিসেবে আলাদা করে দিতে পারি। তবে আপনার নিয়ম অনুযায়ী ইমেজের ভিতরেই তা দেখাতে হবে।
      
      // নিচে একটু ফাঁকি: আমরা পুরো প্রক্রিয়া আবার শুরু করি Ping সঠিক রাখতে। 
      // বাস্তবে Goat Bot-এ বেশিরভাগ কমান্ড Ping দেখায় এভাবেই।
      
      // এটা দ্বিতীয়বার ড্রয়িং করছে, কিন্তু সময়ের সূক্ষ্ম ব্যবধানও কাজ করবে।
      
      // ... দ্বিতীয়বার ড্রইং হলো এখন ping মানসহ
      const canvasFinal = createCanvas(__C.width, __C.height);
      const ctxFinal = canvasFinal.getContext("2d");
      ctxFinal.drawImage(__C, 0, 0, __C.width, __C.height);

      const finalLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ${ping}ms`,
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : •-Omor TE-•`
      ];

      let yPos = __C.height / 2 - 80;
      for (let i = 0; i < finalLines.length; i++) {
        ctxFinal.fillStyle = lineColors[i % lineColors.length];
        ctxFinal.strokeStyle = "black";
        ctxFinal.shadowColor = lineColors[i % lineColors.length];
        ctxFinal.shadowBlur = 25;
        ctxFinal.strokeText(finalLines[i], posX, yPos);
        ctxFinal.fillText(finalLines[i], posX, yPos);
        yPos += 55;
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
        {
          body: "",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
        },
        event.messageID
      );

    } catch (err) {
      console.log("Uptime error:", err);
      return api.sendMessage(
        "❌ Error creating uptime image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
