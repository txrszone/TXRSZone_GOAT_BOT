const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "2.0.0",
    author: "NTKhang (Converted by OMOR TE)",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice from admin to all chat groups",
    category: "owner",
    guide: "{pn} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const delayPerGroup = 1500; // 🔥 1.5 সেকেন্ড ডিলে (পূর্বে 250ms ছিল)
    
    if (!args[0]) {
      return message.reply("❌ Please enter the message you want to send to all groups");
    }
    
    const confirmMsg = await message.reply("⏳ Fetching group list...");
    
    try {
      // 🔥 সব গ্রুপের তালিকা (পেজিনেশন সহ)
      let allThreads = [];
      let cursor = null;
      
      do {
        const threadList = await api.getThreadList(100, cursor, ["INBOX"]);
        const groups = threadList.filter(item => item.isGroup === true && item.threadID != event.threadID);
        allThreads.push(...groups);
        cursor = threadList.length === 100 ? threadList[threadList.length - 1].threadID : null;
      } while (cursor);
      
      const allThreadID = allThreads.map(item => item.threadID);
      
      await api.unsendMessage(confirmMsg.messageID);
      await message.reply(`📤 Sending notice to ${allThreadID.length} groups...\n⏱️ Estimated time: ${Math.ceil(allThreadID.length * delayPerGroup / 1000)} seconds`);
      
      const formSend = {
        body: `📢 **NOTICE FROM ADMIN** 📢\n━━━━━━━━━━━━━━━━━━━━\n${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`,
        attachment: await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])])
      };
      
      let sendSuccess = 0;
      const sendError = [];
      
      // 🔥 ব্যাচ আকারে পাঠানো (একসাথে 5-5 করে)
      const batchSize = 5;
      for (let i = 0; i < allThreadID.length; i += batchSize) {
        const batch = allThreadID.slice(i, i + batchSize);
        
        for (const tid of batch) {
          try {
            await api.sendMessage(formSend, tid);
            sendSuccess++;
            await new Promise(resolve => setTimeout(resolve, delayPerGroup));
          } catch (e) {
            sendError.push(tid);
            console.error(`Failed to send to ${tid}:`, e.message);
          }
        }
        
        // 🔥 ব্যাচ শেষে 5 সেকেন্ড বিরতি
        if (i + batchSize < allThreadID.length) {
          await message.reply(`📊 Progress: ${sendSuccess}/${allThreadID.length} groups sent...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      await message.reply(`✅ **NOTICE SENT!**\n━━━━━━━━━━━━━━━━━━━━\n📬 Successful: ${sendSuccess} groups\n❌ Failed: ${sendError.length} groups${sendError.length > 0 ? `\n\n⚠️ Failed IDs (first 10):\n${sendError.slice(0, 10).join("\n")}` : ""}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      
    } catch (error) {
      console.error("Notice error:", error);
      message.reply(`❌ Error: ${error.message}\n💡 Try sending to fewer groups or increase delay.`);
    }
  }
};
