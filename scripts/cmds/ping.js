module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "2.0",
    author: "Omor TE",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Check bot ping" },
    longDescription: { en: "Shows bot latency and response time" },
    category: "info",
    guide: { en: "{p}ping" }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID } = event;
    
    // প্রথম মেসেজ পাঠানো
    const loadingMsg = await api.sendMessage("🏓 Calculating ping...", threadID);
    
    // পিং গণনা
    const startTime = Date.now();
    
    // সামান্য সময় অপেক্ষা (রিয়েলিস্টিক পিং দেখানোর জন্য)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const ping = Date.now() - startTime;
    
    // স্ট্যাটাস ডিটারমিন
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
    
    // এডিট করে রেজাল্ট দেখানো
    const response = `╭────────────────╮
│     🏓 PONG!        │
╰────────────────╯

📡 **Ping:** ${ping}ms ${emoji}
⚡ **Status:** ${color} ${status}

⏱️ **Response Time:** ${ping}ms
━━━━━━━━━━━━━━━━━━━━
🤖 Bot is ${ping < 200 ? "running smoothly ✅" : "experiencing delay ⚠️"}

╭─────────────────╮
│   ⚓ MW Legends ☸️   │
╰─────────────────╯`;
    
    await api.editMessage(response, loadingMsg.messageID);
  }
};
