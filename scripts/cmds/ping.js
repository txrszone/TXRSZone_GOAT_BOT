module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "3.0",
    author: "Omor TE",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Check bot ping" },
    longDescription: { en: "Shows bot latency and response time" },
    category: "info",
    guide: { en: "{p}{n}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;
    
    const startTime = Date.now();
    
    // প্রথম মেসেজ পাঠানো
    const loadingMsg = await api.sendMessage("🏓", threadID);
    
    const ping = Date.now() - startTime;
    
    let emoji = "";
    let status = "";
    let color = "";
    
    if (ping < 100) { 
      emoji = "🚀"; 
      status = "Excellent";
      color = "🟢";
    } else if (ping < 200) { 
      emoji = "💚"; 
      status = "Good";
      color = "🟡";
    } else if (ping < 300) { 
      emoji = "⚠️"; 
      status = "Slow";
      color = "🟠";
    } else { 
      emoji = "🐌"; 
      status = "Very Slow";
      color = "🔴";
    }
    
    const response = `╭────────────────╮
│            🏓 PONG!               │
╰────────────────╯

📡 **Ping:** ${ping}ms ${emoji}
⚡ **Status:** ${color} ${status}

⏱️ **Response Time:** ${ping}ms
━━━━━━━━━━━━━━━━━━━━
🤖 Bot is ${ping < 200 ? "running smoothly ✅" : "experiencing delay ⚠️"}

╭─────────────────╮
│     ⚓ MW Legends ☸️        │
╰─────────────────╯`;
    
    // এডিট করার চেষ্টা
    try {
      await api.editMessage(response, loadingMsg.messageID);
    } catch(e) {
      // এডিট না কাজ করলে নতুন মেসেজ
      await api.sendMessage(response, threadID);
      try { api.unsendMessage(loadingMsg.messageID); } catch(e) {}
    }
  }
};
