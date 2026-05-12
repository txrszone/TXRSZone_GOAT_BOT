module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "2.0",
    author: "Omor TE",
    countDown: 3,
    role: 0,
    shortDescription: "Check bot ping",
    longDescription: "Displays the current ping of the bot's system",
    category: "info",
    guide: "{p}ping"
  },

  onStart: async function ({ message }) {
    const startTime = Date.now();
    
    // একটি মেসেজ রিপ্লাই
    const msg = await message.reply("🏓 Calculating ping...");
    
    const ping = Date.now() - startTime;
    
    // স্ট্যাটাস ডিটারমিন
    let status = "";
    let emoji = "";
    
    if (ping < 100) {
      status = "Excellent";
      emoji = "🚀";
    } else if (ping < 200) {
      status = "Good";
      emoji = "💚";
    } else if (ping < 300) {
      status = "Slow";
      emoji = "⚠️";
    } else {
      status = "Very Slow";
      emoji = "🐌";
    }
    
    // মেসেজ এডিট করে রেজাল্ট দেখানো (Goat Bot-এ editMessage কাজ করে কিনা চেক করুন)
    try {
      await api.editMessage(`🏓 **Pong!**\n━━━━━━━━━━━━━━\n📡 Ping: ${ping}ms\n⚡ Status: ${emoji} ${status}\n━━━━━━━━━━━━━━\n⏱️ ${new Date().toLocaleTimeString()}`, msg.messageID);
    } catch(e) {
      // editMessage না কাজ করলে নতুন মেসেজ
      await message.reply(`🏓 **Pong!**\n━━━━━━━━━━━━━━\n📡 Ping: ${ping}ms\n⚡ Status: ${emoji} ${status}`);
    }
  }
};
