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
    longDescription: "Display bot owner information with image",
    guide: "{pn} admin",
    category: "info"
  },

  onStart: async function ({ message, event }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    const imageLinks = [
      "https://i.postimg.cc/L6kG8BS4/received-1875128426597909.png",
      "https://graph.facebook.com/100071151280531/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662",
      "https://i.postimg.cc/7ZxdGGP3/received-1258556092530363.png"
    ];

    const chosenUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    const textMessage = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   🌟 OWNER INFO 🪪      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 Name      : Omor T.E
┃ 🚹 Gender    : Male
┃ 🏡 Address   : Bangladesh
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 📶 Discord   : Omor.TE.16016
┃ 🌐 Facebook  : fb.com/Omor.TE.16016
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 Time      : ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
    `;

    try {
      // First send the image
      const imageResponse = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      imageResponse.data.path = `admin_${Date.now()}.jpg`;

      await message.reply({
        body: textMessage,
        attachment: imageResponse.data
      });
    } catch (err) {
      // If image fails, send only text
      message.reply(textMessage);
    }
  }
};
