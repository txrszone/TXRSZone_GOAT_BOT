const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "notice",
    aliases: ["notify", "noti"],
    version: "16.0.0",
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
      return api.sendMessage(`❌ Usage: notice <message>\nExample: notice Hello everyone!\nOr reply to a message with attachments`, event.threadID, event.messageID);
    }

    let userText = args.join(" ");
    if (!userText && event.messageReply?.body) {
      userText = event.messageReply.body;
    }
    
    const adminName = await usersData.getName(event.senderID) || "Admin";
    const contentText = !userText ? "Only file attached" : userText;
    
    const notificationMessage = `𝗡𝗢𝗧𝗜𝗖𝗘 𝗙𝗥𝗢𝗠 𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡 ‼️
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
                console.log(`✅ Found: ${thread.name}`);
              }
            } catch (err) {
              console.log(`❌ Error: ${thread.threadID}`);
            }
          }
        }
        nextCursor = threadList.length === 100 ? threadList[threadList.length - 1].threadID : null;
        hasMore = threadList.length === 100;
      }
    } catch (err) {
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      return api.sendMessage(`❌ Failed to fetch groups: ${err.message}`, event.threadID);
    }

    const total = allGroups.length;
    try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}

    if (total === 0) {
      return api.sendMessage(`❌ No groups found where bot is a member.`, event.threadID);
    }

    await api.sendMessage(`📤 Sending to ${total} groups...`, event.threadID);

    let success = 0;
    let failed = [];

    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.id;
      const groupName = group.name;

      try {
        const sentMsg = await api.sendMessage(formMessage, tid);
        
        global.GoatBot.onReply.set(sentMsg.messageID, {
          name: "notice",
          adminThread: event.threadID,
          groupName: groupName,
          groupId: tid,
          adminId: event.senderID
        });
        
        success++;
        console.log(`✅ [${i+1}/${total}] ${groupName}`);
      } catch (err) {
        failed.push(groupName);
        console.error(`❌ [${i+1}/${total}] ${groupName}: ${err.message}`);
      }
      
      if (i < total - 1) await new Promise(r => setTimeout(r, DELAY));
      
      if ((i + 1) % PROGRESS_INTERVAL === 0 || i === total - 1) {
        try {
          await api.sendMessage(`📊 ${i+1}/${total}\n✅ ${success}\n❌ ${failed.length}`, event.threadID);
        } catch(e) {}
      }
    }

    let report = `✅ NOTICE SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0) {
      report += `\n\nFailed:\n${failed.slice(0,10).join("\n")}`;
    }
    await api.sendMessage(report, event.threadID);
  },

  onReply: async ({ args, event, api, message, Reply, usersData }) => {
    const senderName = await usersData.getName(event.senderID);
    const attachmentStreams = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));

    // ✅ report.js এর মতো: ইউজার রিপ্লাই দিলে অ্যাডমিনের কাছে যাবে
    if (!Reply.userThread) {
      const userReplyMsg = `📝 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗨𝘀𝗲𝗿:
━━━━━━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲: ${senderName}
🆔 𝗜𝗗: ${event.senderID}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${Reply.groupName}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁:
${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐮𝐬𝐞𝐫`;

      const userForm = {
        body: userReplyMsg,
        attachment: attachmentStreams,
        mentions: [{ id: event.senderID, tag: senderName }]
      };

      const sentMsg = await api.sendMessage(userForm, Reply.adminThread);
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        name: "notice",
        adminThread: Reply.adminThread,
        userThread: event.threadID,
        groupId: Reply.groupId,
        groupName: Reply.groupName,
        userId: event.senderID,
        userName: senderName,
        adminId: Reply.adminId
      });
      
      message.reply("✅ Your reply has been sent to admin!");
      
    } else {
      // ✅ অ্যাডমিন রিপ্লাই করছে - report.js এর মতো রিপ্লাই হিসেবে যাবে (ইউজারের "helo" মেসেজের রিপ্লাই হিসেবে)
      const adminReplyMsg = `📝 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗔𝗱𝗺𝗶𝗻:
━━━━━━━━━━━━━━━━━━━━
👤 𝗔𝗱𝗺𝗶𝗻: ${senderName}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁:
${args.join(" ")}

━━━━━━━━━━━━━━━━━━━━
📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧`;

      const adminForm = {
        body: adminReplyMsg,
        attachment: attachmentStreams,
        mentions: [{ id: event.senderID, tag: senderName }]
      };

      // 🔥 রিপ্লাই হিসেবে পাঠানো (ইউজারের আসল মেসেজের রিপ্লাই হিসেবে)
      await api.sendMessage(adminForm, Reply.userThread, event.messageReply?.messageID);
      message.reply(`✅ Reply sent to user in group: ${Reply.groupName}`);
    }
  }
};
