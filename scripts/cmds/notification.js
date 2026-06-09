const { getStreamsFromAttachment } = global.utils;
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "5.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notification to all groups",
    longDescription: "Send notification only to groups where bot is member",
    category: "owner",
    guide: "{p}{n} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const DELAY = 5000;
    const PROGRESS_INTERVAL = 5;

    if (!args[0] && !event.messageReply?.attachments?.length && !event.attachments?.length) {
      return message.reply(`❌ Usage: notification <message>\nExample: notification Hello everyone!\nOr reply to a message with attachments`);
    }

    const fullTime = moment().tz("Asia/Dhaka").format("HH:mm:ss || DD/MM/YYYY");
    
    let userText = args.join(" ");
    if (!userText && event.messageReply?.body) {
      userText = event.messageReply.body;
    }
    
    const notificationMessage = `𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗙𝗥𝗢𝗠 𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡 ‼️
━━━━━━━━━━━━━━━━━━━━
👤 𝗔𝗗𝗠𝗜𝗡: ${(await api.getUserInfo(event.senderID))[event.senderID]?.name || "Admin"}
📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${userText || "Only file attached"}

⏰ 𝗧𝗶𝗺𝗲: ${fullTime}
━━━━━━━━━━━━━━━━━━━━
 ⚓ MW Legends Bot ⚡
━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;

    // 📁 Handle attachments
    const allAttachments = [...event.attachments, ...(event.messageReply?.attachments || [])];
    let messageData;
    
    if (allAttachments.length) {
      try {
        const streams = await getStreamsFromAttachment(allAttachments);
        messageData = {
          body: notificationMessage,
          attachment: streams
        };
      } catch (err) {
        console.error("Attachment error:", err);
        messageData = notificationMessage;
      }
    } else {
      messageData = notificationMessage;
    }

    // 📋 Get all groups where bot is member
    let allGroups = [];
    let cursor = null;
    let hasMore = true;
    const botID = api.getCurrentUserID();

    const confirmMsg = await message.reply(`⏳ Sending notification to all groups...`);

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
      await api.unsendMessage(confirmMsg.messageID);
      return message.reply(`❌ Failed to fetch groups: ${err.message}`);
    }

    const total = allGroups.length;
    await api.unsendMessage(confirmMsg.messageID);

    if (total === 0) {
      return message.reply(`❌ No groups found where bot is a member.`);
    }

    await message.reply(`📤 Sending notification to ${total} groups...`);

    let success = 0;
    let failed = [];
    let sentCount = 0;

    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.threadID;
      const groupName = group.name || `Group ${i+1}`;

      try {
        const formSend = typeof messageData === 'string' ? { body: messageData } : messageData;
        
        const sentMsg = await api.sendMessage(formSend, tid);
        
        // ✅ রিপ্লাই হ্যান্ডলিং এর জন্য অনরিপ্লাই সেট করা
        global.GoatBot.onReply.set(sentMsg.messageID, {
          commandName: "notification",
          author: event.senderID,
          adminThread: event.threadID,
          type: "userReply",
          messageID: sentMsg.messageID
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
          await message.reply(`📊 Progress: ${sentCount}/${total}\n✅ Sent: ${success}\n❌ Failed: ${failed.length}`);
        } catch(e) {}
      }

      if (i < total - 1) await new Promise(r => setTimeout(r, DELAY));
    }

    let report = `✅ NOTIFICATION SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await message.reply(report);
  },

  onReply: async function ({ api, event, Users, Threads }) {
    const { threadID, messageID, senderID, body, attachments } = event;
    
    const replyData = global.GoatBot.onReply.get(messageID);
    if (!replyData) return;
    
    const { author, adminThread, type } = replyData;
    
    if (type === "userReply") {
      const msg = `📩 𝗥𝗲𝗽𝗹𝘆 𝗙𝗿𝗼𝗺 𝗨𝘀𝗲𝗿 📩
━━━━━━━━━━━━━━━━━━━━
👤 𝗨𝘀𝗲𝗿: ${(await Users.getNameUser(senderID))}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${(await Threads.getData(threadID)).threadInfo?.threadName || "Unknown"}
⏰ 𝗧𝗶𝗺𝗲: ${moment().tz("Asia/Dhaka").format("HH:mm:ss || DD/MM/YYYY")}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${attachments.length ? "Only file attached" : body || "No text"}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to user`;
      
      let messageData;
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData = { body: msg, attachment: streams };
        } catch(e) {
          messageData = msg;
        }
      } else {
        messageData = msg;
      }
      
      const sentMsg = await api.sendMessage(messageData, adminThread);
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "notification",
        author: author,
        userThread: threadID,
        userMessageID: messageID,
        userId: senderID,
        type: "adminReply"
      });
      
      api.sendMessage(`✅ Reply sent to admin successfully!`, threadID);
      
    } else if (type === "adminReply") {
      const { userThread, userId } = replyData;
      
      const msg = `📩 **Reply from Admin** 📩
━━━━━━━━━━━━━━━━━━━━
👤 **Admin:** ${(await Users.getNameUser(senderID))}
⏰ **Time:** ${moment().tz("Asia/Dhaka").format("HH:mm:ss || DD/MM/YYYY")}

📝 **Content:** ${attachments.length ? "Only file attached" : body || "No text"}

━━━━━━━━━━━━━━━━━━━━
📌 Reply to this message to respond to admin`;
      
      let messageData;
      if (attachments.length) {
        try {
          const streams = await getStreamsFromAttachment(attachments);
          messageData = { body: msg, attachment: streams };
        } catch(e) {
          messageData = msg;
        }
      } else {
        messageData = msg;
      }
      
      const sentMsg = await api.sendMessage(messageData, userThread);
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "notification",
        author: author,
        adminThread: adminThread,
        userId: userId,
        type: "userReply"
      });
      
      api.sendMessage(`✅ Reply sent to user successfully!`, threadID);
    }
  }
};
