const { getStreamsFromAttachment } = global.utils;
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "12.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notification to all groups",
    longDescription: "Send notification only to groups where bot is member",
    category: "owner",
    guide: "{p}{n} <message>"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const DELAY = 5000;
    const PROGRESS_INTERVAL = 5;

    if (!args[0] && !event.messageReply?.attachments?.length && !event.attachments?.length) {
      return api.sendMessage(`❌ Usage: notification <message>\nExample: notification Hello everyone!\nOr reply to a message with attachments`, event.threadID, event.messageID);
    }

    let userText = args.join(" ");
    if (!userText && event.messageReply?.body) {
      userText = event.messageReply.body;
    }
    
    const adminName = await usersData.getName(event.senderID) || "Admin";
    const contentText = !userText ? "Only file attached" : userText;
    
    const notificationMessage = `📢 NOTIFICATION FROM BOT ADMIN 📢
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${adminName}
📝 Content: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;

    // 📁 Handle attachments
    const tempFiles = [];
    const allAttachments = [...event.attachments, ...(event.messageReply?.attachments || [])];

    if (allAttachments.length) {
      try {
        const streams = await getStreamsFromAttachment(allAttachments);
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        for (let i = 0; i < streams.length; i++) {
          const attach = allAttachments[i];
          let ext = "file";
          
          if (attach.type === "photo") {
            ext = attach.url?.toLowerCase().includes('.gif') ? "gif" : "jpg";
          } else if (attach.type === "video") ext = "mp4";
          else if (attach.type === "audio") ext = "mp3";
          else if (attach.type === "animated_image") ext = "gif";
          else if (attach.type === "file") {
            const fileName = attach.filename || attach.name || `file_${i}`;
            const fileExt = fileName.split('.').pop();
            ext = fileExt || "file";
          }
          
          const filePath = path.join(cacheDir, `notification_${Date.now()}_${i}.${ext}`);
          const writer = fs.createWriteStream(filePath);
          await new Promise((resolve, reject) => {
            streams[i].pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
          tempFiles.push(filePath);
        }
      } catch (err) {
        console.error("Attachment error:", err);
      }
    }

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

    await api.sendMessage(`📤 Sending notification to ${total} groups...`, event.threadID);

    let success = 0;
    let failed = [];
    let sentCount = 0;

    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.threadID;
      const groupName = group.name || `Group ${i+1}`;

      try {
        const formSend = { body: notificationMessage };
        
        if (tempFiles.length) {
          const streams = tempFiles.map(file => fs.createReadStream(file));
          formSend.attachment = streams;
        }

        const sentMsg = await api.sendMessage(formSend, tid);
        
        global.GoatBot.onReply.set(sentMsg.messageID, {
          commandName: "notification",
          authorId: event.senderID,
          adminThread: event.threadID,
          groupName: groupName,
          groupId: tid
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

    for (const file of tempFiles) {
      try { fs.unlinkSync(file); } catch(e) {}
    }

    let report = `✅ NOTIFICATION SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await api.sendMessage(report, event.threadID);
  },

  onReply: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID, body, attachments } = event;
    
    const replyData = global.GoatBot.onReply.get(messageID);
    if (!replyData) return;
    
    const { adminThread, groupId, groupName, authorId } = replyData;
    
    const userInfo = await usersData.getName(senderID);
    const groupInfo = groupName || "Unknown Group";
    
    let contentText = "No text";
    if (body && body.trim()) {
      contentText = body.trim();
    } else if (attachments.length) {
      contentText = "Sent an attachment";
    }
    
    if (senderID === authorId) {
      const adminReplyMsg = `📩 Reply from Admin 📩
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${userInfo}
📝 Content: ${contentText}

`;
      
      let messageData = { body: adminReplyMsg };
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData.attachment = streams;
        } catch(e) {}
      }
      
      await api.sendMessage(messageData, groupId);
      api.sendMessage(`✅ Reply sent to group: ${groupInfo}`, threadID);
      global.GoatBot.onReply.delete(messageID);
      
    } else {
      const userReplyMsg = `📩 Reply from User 📩
━━━━━━━━━━━━━━━━━━━━
👤 User: ${userInfo}
🏘️ Group: ${groupInfo}

📝 Content: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to user`;
      
      let messageData = { body: userReplyMsg };
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData.attachment = streams;
        } catch(e) {}
      }
      
      const sentMsg = await api.sendMessage(messageData, adminThread);
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "notification",
        authorId: authorId,
        adminThread: threadID,
        groupId: groupId,
        groupName: groupInfo,
        userId: senderID,
        userName: userInfo
      });
      
      api.sendMessage(`✅ Your reply has been sent to admin!`, threadID);
      global.GoatBot.onReply.delete(messageID);
    }
  }
};
