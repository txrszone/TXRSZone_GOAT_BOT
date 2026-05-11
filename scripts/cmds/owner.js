const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 4,
    role: 0,
    shortDescription: "Show Owner Info",
    longDescription: "Display bot owner information with image",
    guide: "{p}owner",
    category: "info"
  },

  onStart: async function ({ message, args }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    // Random image from this array
    const images = [
      "https://graph.facebook.com/100071151280531/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662",
      "https://i.postimg.cc/L6kG8BS4/received-1875128426597909.png",
      "https://i.postimg.cc/7ZxdGGP3/received-1258556092530363.png"
    ];

    const chosenUrl = images[Math.floor(Math.random() * images.length)];

    const textMsg = `
┏━━━━━━━━━━━━━━━━━━━┓
┃   ⚠️ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ⚠️      
┣━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞     : Omor T.E
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : --
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧   : --
┃ 🎂 𝐀𝐠𝐞      : --
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧   : --
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : --
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : ..., Bangladesh
┣━━━━━━━━━━━━━━━━━━━┫
┃ 📶 Discord : Omor.TE.16016
┃ 📢 Server  : discord.gg/PQN4P6qSrM
┃ 🌐 Facebook: fb.com/Omor.TE.16016
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 Time: ${time}
┗━━━━━━━━━━━━━━━━━━━┛
    `;

    try {
      const response = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      response.data.path = `owner_${Date.now()}.png`;

      await message.reply({
        body: textMsg,
        attachment: response.data
      });
    } catch (err) {
      console.error("Image download error:", err);
      // If image fails, send only text
      message.reply(textMsg);
    }
  }
};
