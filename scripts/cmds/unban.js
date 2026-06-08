const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "unban",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 2,
    shortDescription: "Unban users or groups",
    longDescription: "Remove bans for users, groups, admins, etc.",
    category: "admin",
    guide: {
      en: "{p}unban admin - Unban all bot admins\n{p}unban ndh - Unban all supporters\n{p}unban allbox - Unban all banned groups\n{p}unban box - Unban current group\n{p}unban alluser - Unban all banned users\n{p}unban allqtv - Unban all group admins on server\n{p}unban qtv - Unban all admins in current group\n{p}unban member - Unban all members in current group\n{p}unban member @tag - Unban tagged user"
    }
  },

  onStart: async function ({ args, message, event, api, usersData, threadsData }) {
    const { threadID, messageID, senderID } = event;
    
    const credit = "OMOR TE";
    
    switch (args[0]) {
      case 'admin':
      case 'ad': {
        const listAdmin = global.config.ADMINBOT || [];
        for (const idad of listAdmin) {
          try {
            const userData = await usersData.get(idad);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(idad, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(idad);
          } catch(e) {}
        }
        return message.reply("✅ Unbanned for all Admin Bot");
      }

      case 'ndh': {
        const listNDH = global.config.NDH || [];
        for (const idNDH of listNDH) {
          try {
            const userData = await usersData.get(idNDH);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(idNDH, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(idNDH);
          } catch(e) {}
        }
        return message.reply("✅ Unbanned for all Supporters");
      }

      case 'allbox':
      case 'allthread': {
        const threadBanned = global.data.threadBanned?.keys() || [];
        for (const singleThread of threadBanned) {
          try {
            const threadData = await threadsData.get(singleThread);
            if (threadData && threadData.data) {
              threadData.data.banned = 0;
              threadData.data.reason = null;
              threadData.data.dateAdded = null;
              await threadsData.set(singleThread, threadData);
            }
            if (global.data.threadBanned) global.data.threadBanned.delete(singleThread);
          } catch(e) {}
        }
        return message.reply("✅ Unbanned for all groups on the server");
      }

      case 'box':
      case 'thread': {
        try {
          const threadData = await threadsData.get(threadID);
          if (threadData && threadData.data) {
            threadData.data.banned = 0;
            threadData.data.reason = null;
            threadData.data.dateAdded = null;
            await threadsData.set(threadID, threadData);
          }
          if (global.data.threadBanned) global.data.threadBanned.delete(threadID);
        } catch(e) {}
        return message.reply("✅ Unbanned for this group");
      }

      case 'allmember':
      case 'alluser': {
        const userBanned = global.data.userBanned?.keys() || [];
        for (const singleUser of userBanned) {
          try {
            const userData = await usersData.get(singleUser);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(singleUser, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(singleUser);
          } catch(e) {}
        }
        return message.reply("✅ Unbanned for all users on the server");
      }

      case 'qtvall':
      case 'Qtvall':
      case 'allqtv': {
        const allThreads = await threadsData.getAll();
        for (const thread of allThreads) {
          try {
            const threadInfo = thread.threadInfo;
            if (threadInfo && threadInfo.adminIDs) {
              for (const admin of threadInfo.adminIDs) {
                const userData = await usersData.get(admin.id);
                if (userData && userData.data) {
                  userData.data.banned = 0;
                  userData.data.reason = null;
                  userData.data.dateAdded = null;
                  await usersData.set(admin.id, userData);
                }
                if (global.data.userBanned) global.data.userBanned.delete(admin.id);
              }
            }
          } catch(e) {}
        }
        return message.reply("✅ Unbanned for all Group Admins on the server");
      }

      case 'qtv':
      case 'Qtv': {
        try {
          const threadInfo = await api.getThreadInfo(threadID);
          const listQTV = threadInfo.adminIDs || [];
          for (const admin of listQTV) {
            const userData = await usersData.get(admin.id);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(admin.id, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(admin.id);
          }
        } catch(e) {}
        return message.reply("✅ Unbanned for all Admins of this group");
      }

      case 'member':
      case 'mb':
      case 'user': {
        if (!args[1]) {
          // Unban all members in current group
          const listMember = event.participantIDs || [];
          for (const idMember of listMember) {
            try {
              const userData = await usersData.get(idMember);
              if (userData && userData.data) {
                userData.data.banned = 0;
                userData.data.reason = null;
                userData.data.dateAdded = null;
                await usersData.set(idMember, userData);
              }
              if (global.data.userBanned) global.data.userBanned.delete(idMember);
            } catch(e) {}
          }
          return message.reply("✅ Unbanned for all members of this group");
        }
        
        // Unban tagged user
        if (args.join().indexOf('@') !== -1) {
          const mentions = Object.keys(event.mentions);
          if (mentions.length === 0) {
            return message.reply("❌ Please tag the user to unban");
          }
          const userID = mentions[0];
          const nameUser = await usersData.getName(userID);
          try {
            const userData = await usersData.get(userID);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(userID, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(userID);
          } catch(e) {}
          return message.reply(`✅ User ${nameUser} ban has been removed`);
        }
        
        // Unban by UID
        const uid = args[1];
        if (uid && !isNaN(uid)) {
          try {
            const nameUser = await usersData.getName(uid);
            const userData = await usersData.get(uid);
            if (userData && userData.data) {
              userData.data.banned = 0;
              userData.data.reason = null;
              userData.data.dateAdded = null;
              await usersData.set(uid, userData);
            }
            if (global.data.userBanned) global.data.userBanned.delete(uid);
            return message.reply(`✅ User ${nameUser || uid} ban has been removed`);
          } catch(e) {}
        }
        
        return message.reply(`❌ Invalid command. Use: unban member @tag or unban member <uid>`);
      }

      default: {
        const helpMsg = `「 UNBAN CONFIG 」\n◆━━━━━━━━━━━◆\n\n🔹 unban admin - Remove ban for all Admin Bot\n🔹 unban ndh - Unban all Supporters\n🔹 unban allbox - Unban all groups on server\n🔹 unban box - Unban current group\n🔹 unban alluser - Unban all users on server\n🔹 unban allqtv - Unban all group admins on server\n🔹 unban qtv - Unban all admins in current group\n🔹 unban member - Unban all members in current group\n🔹 unban member @tag - Unban tagged user`;
        return message.reply(helpMsg);
      }
    }
  }
};
