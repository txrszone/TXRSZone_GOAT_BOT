module.exports = {
  config: {
    name: "antiout",
    version: "1.1",
    author: "OMOR TE",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Prevent members from leaving the group"
    },
    longDescription: {
      en: "Enable/disable anti-out feature that automatically adds back members who leave the group"
    },
    category: "admin",
    guide: {
      en: "{p}antiout - Check status\n{p}antiout on - Enable\n{p}antiout off - Disable"
    }
  },

  langs: {
    en: {
      turnedOn: "🛡️ Anti-out feature has been ENABLED for this group",
      turnedOff: "🛡️ Anti-out feature has been DISABLED for this group",
      statusOn: "🛡️ Anti-out feature is currently ENABLED for this group",
      statusOff: "🛡️ Anti-out feature is currently DISABLED for this group",
      missingPermission: "❌ Sorry boss! I couldn't add the user back.\nUser %1 might have blocked me or doesn't have messenger option enabled.",
      addedBack: "⚠️ Attention %1!\nThis group belongs to my boss!\nYou need admin clearance to leave this group!"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    // ✅ শুধু স্ট্যাটাস চেক (কোনো আর্গুমেন্ট না থাকলে)
    if (!args[0] || (args[0] !== "on" && args[0] !== "off")) {
      const antioutStatus = await threadsData.get(event.threadID, "data.antiout");
      if (antioutStatus === true) {
        return message.reply(getLang("statusOn"));
      } else {
        return message.reply(getLang("statusOff"));
      }
    }
    
    // ✅ অন করার জন্য
    if (args[0] === "on") {
      await threadsData.set(event.threadID, true, "data.antiout");
      return message.reply(getLang("turnedOn"));
    }
    
    // ✅ অফ করার জন্য
    if (args[0] === "off") {
      await threadsData.set(event.threadID, false, "data.antiout");
      return message.reply(getLang("turnedOff"));
    }
  },

  onEvent: async function ({ event, api, threadsData, usersData, getLang }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const antiout = await threadsData.get(event.threadID, "data.antiout");
    if (!antiout) return;

    if (event.logMessageData.leftParticipantFbId === api.getCurrentUserID()) return;

    const name = await usersData.getName(event.logMessageData.leftParticipantFbId);

    try {
      await api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID);
      api.sendMessage(getLang("addedBack", name), event.threadID);
    } catch (error) {
      api.sendMessage(getLang("missingPermission", name), event.threadID);
    }
  }
};
