const { getStreamsFromAttachment } = global.utils;
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "8.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice only to groups where bot is member",
    category: "owner",
    guide: "{p}{n} <message>"
  },

  onStart: async function ({ api, event, args, Users }) {
    const DELAY = 5000;
    const PROGRESS_INTERVAL = 5;

    if (!args[0] && !event.messageReply?.attachments?.length && !event.attachments?.length) {
      return api.sendMessage(`❌ Usage: notice <message>\nExample: notice Hello everyone!\nOr reply to a message with attachments`, event.threadID, event.messageID);
    }

    let userText = args.join(" ");
    if (!userText && event.messageReply?.body) {
      userText = event.messageReply.body;
    }
    
    const adminName = (await Users.getData(event.senderID)).name || "Admin";
    const contentText = !userText ? "Only file attached" : userText;
    
    const notificationMessage = `📢 NOTICE FROM BOT ADMIN 📢
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${adminName}
📝 Content: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;

    // 📁 Handle attachments (save to temp files for reuse)
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
          
          const filePath = path.join(cacheDir, `notice_${Date.now()}_${i}.${ext}`);
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

    const confirmMsg = await api.sendMessage(`⏳ Sending notice to all groups...`, event.threadID);

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
        const formSend = { body: notificationMessage };
        
        if (tempFiles.length) {
          const streams = tempFiles.map(file => fs.createReadStream(file));
          formSend.attachment = streams;
        }

        // ✅ মেসেজ পাঠানো এবং রিপ্লাই হ্যান্ডলিং
        api.sendMessage(formSend, tid, (err, info) => {
          if (!err && info) {
            // ✅ GoatBot-এর জন্য অনরিপ্লাই সেট করা
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "notice",
              author: event.senderID,
              adminThread: event.threadID,
              groupName: groupName,
              groupId: tid,
              type: "userReply"
            });
          }
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

    // 🧹 Cleanup temp files
    for (const file of tempFiles) {
      try { fs.unlinkSync(file); } catch(e) {}
    }

    let report = `✅ NOTICE SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await api.sendMessage(report, event.threadID);
  },

  onReply: async function ({ api, event, Users, Threads }) {
    const { threadID, messageID, senderID, body, attachments } = event;
    
    const replyData = global.GoatBot.onReply.get(messageID);
    if (!replyData) return;
    
    const { adminThread, type, groupName, author } = replyData;
    
    if (type === "userReply") {
      // ✅ সবাই রিপ্লাই করতে পারবে - কোন role চেক নেই
      const userInfo = await Users.getNameUser(senderID);
      const groupInfo = groupName || (await Threads.getData(threadID)).threadInfo?.threadName || "Unknown Group";
      
      let contentText = "No text";
      if (body && body.trim()) {
        contentText = body.trim();
      } else if (attachments.length) {
        contentText = "Sent an attachment (photo/video/file)";
      }
      
      const msg = `📩 Reply from User 📩
━━━━━━━━━━━━━━━━━━━━
👤 User: ${userInfo}
🏘️ Group: ${groupInfo}

📝 Content: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to user`;
      
      let messageData = { body: msg };
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData.attachment = streams;
        } catch(e) {}
      }
      
      const sentMsg = await api.sendMessage(messageData, adminThread);
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "notice",
        author: author,
        userThread: threadID,
        userId: senderID,
        userName: userInfo,
        groupName: groupInfo,
        type: "adminReply"
      });
      
      api.sendMessage(`✅ Reply sent to admin!`, threadID);
      
    } else if (type === "adminReply") {
      // ✅ অ্যাডমিন ইউজারকে রিপ্লাই করছে
      const { userThread, userId, userName, groupName } = replyData;
      
      let contentText = "No text";
      if (body && body.trim()) {
        contentText = body.trim();
      } else if (attachments.length) {
        contentText = "Sent an attachment (photo/video/file)";
      }
      
      const adminName = await Users.getNameUser(senderID);
      
      const msg = `📩 Reply from Admin 📩
━━━━━━━━━━━━━━━━━━━━
👤 Admin: ${adminName}
👥 Replying to: ${userName}
🏘️ Group: ${groupName}

📝 Content: ${contentText}

`;
      
      let messageData = { body: msg };
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData.attachment = streams;
        } catch(e) {}
      }
      
      await api.sendMessage(messageData, userThread);
      
      api.sendMessage(`✅ Reply sent to user!`, threadID);
    }
  }
};
