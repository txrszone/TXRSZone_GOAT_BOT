const { getStreamsFromAttachment } = global.utils;
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "6.0.0",
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
⚓ 𝐌𝐖 𝐋𝐞𝐠𝐞𝐧𝐝𝐬 𝐁𝐨𝐭 ⚡
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

    const confirmMsg = await message.reply(`⏳ Fetching group list...`);

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
        const formSend = { body: notificationMessage };
        
        if (tempFiles.length) {
          const streams = tempFiles.map(file => fs.createReadStream(file));
          formSend.attachment = streams;
        }

        const sentMsg = await api.sendMessage(formSend, tid);
        
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

    // 🧹 Cleanup temp files
    for (const file of tempFiles) {
      try { fs.unlinkSync(file); } catch(e) {}
    }

    let report = `✅ NOTIFICATION SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await message.reply(report);
  },

  onReply: async function ({ api, event, Users, role }) {
    const { threadID, messageID, senderID, body, attachments } = event;
    
    const replyData = global.GoatBot.onReply.get(messageID);
    if (!replyData) return;
    
    // ✅ শুধুমাত্র বট এডমিন বা যিনি নোটিশ পাঠিয়েছেন তারা রিপ্লাই করতে পারবেন
    const isAuthorized = (role === 2) || (senderID === replyData.author);
    
    if (!isAuthorized) {
      return api.sendMessage(`❌ Only bot admin can reply to this notification!`, threadID, messageID);
    }
    
    const { adminThread } = replyData;
    
    const msg = `📩 𝗥𝗲𝗽𝗹𝘆 𝗳𝗿𝗼𝗺 𝗔𝗱𝗺𝗶𝗻 📩
━━━━━━━━━━━━━━━━━━━━
👤 𝗔𝗱𝗺𝗶𝗻: ${(await Users.getNameUser(senderID))}
⏰ 𝗧𝗶𝗺𝗲: ${moment().tz("Asia/Dhaka").format("HH:mm:ss || DD/MM/YYYY")}

📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${attachments.length ? "Only file attached" : body || "No text"}

━━━━━━━━━━━━━━━━━━━━
⚓ 𝐌𝐖 𝐋𝐞𝐠𝐞𝐧𝐝𝐬 𝐁𝐨𝐭 ⚡`;
    
    let messageData = { body: msg };
    if (attachments.length) {
      try {
        const streams = await getStreamsFromAttachment(attachments);
        messageData.attachment = streams;
      } catch(e) {}
    }
    
    await api.sendMessage(messageData, adminThread);
    api.sendMessage(`✅ Reply sent to admin's notification!`, threadID);
  }
};
