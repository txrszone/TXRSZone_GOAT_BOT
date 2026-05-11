const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "admin",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Show Owner Info",
    longDescription: "Display bot owner information",
    guide: "{pn} admin",
    category: "info"
  },

  onStart: async function ({ message, event }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    // আপনার আসল সব লিংক (কিছুতেই কাটিনি)
    const images = [
      "https://graph.facebook.com/100071151280531/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662",
      "https://i.postimg.cc/L6kG8BS4/received-1875128426597909.png",
      "https://i.postimg.cc/7ZxdGGP3/received-1258556092530363.png"
    ];
    
    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "admin_random.png");

    // Cache directory create
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const textMsg = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🪪      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞      : Omor T.E
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : ...
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : ...
┃ 🎂 𝐀𝐠𝐞       : ...
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : ...
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : ...
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : ..., 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 📶 Discord ID Tag : Omor.TE.16016
┃ 📢 Discord Server: https://discord.gg/PQN4P6qSrM
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/Omor.TE.16016
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 SYSTEM 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
    `;

    try {
      // Download image with axios (mwmeme style)
      const response = await axios({
        method: 'get',
        url: randomImg,
        responseType: 'stream'
      });

      response.data.path = `admin_${Date.now()}.png`;

      await message.reply({
        body: textMsg,
        attachment: response.data
      });
    } catch (err) {
      console.error("❌ Image download failed:", err);
      // Image fail holeo text pathano
      message.reply(textMsg);
    }
  }
};
