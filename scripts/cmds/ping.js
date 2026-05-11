module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "2.0",
    author: "Omor TE",
    role: 0,
    shortDescription: {
      en: "Displays the current ping of the bot's system."
    },
    longDescription: {
      en: "Displays the current ping of the bot's system."
    },
    category: "System",
    guide: {
      en: "Use {p}ping to check the current ping of the bot's system."
    }
  },
  
  onStart: async function ({ api, event, message }) {
    const startTime = Date.now();
    
    // একটি ডামি মেসেজ send করে (কিন্তু আসলে send না করে)
    // API কল করার সময় পরিমাপ করা
    const msg = await message.reply("🏓 Calculating ping...");
    
    const endTime = Date.now();
    const ping = endTime - startTime;
    
    // আগের মেসেজ এডিট করে পিং দেখানো
    await api.editMessage(`🏓 Pong!\n━━━━━━━━━━━━━━\n📡 Bot Ping: ${ping}ms\n⚡ Status: ${ping < 100 ? "Excellent 🟢" : ping < 200 ? "Good 🟡" : "Slow 🔴"}`, msg.messageID);
  }
};
