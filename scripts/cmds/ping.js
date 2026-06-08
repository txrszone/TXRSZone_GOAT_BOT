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
    
    // ✅ একটি API কল বা মেসেজ সেন্ড করার চেষ্টা
    const msg = await message.reply("🏓");
    
    const ping = Date.now() - start;
    
    let emoji = "";
    if (ping < 100) emoji = "🚀 Excellent";
    else if (ping < 200) emoji = "💚 Good";
    else if (ping < 300) emoji = "⚠️ Slow";
    else emoji = "🐌 Very Slow";
    
    await msg.edit(`🏓 **Pong!**\n━━━━━━━━━━━━━━\n📡 Ping: ${ping}ms\n⚡ Status: ${emoji}`);
  }
};
