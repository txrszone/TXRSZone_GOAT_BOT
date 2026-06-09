const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "15.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notification to all groups",
    longDescription: "Send notification only to groups where bot is member",
    category: "owner",
    guide: "{p}{n} <message>"
  },

  onStart: async function ({ api, event, args, usersData, threadsData, commandName }) {
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
    
    const notificationMessage = `𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗙𝗥𝗢𝗠 𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡 ‼️
━━━━━━━━━━━━━━━━━━━━
👤 𝗔𝗱𝗺𝗶𝗻: ${adminName}
📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${contentText}

━━━━━━━━━━━━━━━━━━━━
📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧`;

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
    let nextCursor = null;
    let hasMore = true;
    const botID = api.getCurrentUserID();

    const confirmMsg = await api.sendMessage(`⏳ Fetching group list...`, event.threadID);

    try {
      while (hasMore) {
        const threadList = await api.getThreadList(100, nextCursor, ["INBOX"]);
        
        for (const thread of threadList) {
          if (thread.isGroup === true && thread.threadID !== event.threadID) {
            try {
              const threadInfo = await api.getThreadInfo(thread.threadID);
              if (threadInfo.participantIDs && threadInfo.participantIDs.includes(botID)) {
                allGroups.push({
                  id: thread.threadID,
                  name: thread.name || `Group ${allGroups.length + 1}`
                });
                console.log(`📋 Found group: ${thread.name} (${thread.threadID})`);
              }
            } catch (err) {
              console.log(`⚠️ Error checking group ${thread.threadID}: ${err.message}`);
            }
          }
        }
        
        nextCursor = threadList.length === 100 ? threadList[threadList.length - 1].threadID : null;
        hasMore = threadList.length === 100;
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
      const tid = group.id;
      const groupName = group.name;

      try {
        const messageSend = await api.sendMessage(formMessage, tid);
        
        global.GoatBot.onReply.set(messageSend.messageID, {
          commandName: commandName,
          adminThread: event.threadID,
          groupName: groupName,
          groupId: tid,
          adminId: event.senderID,
          type: "userCallAdmin"
        });
        
        success++;
        console.log(`✅ [${i+1}/${total}] Sent to ${groupName} (${tid})`);
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

    let report = `✅ NOTIFICATION SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await api.sendMessage(report, event.threadID);
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName }) => {
    const { type, adminThread, groupId, groupName, adminId, userThread, userId, userName } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const attachmentStreams = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));

    if (type === "userCallAdmin") {
      const msg = `📝 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗨𝘀𝗲𝗿:
━━━━━━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲: ${senderName}
🆔 𝗜𝗗: ${event.senderID}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${groupName}
🆔 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: ${groupId}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁:
${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐮𝐬𝐞𝐫`;

      const formMessage = {
        body: msg,
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
        adminId: adminId,
        type: "adminReply"
      });
      
      message.reply("✅ Your reply has been sent to admin!");
      
    } else if (type === "adminReply") {
      const { userThread, userId, userName } = Reply;
      
      const msg = `📝 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗔𝗱𝗺𝗶𝗻:
━━━━━━━━━━━━━━━━━━━━
👤 𝗔𝗱𝗺𝗶𝗻: ${senderName}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁:
${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧`;

      const formMessage = {
        body: msg,
        attachment: attachmentStreams,
        mentions: [{ id: event.senderID, tag: senderName }]
      };

      await api.sendMessage(formMessage, userThread);
      
      message.reply(`✅ Reply sent to user ${userName || userId}`);
    }
  }
};
