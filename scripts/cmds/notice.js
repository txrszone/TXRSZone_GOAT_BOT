const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "14.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice only to groups where bot is member",
    category: "owner",
    guide: "{p}{n} <message>"
  },

  onStart: async function ({ api, event, args, usersData, threadsData, commandName }) {
    const DELAY = 5000;
    const PROGRESS_INTERVAL = 5;

    if (!args[0] && !event.messageReply?.attachments?.length && !event.attachments?.length) {
      return api.sendMessage(`❌ Usage: notice <message>\nExample: notice Hello everyone!\nOr reply to a message with attachments`, event.threadID, event.messageID);
    }

    let userText = args.join(" ");
    if (!userText && event.messageReply?.body) {
      userText = event.messageReply.body;
    }
    
    const adminName = await usersData.getName(event.senderID) || "Admin";
    const contentText = !userText ? "Only file attached" : userText;
    
    const notificationMessage = `NOTICE FROM BOT ADMIN ‼️
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${adminName}
📝 Content: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;

    // 📁 Handle attachments
    let attachmentStreams = [];
    const allAttachments = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => mediaTypes.includes(item.type));

    if (allAttachments.length) {
      try {
        attachmentStreams = await getStreamsFromAttachment(allAttachments);
      } catch (err) {
        console.error("Attachment error:", err);
      }
    }

    const formMessage = {
      body: notificationMessage,
      attachment: attachmentStreams
    };

    // 📋 Get all groups where bot is member
    let allGroups = [];
    let cursor = null;
    let hasMore = true;
    const botID = api.getCurrentUserID();

    const confirmMsg = await api.sendMessage(`⏳ Fetching group list...`, event.threadID);

    try {
      while (hasMore) {
        const list = await api.getThreadList(100, cursor, ["INBOX"]);
        const potentialGroups = list.filter(t => t.isGroup === true && t.threadID !== event.threadID);
        
        for (const group of potentialGroups) {
          try {
            const info = await api.getThreadInfo(group.threadID);
            if (info.participantIDs && info.participantIDs.includes(botID)) {
              allGroups.push(group);
            }
          } catch (err) {}
        }
        cursor = list.length === 100 ? list[list.length - 1].threadID : null;
        hasMore = list.length === 100;
      }
    } catch (err) {
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      return api.sendMessage(`❌ Failed to fetch groups: ${err.message}`, event.threadID, event.messageID);
    }

    const total = allGroups.length;
    try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}

    if (total === 0) {
      return api.sendMessage(`❌ No groups found where bot is a member.`, event.threadID, event.messageID);
    }

    await api.sendMessage(`📤 Sending notice to ${total} groups...`, event.threadID);

    let success = 0;
    let failed = [];
    let sentCount = 0;

    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.threadID;
      const groupName = group.name || `Group ${i+1}`;

      try {
        const messageSend = await api.sendMessage(formMessage, tid);
        
        global.GoatBot.onReply.set(messageSend.messageID, {
          commandName: commandName,
          adminThread: event.threadID,
          groupName: groupName,
          groupId: tid,
          authorId: event.senderID,
          type: "userCallAdmin"
        });
        
        success++;
        console.log(`✅ [${i+1}/${total}] Sent to ${groupName}`);
      } catch (err) {
        failed.push({ id: tid, name: groupName, error: err.message });
        console.error(`❌ [${i+1}/${total}] Failed ${groupName}: ${err.message}`);
      }
      sentCount++;

      if (sentCount % PROGRESS_INTERVAL === 0 || i === total - 1) {
        try {
          await api.sendMessage(`📊 Progress: ${sentCount}/${total}\n✅ Sent: ${success}\n❌ Failed: ${failed.length}`, event.threadID);
        } catch(e) {}
      }

      if (i < total - 1) await new Promise(r => setTimeout(r, DELAY));
    }

    let report = `✅ NOTICE SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await api.sendMessage(report, event.threadID);
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName }) => {
    const { type, adminThread, groupId, groupName, authorId, userThread, userId, userName } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const attachmentStreams = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));

    // ✅ ১ম ধাপ: ইউজার রিপ্লাই করছে (নোটিশ মেসেজে রিপ্লাই)
    if (type === "userCallAdmin") {
      const userReplyMsg = `📩 Reply from User 📩
━━━━━━━━━━━━━━━━━━━━
👤 User: ${senderName}
🏘️ Group: ${groupName}

📝 Content: ${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to user`;

      const formMessage = {
        body: userReplyMsg,
        attachment: attachmentStreams,
        mentions: [{ id: event.senderID, tag: senderName }]
      };

      const messageSend = await api.sendMessage(formMessage, adminThread);
      
      global.GoatBot.onReply.set(messageSend.messageID, {
        commandName: commandName,
        userThread: event.threadID,
        groupId: groupId,
        groupName: groupName,
        userId: event.senderID,
        userName: senderName,
        authorId: authorId,
        type: "adminReply"
      });
      
      message.reply("✅ Your reply has been sent to admin!");
      
    } 
    // ✅ ২য় ধাপ: অ্যাডমিন ইউজারকে রিপ্লাই করছে
    else if (type === "adminReply") {
      const adminReplyMsg = `📩 Reply from Admin 📩
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${senderName}
👥 Replying to: ${userName || "User"}

📝 Content: ${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;

      const formMessage = {
        body: adminReplyMsg,
        attachment: attachmentStreams,
        mentions: [{ id: event.senderID, tag: senderName }]
      };

      const messageSend = await api.sendMessage(formMessage, userThread);
      
      // ✅ গুরুত্বপূর্ণ: ইউজার আবার রিপ্লাই করতে পারবে (কথা চলতে থাকবে)
      global.GoatBot.onReply.set(messageSend.messageID, {
        commandName: commandName,
        adminThread: adminThread,
        groupId: groupId,
        groupName: groupName,
        userId: userId,
        userName: userName,
        authorId: authorId,
        type: "userCallAdmin"
      });
      
      message.reply(`✅ Reply sent to user in group: ${groupName}`);
    }
  }
};
