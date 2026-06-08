module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "2.0",
    author: "Omor TE",
    countDown: 3,
    role: 0,
    shortDescription: "Check bot ping",
    longDescription: "Displays bot ping",
    category: "info",
    guide: "{p}{n}"
  },

  onStart: async function ({ message }) {
    const start = Date.now();
    
    // মেসেজ পাঠানো
    await message.reply("🏓");
    
    const ping = Date.now() - start;
    
    let emoji = "";
    if (ping < 100) emoji = "🚀 Excellent";
    else if (ping < 200) emoji = "💚 Good";
    else if (ping < 300) emoji = "⚠️ Slow";
    else emoji = "🐌 Very Slow";
    
    // আলাদা মেসেজ হিসেবে পিং দেখানো
    await message.reply(`🏓 **Pong!**\n━━━━━━━━━━━━━━\n📡 Ping: ${ping}ms\n⚡ Status: ${emoji}`);
  }
};
