const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "2.0.0",
    author: "NTKhang (Modified by OMOR TE)",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice from admin to all box",
    longDescription: "Send notice from admin to all groups with safe delay",
    category: "owner",
    guide: "{pn} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const DELAY_PER_GROUP = 5000; // 🔥 5 সেকেন্ড ডিলে (নিরাপদ)
    
    if (!args[0]) {
      return message.reply(`❌ **NOTICE COMMAND**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: notice <বার্তা>\n📝 উদাহরণ: notice Hello everyone!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    // কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`⏳ সবার জন্য অপেক্ষা করুন গ্রুপ তালিকা আনা হচ্ছে...`);
    
    try {
      // সব গ্রুপের তালিকা (সিরিয়ালি ফেচ)
      let allThreads = [];
      let cursor = null;
      
      do {
        const threadList = await api.getThreadList(100, cursor, ["INBOX"]);
        const groups = threadList.filter(item => item.isGroup === true && item.threadID != event.threadID);
        allThreads.push(...groups);
        cursor = threadList.length === 100 ? threadList[threadList.length - 1].threadID : null;
      } while (cursor);
      
      const allThreadID = allThreads.map(item => item.threadID);
      const totalGroups = allThreadID.length;
      
      await api.unsendMessage(confirmMsg.messageID);
      
      // সময় গণনা
      const estimatedTime = Math.ceil(totalGroups * DELAY_PER_GROUP / 1000);
      const estimatedMinutes = Math.floor(estimatedTime / 60);
      const estimatedSeconds = estimatedTime % 60;
      
      await message.reply(`📢 **নোটিশ পাঠানো শুরু হচ্ছে** 📢
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 মোট গ্রুপ: ${totalGroups} টি
⏱️ প্রতি গ্রুপে: ${DELAY_PER_GROUP / 1000} সেকেন্ড
⏰ আনুমানিক সময়: ${estimatedMinutes} মিনিট ${estimatedSeconds} সেকেন্ড
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ নোটিশ পাঠাতে থাকবে, দয়া করে অপেক্ষা করুন...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      
      const formSend = {
        body: `📢 **নোটিশ ফ্রম অ্যাডমিন** 📢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`,
        attachment: await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])])
      };
      
      let sendSuccess = 0;
      const sendError = [];
      let currentGroup = 0;
      
      // 🔥 সিরিয়ালি পাঠানো (প্রতি গ্রুপে 5 সেকেন্ড ডিলে)
      for (const tid of allThreadID) {
        currentGroup++;
        
        try {
          // গ্রুপের নাম বের করার চেষ্টা
          let groupName = "Unknown";
          try {
            const threadInfo = await api.getThreadInfo(tid);
            groupName = threadInfo.name || threadInfo.threadName || "Unnamed Group";
          } catch(e) {}
          
          // প্রতি 10 গ্রুপে প্রগ্রেস দেখানো
          if (currentGroup % 10 === 0 || currentGroup === totalGroups) {
            await message.reply(`📊 প্রগ্রেস: ${currentGroup}/${totalGroups} গ্রুপ সম্পন্ন...`);
          }
          
          await api.sendMessage(formSend, tid);
          sendSuccess++;
          console.log(`✅ Sent to ${groupName} (${currentGroup}/${totalGroups})`);
          
          // 🔥 5 সেকেন্ড ডিলে (স্প্যাম এড়াতে)
          if (currentGroup < totalGroups) {
            await new Promise(resolve => setTimeout(resolve, DELAY_PER_GROUP));
          }
          
        } catch (e) {
          sendError.push({
            id: tid,
            error: e.message
          });
          console.error(`❌ Failed to send to group ${currentGroup}:`, e.message);
          
          // error হলেও ডিলে নেওয়া (স্প্যাম ডিটেক্ট এড়াতে)
          await new Promise(resolve => setTimeout(resolve, DELAY_PER_GROUP));
        }
      }
      
      // ফাইনাল রিপোর্ট
      let errorText = "";
      if (sendError.length > 0) {
        errorText = `\n\n❌ ব্যর্থ গ্রুপ: ${sendError.length} টি\n`;
        if (sendError.length <= 10) {
          errorText += sendError.map(e => `  • ${e.id}`).join("\n");
        } else {
          errorText += `  • প্রথম 10 টি:\n${sendError.slice(0, 10).map(e => `    ${e.id}`).join("\n")}\n  • ... এবং ${sendError.length - 10} টি বেশি`;
        }
      }
      
      await message.reply(`✅ **নোটিশ পাঠানো সম্পন্ন!** ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 সফল: ${sendSuccess} টি গ্রুপ
❌ ব্যর্থ: ${sendError.length} টি গ্রুপ
⏱️ মোট সময়: ${Math.ceil(currentGroup * DELAY_PER_GROUP / 1000)} সেকেন্ড${errorText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      
    } catch (error) {
      console.error("Notice error:", error);
      message.reply(`❌ এরর: ${error.message}\n💡 একটু পরে আবার চেষ্টা করুন।`);
    }
  }
};
