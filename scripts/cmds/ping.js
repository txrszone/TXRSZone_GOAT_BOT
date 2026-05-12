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
    guide: "{p}ping"
  },

  onStart: async function ({ message }) {
    const start = Date.now();
    
    // পিং ক্যালকুলেট করার পর সরাসরি মেসেজ
    const ping = Date.now() - start;
    
    let emoji = "";
    if (ping < 100) emoji = "🚀 Excellent";
    else if (ping < 200) emoji = "💚 Good";
    else if (ping < 300) emoji = "⚠️ Slow";
    else emoji = "🐌 Very Slow";
    
    await message.reply(`🏓 **Pong!**\n━━━━━━━━━━━━━━\n📡 Ping: ${ping}ms\n⚡ Status: ${emoji}`);
  }
};
