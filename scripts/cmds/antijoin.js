const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "antijoin",
    version: "1.0.0",
    author: "Omor TE",
    countDown: 0,
    role: 1,
    shortDescription: "Anti-join System",
    longDescription: "Turn on/off anti-join feature",
    guide: "{p}antijoin - Check status\n{p}antijoin on - Turn on\n{p}antijoin off - Turn off",
    category: "system"
  },

  onStart: async function ({ message, event, threads, api, args }) {
    const action = args[0]?.toLowerCase();
    
    // Check bot admin
    const info = await api.getThreadInfo(event.threadID);
    const isBotAdmin = info.adminIDs.some(item => item.id == api.getCurrentUserID());
    
    if (!isBotAdmin) {
      return message.reply("❌ Bot needs to be admin in this group!");
    }

    // Get current data
    const threadData = await threads.getData(event.threadID);
    const data = threadData?.data || {};
    const currentStatus = (typeof data.newMember != "undefined" && data.newMember == true);
    
    // If no argument or "status" - show status
    if (!action || action === "status") {
      const statusIcon = currentStatus ? "🟢" : "🔴";
      const statusText = currentStatus ? "ON" : "OFF";
      const actionText = currentStatus ? "BLOCKED 🚫" : "ALLOWED ✅";
      
      return message.reply(`
╔═══════════════════╗
║ 🔒 ANTI-JOIN STATUS  ║
╚═══════════════════╝

━━━━━━━━━━━━━━━━━━━━━━

${statusIcon} Status: ${statusText}

📌 New members: ${actionText}

━━━━━━━━━━━━━━━━━━━━━━

💡 Commands:
   🔘 antijoin on  - Turn ON
   🔘 antijoin off - Turn OFF
      `);
    }
    
    // Handle on/off
    let newStatus;
    let statusText;
    let actionMsg;
    
    if (action === "on") {
      data.newMember = true;
      newStatus = true;
      statusText = "ON 🟢";
      actionMsg = "ENABLED";
    } else if (action === "off") {
      data.newMember = false;
      newStatus = false;
      statusText = "OFF 🔴";
      actionMsg = "DISABLED";
    } else {
      // Invalid argument
      return message.reply(`❌ Invalid command!\n\n📌 Use:\n🔘 antijoin - Check status\n🔘 antijoin on - Turn ON\n🔘 antijoin off - Turn OFF`);
    }
    
    // Save to database
    await threads.setData(event.threadID, { data });
    if (global.data?.threadData) {
      global.data.threadData.set(parseInt(event.threadID), data);
    }
    
    message.reply(`
╔═══════════════════╗
║ 🔒 ANTI-JOIN SYSTEM  ║
╚═══════════════════╝

━━━━━━━━━━━━━━━━━━━━━━

✅ Status: ${statusText}

🛡️ Anti-join ${actionMsg} successfully!

━━━━━━━━━━━━━━━━━━━━━━

📌 New members will be 
   ${newStatus ? "BLOCKED 🚫" : "ALLOWED ✅"}

━━━━━━━━━━━━━━━━━━━━━━

💡 Type "antijoin" to check status
    `);
  }
};
