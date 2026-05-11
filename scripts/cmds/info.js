const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Bot & Owner Info",
    longDescription: "Show bot system information",
    guide: "{pn} info",
    category: "info"
  },

  onStart: async function ({ message, event, users, threads, api }) {
    const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment().tz("Asia/Dhaka").format("DD/MM/YYYY");

    // ইউজার এবং গ্রুপ কাউন্ট বের করার চেষ্টা
    let userCount = "N/A";
    let threadCount = "N/A";

    try {
      // মেথড ১: গ্লোবাল ডাটা থেকে
      if (global.data && global.data.allUserID) {
        userCount = global.data.allUserID.length;
      }
      if (global.data && global.data.allThreadID) {
        threadCount = global.data.allThreadID.length;
      }
    } catch(e) {}

    try {
      // মেথড ২: api থেকে (যদি সাপোর্ট করে)
      if (userCount === "N/A") {
        const allUsers = await api.getThreadList(1000, null, ["INBOX"]);
        const uniqueUsers = new Set();
        allUsers.forEach(thread => {
          if (thread.userInfo) {
            thread.userInfo.forEach(user => uniqueUsers.add(user.id));
          }
        });
        userCount = uniqueUsers.size;
      }
    } catch(e) {}

    try {
      if (threadCount === "N/A") {
        const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
        threadCount = allThreads.length;
      }
    } catch(e) {}

    const imageLinks = [
      "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg",
      "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg",
      "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg",
      "https://i.postimg.cc/MT84479j/Hitube-Bt4-Wyjgo-WZ-2025-05-26-10-05-58.jpg",
      "https://i.postimg.cc/YS8YKk3f/received-395252956651820.jpg",
      "https://i.postimg.cc/0N5ZJVXn/a844a740b33eba79b486744759914953-1.jpg"
    ];

    const chosenUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    const textMsg = `
🌟 MW LEGENDS BOT 🌟
━━━━━━━━━━━━━━━━

🤖 Bot: MW Legends
👑 Owner: Omor T.E
🌍 Country: Bangladesh 🇧🇩
🎮 Game: Modern Warships ⚓

📘 FB: fb.com/Omor.TE.16016
💬 Discord: discord.gg/PQN4P6qSrM

📊 STATISTICS
├ 👥 Users: ${userCount}
└ 💬 Groups: ${threadCount}

📅 ${date} | 🕒 ${time}

✨ Thanks for using ✨
🏴‍☠️ MW Legends ⚓
━━━━━━━━━━━━━━━━
    `;

    try {
      const response = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      response.data.path = `info_${Date.now()}.jpg`;

      await message.reply({
        body: textMsg,
        attachment: response.data
      });
    } catch (err) {
      message.reply(textMsg);
    }
  }
};
