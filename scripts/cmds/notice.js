const { getStreamsFromAttachment } = global.utils;
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif"],
    version: "3.0.0",
    author: "OMOR TE",
    countDown: 10,
    role: 2,
    shortDescription: "Send notice to all groups",
    longDescription: "Send notice only to groups where bot is member",
    category: "owner",
    guide: "{pn} <message>"
  },

  onStart: async function ({ message, api, event, args }) {
    const DELAY = 5000;
    const PROGRESS_INTERVAL = 5;

    if (!args[0]) {
      return message.reply(`❌ Usage: notice <message>\nExample: notice Hello everyone!`);
    }

    const noticeText = `Notice from bot admin ‼️\n(Don't reply to this message)\n━━━━━━━━━━━━━━━━━━━━\n\n\n${args.join(" ")}`;

    // 📁 Temporary files for attachments (ছবি, ভিডিও, ফাইল সব)
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
          
          // ফাইলের এক্সটেনশন নির্ধারণ
          if (attach.type === "photo") ext = "jpg";
          else if (attach.type === "video") ext = "mp4";
          else if (attach.type === "audio") ext = "mp3";
          else if (attach.type === "file") {
            // ফাইলের নাম থেকে এক্সটেনশন বের করা
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
          tempFiles.push({ path: filePath, type: attach.type, name: attach.filename || attach.name });
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

    let success = 0;
    let failed = [];
    let sentCount = 0;
    let progressSent = false;

    for (let i = 0; i < allGroups.length; i++) {
      const group = allGroups[i];
      const tid = group.threadID;
      const groupName = group.name || `Group ${i+1}`;

      try {
        const formSend = { body: noticeText };
        
        if (tempFiles.length) {
          const streams = tempFiles.map(file => fs.createReadStream(file.path));
          formSend.attachment = streams;
        }

        await api.sendMessage(formSend, tid);
        success++;
        console.log(`✅ [${i+1}/${total}] Sent to ${groupName}`);
      } catch (err) {
        failed.push({ id: tid, name: groupName, error: err.message });
        console.error(`❌ [${i+1}/${total}] Failed ${groupName}: ${err.message}`);
      }
      sentCount++;

      if (sentCount % PROGRESS_INTERVAL === 0 && !progressSent) {
        progressSent = true;
        await message.reply(`📊 Progress: ${sentCount}/${total}\n✅ Sent: ${success}\n❌ Failed: ${failed.length}`);
        await new Promise(r => setTimeout(r, 2000));
        progressSent = false;
      }

      if (i < total - 1) await new Promise(r => setTimeout(r, DELAY));
    }

    // 🧹 Cleanup temp files
    for (const file of tempFiles) {
      try { fs.unlinkSync(file.path); } catch(e) {}
    }

    let report = `✅ NOTICE SENT\n━━━━━━━━━━━━━━━━━━━━\n📬 Success: ${success}/${total}\n❌ Failed: ${failed.length}`;
    if (failed.length > 0 && failed.length <= 10) {
      report += `\n\nFailed groups:\n${failed.map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    } else if (failed.length > 10) {
      report += `\n\nFirst 10 failed:\n${failed.slice(0,10).map(f => `• ${f.name} (${f.id})`).join("\n")}`;
    }
    await message.reply(report);
  }
};
