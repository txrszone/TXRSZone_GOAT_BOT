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
    category: "fun"
  },

  onStart: async function ({ message, event, args, api }) {
    if (args.length < 2) {
      return message.reply(`❌ Wrong format!\n📌 Use: mixemoji 😊 😢`);
    }

    const emoji1 = args[0];
    const emoji2 = args[1];
    const threadID = event.threadID;
    
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `emojimix_${Date.now()}.png`);
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 🎨 কনফার্মেশন মেসেজ
    const loadingEmojis = ["🔄", "⏳", "🎨", "✨", "🔮", "⚡"];
    const randomLoadEmoji = loadingEmojis[Math.floor(Math.random() * loadingEmojis.length)];
    
    const confirmationMsg = await message.reply(
      `${randomLoadEmoji} **Mixing Emojis** ${randomLoadEmoji}\n━━━━━━━━━━━━━━━━━━━━\n📌 ${emoji1} + ${emoji2}\n⏳ Status: **Generating...**\n━━━━━━━━━━━━━━━━━━━━\n✨ Please wait, your mixed emoji is being created!`
    );

    try {
      const url = `https://web-api-delta.vercel.app/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
      
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      });

      response.data.pipe(fs.createWriteStream(filePath));
      
      response.data.on('end', async () => {
        // 🗑️ কনফার্মেশন মেসেজ ডিলিট
        try {
          await api.unsendMessage(confirmationMsg.messageID);
        } catch(e) {}
        
        // ✅ মিক্সড ইমোজি পাঠানো
        const successEmojis = ["🎉", "✨", "🌟", "💫", "⭐", "🎨"];
        const randomSuccessEmoji = successEmojis[Math.floor(Math.random() * successEmojis.length)];
        
        await message.reply({
          body: `${randomSuccessEmoji} **Mixed Emoji Created!** ${randomSuccessEmoji}\n━━━━━━━━━━━━━━━━━━━━\n📌 ${emoji1} + ${emoji2}\n━━━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        });
        
        // ক্যাশ ফাইল ডিলিট
        try {
          fs.unlinkSync(filePath);
        } catch(e) {}
      });
      
      response.data.on('error', async () => {
        // error হলে কনফার্মেশন মেসেজ ডিলিট
        try {
          await api.unsendMessage(confirmationMsg.messageID);
        } catch(e) {}
        
        message.reply(`❌ **Mix Failed!**\n━━━━━━━━━━━━━━━━━━━━\n📌 Can't mix ${emoji1} and ${emoji2}\n💡 Try different emojis!`);
      });
      
    } catch (err) {
      console.error("Mixemoji error:", err);
      try {
        await api.unsendMessage(confirmationMsg.messageID);
      } catch(e) {}
      
      message.reply(`❌ **Mix Failed!**\n━━━━━━━━━━━━━━━━━━━━\n📌 Can't mix ${emoji1} and ${emoji2}\n💡 Try different emojis!`);
    }
  }
};
