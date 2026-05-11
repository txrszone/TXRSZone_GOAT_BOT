const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "mwmeme",
    version: "10.5.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Get Random Modern Warships Meme",
    longDescription: "Send random Modern Warships meme image or video",
    guide: "{pn} mwmeme",
    category: "fun"
  },

  onStart: async function ({ message, args }) {
    const imageLinks = [
      "https://i.postimg.cc/MKVXGB2K/FB-IMG-1748861685846.jpg",
      "https://i.postimg.cc/mDgTNc5M/FB-IMG-1748861673272.jpg",
      "https://i.postimg.cc/wvwTS5m0/FB-IMG-1748861651145.jpg"
      // add all your image links here
    ];

    const videoLinks = [
      "https://github.com/user-attachments/assets/3ef93d9d-ccde-4203-aba0-884416cb5711"
      // add all your video links here
    ];

    const isVideo = Math.random() < 0.5 && videoLinks.length > 0;
    const chosenUrl = isVideo 
      ? videoLinks[Math.floor(Math.random() * videoLinks.length)]
      : imageLinks[Math.floor(Math.random() * imageLinks.length)];

    try {
      const response = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      response.data.path = `mwmeme_${Date.now()}${isVideo ? '.mp4' : '.jpg'}`;

      await message.reply({
        body: "🖼️ Here's your Modern Warships meme!",
        attachment: response.data
      });
    } catch (err) {
      message.reply("⚠️ Failed to fetch meme. Try again later.");
    }
  }
};
