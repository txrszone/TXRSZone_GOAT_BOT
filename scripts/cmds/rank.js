const axios = require('axios');

module.exports = {
  config: {
    name: "rank",
    aliases: ["myrank", "leaderboard"],
    version: "2.0.0",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: "Check message rank",
    longDescription: "Check your rank, others rank, or view leaderboard",
    category: "fun",
    guide: "{p}rank - Show leaderboard\n{p}rank me - Your message count & rank\n{p}rank @mention - Mentioned user's stats\n{p}rank reply - Replied user's stats"
  },

  onStart: async function ({ api, event, args }) {
    const threadId = event.threadID;
    const senderId = event.senderID;
    
    try {
      // গ্রুপের সব সদস্য পাওয়া
      const threadInfo = await api.getThreadInfo(threadId);
      const participants = threadInfo.participantIDs || [];
      
      if (participants.length === 0) {
        return api.sendMessage("❌ No participants found in this group.", threadId);
      }
      
      // মেসেজ কাউন্ট ইনিশিয়ালাইজ
      const messageCounts = {};
      participants.forEach(pid => {
        messageCounts[pid] = 0;
      });
      
      // গত 1000 মেসেজ অ্যানালাইসিস
      const messages = await api.getThreadHistory(threadId, 1000);
      
      messages.forEach(msg => {
        if (messageCounts[msg.senderID] !== undefined) {
          messageCounts[msg.senderID]++;
        }
      });
      
      // লিডারবোর্ড তৈরি (সবাই)
      const leaderboard = Object.entries(messageCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(u => u[1] > 0);
      
      // কমান্ড প্রসেসিং
      const action = args[0]?.toLowerCase();
      const mentions = Object.keys(event.mentions || {});
      const replyMsg = event.messageReply;
      
      // কেস 1: !rank me - নিজের তথ্য
      if (action === "me") {
        const userRank = leaderboard.findIndex(u => u[0] === senderId) + 1;
        const userCount = messageCounts[senderId] || 0;
        const totalUsers = leaderboard.length;
        const userInfo = await api.getUserInfo(senderId);
        const userName = userInfo[senderId]?.name || "You";
        
        const myRankMsg = `
╭───────────────╮
│      📊 YOUR RANK         │
╰───────────────╯

👤 **Name:** ${userName}
━━━━━━━━━━━━━━━━━━━━

🏆 **Rank:** #${userRank} / ${totalUsers}
📨 **Messages:** ${userCount}
📈 **Percentage:** ${((userCount / (leaderboard[0]?.[1] || 1)) * 100).toFixed(1)}% of top

━━━━━━━━━━━━━━━━━━━━
💡 Top: ${leaderboard[0]?.[1] || 0} messages
⚡ MW Legends Bot
        `;
        return api.sendMessage(myRankMsg, threadId);
      }
      
      // কেস 2: !rank @mention - ট্যাগ করা ইউজারের তথ্য
      if (mentions.length > 0) {
        const targetId = mentions[0];
        const targetInfo = await api.getUserInfo(targetId);
        const targetName = targetInfo[targetId]?.name || "User";
        const targetRank = leaderboard.findIndex(u => u[0] === targetId) + 1;
        const targetCount = messageCounts[targetId] || 0;
        const totalUsers = leaderboard.length;
        
        const userRankMsg = `
╭───────────────╮
│      📊 USER RANK         │
╰───────────────╯

👤 **Name:** ${targetName}
━━━━━━━━━━━━━━━━━━━━

🏆 **Rank:** #${targetRank} / ${totalUsers}
📨 **Messages:** ${targetCount}
📈 **Percentage:** ${((targetCount / (leaderboard[0]?.[1] || 1)) * 100).toFixed(1)}% of top

━━━━━━━━━━━━━━━━━━━━
💡 Top: ${leaderboard[0]?.[1] || 0} messages
⚡ MW Legends Bot
        `;
        return api.sendMessage(userRankMsg, threadId);
      }
      
      // কেস 3: রিপ্লাই করা ইউজারের তথ্য
      if (replyMsg && replyMsg.senderID) {
        const targetId = replyMsg.senderID;
        const targetInfo = await api.getUserInfo(targetId);
        const targetName = targetInfo[targetId]?.name || "User";
        const targetRank = leaderboard.findIndex(u => u[0] === targetId) + 1;
        const targetCount = messageCounts[targetId] || 0;
        const totalUsers = leaderboard.length;
        
        const userRankMsg = `
╭───────────────╮
│      📊 USER RANK         │
╰───────────────╯

👤 **Name:** ${targetName}
━━━━━━━━━━━━━━━━━━━━

🏆 **Rank:** #${targetRank} / ${totalUsers}
📨 **Messages:** ${targetCount}
📈 **Percentage:** ${((targetCount / (leaderboard[0]?.[1] || 1)) * 100).toFixed(1)}% of top

━━━━━━━━━━━━━━━━━━━━
💡 Top: ${leaderboard[0]?.[1] || 0} messages
⚡ MW Legends Bot
        `;
        return api.sendMessage(userRankMsg, threadId);
      }
      
      // কেস 4: ডিফল্ট - লিডারবোর্ড দেখাও
      const topUsers = leaderboard.slice(0, 15);
      const myRank = leaderboard.findIndex(u => u[0] === senderId) + 1;
      const myCount = messageCounts[senderId] || 0;
      const totalAnalyzed = messages.length;
      
      let leaderboardText = "";
      const medals = ["🥇", "🥈", "🥉"];
      
      for (let i = 0; i < topUsers.length; i++) {
        const [userId, count] = topUsers[i];
        try {
          const userInfo = await api.getUserInfo(userId);
          const userName = userInfo[userId]?.name || "Unknown";
          const medal = medals[i] || `${i+1}.`;
          leaderboardText += `${medal} **${userName}**\n   └ 📨 ${count} msgs\n\n`;
        } catch(e) {
          leaderboardText += `${i+1}. Unknown User\n   └ 📨 ${count} msgs\n\n`;
        }
      }
      
      // ইউজারের নিজের পজিশন খুঁজে বের করা (যদি টপ ১৫ এর বাইরে থাকে)
      let userPositionMsg = "";
      if (myRank > 15) {
        const userInfo = await api.getUserInfo(senderId);
        const userName = userInfo[senderId]?.name || "You";
        userPositionMsg = `\n━━━━━━━━━━━━━━━━━━━━\n👤 **Your Position:**\n   #${myRank} - ${userName}\n   📨 ${myCount} msgs\n`;
      }
      
      const leaderboardMsg = `
╭───────────────╮
│    🏆 LEADERBOARD     │
╰───────────────╯

📊 **Analysis:** Last ${totalAnalyzed} messages
👥 **Total Active:** ${leaderboard.length} members
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏅 **TOP ${Math.min(15, leaderboard.length)} ACTIVE MEMBERS**

${leaderboardText}${userPositionMsg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 **Commands:**
   • rank - Leaderboard
   • rank me - Your stats
   • rank @user - User stats
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot
      `;
      
      api.sendMessage(leaderboardMsg, threadId);
      
    } catch (error) {
      console.error("Rank error:", error);
      api.sendMessage(`❌ Error: ${error.message}\n💡 Make sure bot has admin access to read messages.`, threadId);
    }
  }
};
