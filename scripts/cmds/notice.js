const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "4.0.0",
    author: "NTKhang (Fixed by OMOR TE)",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice to all groups safely",
    category: "owner",
    guide: "{pn} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const DELAY = 5000; // 5 seconds between groups
    
    if (!args[0]) {
      return message.reply(`❌ **NOTICE**\n━━━━━━━━━━━━━━━━━━━━\n📌 Use: notice <message>\n📝 Example: notice Hello!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    // Prepare message once
    const noticeText = `📢 **NOTICE FROM ADMIN** 📢\n━━━━━━━━━━━━━━━━━━━━\n${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;
    let attachments = [];
    try {
      attachments = await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])]);
    } catch (err) {}
    
    const formSend = { body: noticeText };
    if (attachments.length) formSend.attachment = attachments;
    
    // Get ALL groups (not just admin)
    let allGroups = [];
    let cursor = null;
    let hasMore = true;
    
    const confirmMsg = await message.reply("⏳ Fetching group list...");
    
    try {
      while (hasMore) {
        const list = await api.getThreadList(100, cursor, ["INBOX"]);
        const groups = list.filter(t => t.isGroup === true && t.threadID !== event.threadID);
        allGroups.push(...groups);
        cursor = list.length === 100 ? list[list.length - 1].threadID : null;
        hasMore = list.length === 100;
      }
    } catch (err) {
      await api.unsendMessage(confirmMsg.messageID);
      return message.reply(`❌ Failed to fetch groups: ${err.message}`);
    }
    
    const total = allGroups.length;
    await api.unsendMessage(confirmMsg.messageID);
    
    if (total === 0) {
      return message.reply("❌ No groups found.");
    }
    
    await message.reply(`📤 Sending to ${total} groups...\n⏱️ Estimated time: ${Math.ceil(total * DELAY / 1000)}s`);
    
    let success = 0;
    let failed = [];
    let skipped = [];
    
    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.threadID;
      const groupName = group.name || `Group ${i+1}`;
      
      try {
        // Try to send message
        await api.sendMessage(formSend, tid);
        success++;
        console.log(`✅ [${i+1}/${total}] Sent to ${groupName} (${tid})`);
      } catch (err) {
        // Check if error is due to bot not having permission to send
        if (err.message && (err.message.includes("not a member") || err.message.includes("can't send"))) {
          skipped.push({ id: tid, name: groupName, reason: "Bot not member or can't send" });
          console.log(`⚠️ [${i+1}/${total}] Skipped ${groupName}: ${err.message}`);
        } else {
          failed.push({ id: tid, name: groupName, error: err.message });
          console.error(`❌ [${i+1}/${total}] Failed ${groupName}: ${err.message}`);
        }
      }
      
      // Delay before next (except last)
      if (i < total - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }
    
    // Report
    let report = `✅ **NOTICE COMPLETED**\n━━━━━━━━━━━━━━━━━━━━\n📬 Sent: ${success}\n❌ Failed: ${failed.length}\n⚠️ Skipped: ${skipped.length}\n━━━━━━━━━━━━━━━━━━━━`;
    
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\n❌ Failed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    if (skipped.length > 0 && skipped.length <= 10) {
      report += `\n\n⚠️ Skipped groups (bot may not be member):\n${skipped.map(s => `• ${s.name} (${s.id})`).join("\n")}`;
    }
    report += `\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;
    
    await message.reply(report);
  }
};
