const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "mixemoji",
    version: "2.0.0",
    author: "Omor TE",
    countDown: 0,
    role: 0,
    shortDescription: "Mix emoji",
    longDescription: "Mix two emojis together to create a new emoji",
    guide: "{p}mixemoji 😊 😢",
    category: "image"
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2) {
      return message.reply(`❌ Wrong format!\n📌 Use: ${global.config.PREFIX}mixemoji 😊 😢`);
    }

    const emoji1 = args[0];
    const emoji2 = args[1];
    
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `emojimix_${Date.now()}.png`);
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    try {
      const url = `https://web-api-delta.vercel.app/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
      
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      });

      response.data.pipe(fs.createWriteStream(filePath));
      
      response.data.on('end', () => {
        message.reply({
          body: `🎨 Mixed Emoji 🎨\n📌 ${emoji1} + ${emoji2}`,
          attachment: fs.createReadStream(filePath)
        }).then(() => {
          fs.unlinkSync(filePath);
        }).catch(() => {});
      });
      
      response.data.on('error', () => {
        message.reply(`❌ Can't mix ${emoji1} and ${emoji2}. Try different emojis!`);
      });
      
    } catch (err) {
      console.error("Mixemoji error:", err);
      message.reply(`❌ Can't mix ${emoji1} and ${emoji2}. Try different emojis!`);
    }
  }
};
