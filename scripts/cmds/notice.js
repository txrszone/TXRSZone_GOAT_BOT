const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "3.0.0",
    author: "NTKhang (Fixed by OMOR TE)",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice to all groups safely with sequential delay",
    category: "owner",
    guide: "{pn} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const DELAY = 5000; // 5 seconds delay between groups
    
    if (!args[0]) {
      return message.reply(`❌ **NOTICE COMMAND**\n━━━━━━━━━━━━━━━━━━━━\n📌 Use: notice <message>\n📝 Example: notice Hello everyone!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    // Prepare the message and attachments once
    const noticeText = `📢 **NOTICE FROM ADMIN** 📢\n━━━━━━━━━━━━━━━━━━━━\n${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;
    let attachments = [];
    try {
      attachments = await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])]);
    } catch (err) {
      console.error("Attachment error:", err);
    }
    
    const formSend = { body: noticeText };
    if (attachments.length) formSend.attachment = attachments;
    
    // Get all group threads (simpler method)
    let allThreads = [];
    let nextCursor = null;
    let hasMore = true;
    
    const confirmMsg = await message.reply("⏳ Fetching group list...");
    
    try {
      while (hasMore) {
        const threadList = await api.getThreadList(100, nextCursor, ["INBOX"]);
        const groups = threadList.filter(t => t.isGroup === true && t.threadID !== event.threadID);
        allThreads.push(...groups);
        nextCursor = threadList.length === 100 ? threadList[threadList.length - 1].threadID : null;
        hasMore = threadList.length === 100;
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
      await api.unsendMessage(confirmMsg.messageID);
      return message.reply(`❌ Failed to fetch group list: ${err.message}`);
    }
    
    const totalGroups = allThreads.length;
    if (totalGroups === 0) {
      await api.unsendMessage(confirmMsg.messageID);
      return message.reply("❌ No groups found to send notice.");
    }
    
    await api.unsendMessage(confirmMsg.messageID);
    await message.reply(`📤 Sending notice to ${totalGroups} groups...\n⏱️ Estimated time: ${Math.ceil(totalGroups * DELAY / 1000)} seconds`);
    
    let success = 0;
    let failed = [];
    let current = 0;
    
    // Send sequentially
    for (const thread of allThreads) {
      current++;
      const tid = thread.threadID;
      try {
        await api.sendMessage(formSend, tid);
        success++;
        console.log(`✅ [${current}/${totalGroups}] Sent to ${thread.name || tid}`);
      } catch (err) {
        failed.push(tid);
        console.error(`❌ [${current}/${totalGroups}] Failed to send to ${thread.name || tid}: ${err.message}`);
      }
      
      // Delay before next group (except after last)
      if (current < totalGroups) {
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }
    
    // Final report
    let report = `✅ **NOTICE SENT**\n━━━━━━━━━━━━━━━━━━━━\n📬 Successful: ${success}/${totalGroups} groups\n❌ Failed: ${failed.length} groups`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\n⚠️ Failed IDs:\n${failed.join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\n⚠️ First 10 failed IDs:\n${failed.slice(0, 10).join("\n")}\n... and ${failed.length - 10} more`;
    }
    report += `\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;
    
    await message.reply(report);
  }
};
