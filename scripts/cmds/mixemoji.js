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

  onStart: async function ({ message, event, args, api }) {
    if (args.length < 2) {
      return message.reply(`❌ Wrong format!\n📌 Use: mixemoji 😊 😢`);
    }

    const emoji1 = args[0];
    const emoji2 = args[1];
    const threadID = event.threadID;
    const messageID = event.messageID;
    
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `emojimix_${Date.now()}.png`);
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 🔄 স্টেপ 1: ⏳ রিঅ্যাক্ট (ইমেজ আসার আগে)
    try {
      await api.setMessageReaction("⏳", messageID, (err) => {}, true);
    } catch(e) {}

    // 🎨 কনফার্মেশন মেসেজ
    const confirmationMsg = await message.reply(
      `⏳ **Mixing Emojis** ⏳\n━━━━━━━━━━━━━━━━━━━━\n📌 ${emoji1} + ${emoji2}\n⏳ Status: **Generating...**\n━━━━━━━━━━━━━━━━━━━━\n✨ Please wait...`
    );

    try {
      const url = `https://web-api-delta.vercel.app/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
      
      // 🔄 স্টেপ 2: ⌛ রিঅ্যাক্ট (লোড হচ্ছে)
      try {
        await api.setMessageReaction("⌛", messageID, (err) => {}, true);
      } catch(e) {}
      
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      });

      response.data.pipe(fs.createWriteStream(filePath));
      
      response.data.on('end', async () => {
        // 🔄 স্টেপ 3: ✅ রিঅ্যাক্ট (সফল)
        try {
          await api.setMessageReaction("✅", messageID, (err) => {}, true);
        } catch(e) {}
        
        // কনফার্মেশন মেসেজ ডিলিট
        try {
          await api.unsendMessage(confirmationMsg.messageID);
        } catch(e) {}
        
        // মিক্সড ইমোজি পাঠানো
        await message.reply({
          body: `✅ **Mixed Emoji Created!** ✅\n━━━━━━━━━━━━━━━━━━━━\n📌 ${emoji1} + ${emoji2}\n━━━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        });
        
        try { fs.unlinkSync(filePath); } catch(e) {}
      });
      
      response.data.on('error', async () => {
        // 🔄 স্টেপ 3 (error): ⚠️ রিঅ্যাক্ট
        try {
          await api.setMessageReaction("⚠️", messageID, (err) => {}, true);
        } catch(e) {}
        
        try { await api.unsendMessage(confirmationMsg.messageID); } catch(e) {}
        
        message.reply(`⚠️ **Mix Failed!**\n━━━━━━━━━━━━━━━━━━━━\n📌 Can't mix ${emoji1} and ${emoji2}\n💡 Try different emojis!`);
      });
      
    } catch (err) {
      console.error("Mixemoji error:", err);
      
      try { await api.setMessageReaction("⚠️", messageID, (err) => {}, true); } catch(e) {}
      try { await api.unsendMessage(confirmationMsg.messageID); } catch(e) {}
      
      message.reply(`⚠️ **Mix Failed!**\n━━━━━━━━━━━━━━━━━━━━\n📌 Can't mix ${emoji1} and ${emoji2}\n💡 Try different emojis!`);
    }
  }
};
