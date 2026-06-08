const difficultyLevels = {
  easy: { range: 50, maxAttempts: 8, rewardPoint: 5, name: "Easy" },
  normal: { range: 100, maxAttempts: 10, rewardPoint: 10, name: "Normal" },
  hard: { range: 500, maxAttempts: 12, rewardPoint: 20, name: "Hard" },
  pro: { range: 1000, maxAttempts: 8, rewardPoint: 30, name: "Pro" }
};

let activeGames = new Map();

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["gn", "guessnum"],
    version: "3.0.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge with score system" },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} rank - View ranking\n{pn} info - Your stats\n{pn} off - Stop game"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, senderID } = event;
    
    // OFF command - গ্রুপ এডমিন, গেম স্টার্টার, বট এডমিন সবাই অফ করতে পারবে
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeGames.has(threadID)) {
        const game = activeGames.get(threadID);
        
        // চেক করা: গ্রুপ এডমিন কিনা
        let isGroupAdmin = false;
        try {
          const threadInfo = await api.getThreadInfo(threadID);
          isGroupAdmin = threadInfo.adminIDs?.some(admin => admin.id == senderID) || false;
        } catch(e) {}
        
        // চেক করা: বট এডমিন কিনা
        let isBotAdmin = global.config.ADMINBOT?.includes(senderID) || false;
        
        // অনুমতি: গেম স্টার্টার অথবা গ্রুপ এডমিন অথবা বট এডমিন
        if (senderID !== game.senderID && !isGroupAdmin && !isBotAdmin) {
          return message.reply(`❌ **NO PERMISSION!**
━━━━━━━━━━━━━━━━━━━━
👑 Only the game starter, group admin, or bot admin can stop this game.
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
        }
        
        activeGames.delete(threadID);
        return message.reply(`✅ **GAME STOPPED**
━━━━━━━━━━━━━━━━━━━━
🎮 The game has been terminated.
💡 Start a new game with: guessnumber
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      }
      return message.reply(`❌ No active game found!`);
    }
    
    // Rank command
    if (args[0] && args[0].toLowerCase() === "rank") {
      return showRanking(message, usersData);
    }
    
    // Info command
    if (args[0] && args[0].toLowerCase() === "info") {
      return showUserInfo(message, event, usersData);
    }
    
    // Check existing game
    if (activeGames.has(threadID)) {
      const existing = activeGames.get(threadID);
      const starterName = await usersData.getName(existing.senderID);
      return message.reply(`❌ **GAME IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
🎯 ${existing.difficulty.toUpperCase()} | ${existing.attempts}/${existing.maxAttempts} attempts
👑 Started by: ${starterName}
💡 Only the game starter, group admin, or bot admin can stop it.
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    }
    
    // Parse difficulty
    let difficulty = "normal";
    if (args[0]) {
      const diff = args[0].toLowerCase();
      if (difficultyLevels[diff]) difficulty = diff;
    }
    
    const config = difficultyLevels[difficulty];
    const secretNumber = Math.floor(Math.random() * config.range) + 1;
    
    const gameData = {
      active: true,
      secretNumber: secretNumber,
      range: config.range,
      maxAttempts: config.maxAttempts,
      attempts: 0,
      attemptsHistory: [],
      startTime: Date.now(),
      difficulty: difficulty,
      rewardPoint: config.rewardPoint,
      senderID: senderID,
      threadID: threadID
    };
    
    activeGames.set(threadID, gameData);
    
    const replyMsg = await message.reply(`🎮 **GUESS THE NUMBER** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Difficulty: ${difficulty.toUpperCase()}
🔢 Range: 1 to ${config.range}
🎲 Attempts: ${config.maxAttempts} chances
⭐ Reward: ${config.rewardPoint} points

💡 Reply with a number (e.g., ${Math.floor(config.range / 2)}):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    
    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  },

  onReply: async function ({ message, event, api, usersData }) {
    const { body, threadID, senderID } = event;
    
    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game! Start with: guessnumber`);
    }
    
    const game = activeGames.get(threadID);
    
    if (senderID !== game.senderID) {
      return message.reply(`❌ Not your game! Use 'guessnumber' to start your own.`);
    }
    
    const guess = parseInt(body.trim());
    
    if (isNaN(guess) || guess < 1 || guess > game.range) {
      return message.reply(`❌ Enter a number between 1 and ${game.range}!`);
    }
    
    game.attempts++;
    game.attemptsHistory.push(guess);
    
    // WIN
    if (guess === game.secretNumber) {
      const timeTaken = (Date.now() - game.startTime) / 1000;
      const pointsEarned = game.rewardPoint + Math.max(0, (game.maxAttempts - game.attempts) * 2);
      
      try {
        const userData = await usersData.get(senderID);
        const currentMoney = userData.money || 0;
        const currentExp = userData.exp || 0;
        
        await usersData.set(senderID, { 
          money: currentMoney + pointsEarned,
          exp: currentExp + 5
        });
        
        let gameStats = userData.gameStats || { guessnumber: { wins: 0, losses: 0, totalPoints: 0, bestAttempt: null } };
        if (!gameStats.guessnumber) gameStats.guessnumber = { wins: 0, losses: 0, totalPoints: 0, bestAttempt: null };
        
        gameStats.guessnumber.wins += 1;
        gameStats.guessnumber.totalPoints += pointsEarned;
        if (gameStats.guessnumber.bestAttempt === null || game.attempts < gameStats.guessnumber.bestAttempt) {
          gameStats.guessnumber.bestAttempt = game.attempts;
        }
        
        await usersData.set(senderID, { gameStats: gameStats });
        
      } catch(e) {
        console.error("Score save error:", e);
      }
      
      await message.reply(`🎉 **CORRECT!** 🎉
━━━━━━━━━━━━━━━━━━━━
🔢 Number: ${game.secretNumber}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⭐ Points: +${pointsEarned}
⏱️ Time: ${timeTaken.toFixed(1)}s
━━━━━━━━━━━━━━━━━━━━
🏆 YOU WIN! 🏆
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      
      activeGames.delete(threadID);
      return;
    }
    
    // GAME OVER
    if (game.attempts >= game.maxAttempts) {
      try {
        const userData = await usersData.get(senderID);
        let gameStats = userData.gameStats || { guessnumber: { wins: 0, losses: 0, totalPoints: 0, bestAttempt: null } };
        if (!gameStats.guessnumber) gameStats.guessnumber = { wins: 0, losses: 0, totalPoints: 0, bestAttempt: null };
        
        gameStats.guessnumber.losses += 1;
        await usersData.set(senderID, { gameStats: gameStats });
      } catch(e) {}
      
      await message.reply(`❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━
🔢 Correct number: ${game.secretNumber}
📊 Your guesses: ${game.attemptsHistory.join(" → ")}
━━━━━━━━━━━━━━━━━━━━
💪 Better luck next time!
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      
      activeGames.delete(threadID);
      return;
    }
    
    // CONTINUE
    const isHigher = guess < game.secretNumber;
    const hint = isHigher ? "📈 HIGHER ⬆️" : "📉 LOWER ⬇️";
    const remaining = game.maxAttempts - game.attempts;
    
    let minRange = 1, maxRange = game.range;
    for (const g of game.attemptsHistory) {
      if (g < game.secretNumber && g > minRange) minRange = g + 1;
      if (g > game.secretNumber && g < maxRange) maxRange = g - 1;
    }
    
    const progress = Math.floor((game.attempts / game.maxAttempts) * 20);
    const bar = "▓".repeat(progress) + "░".repeat(20 - progress);
    
    const replyMsg = await message.reply(`🔍 **Guess:** ${guess} → ${hint}

📊 ${bar}
🎯 ${game.attempts}/${game.maxAttempts} attempts
⏳ ${remaining} chances left
💡 Range: ${minRange} - ${maxRange}
📝 History: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${remaining === 1 ? "⚠️ LAST CHANCE!" : "🔥 Enter your next guess:"}`);
    
    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  }
};

// শো র‍্যাঙ্কিং
async function showRanking(message, usersData) {
  try {
    const allUsers = await usersData.getAll();
    
    const players = [];
    for (const user of allUsers) {
      const stats = user.gameStats?.guessnumber;
      if (stats && (stats.wins > 0 || stats.losses > 0)) {
        players.push({
          name: user.name || user.userID,
          id: user.userID,
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          points: stats.totalPoints || 0,
          bestAttempt: stats.bestAttempt || null
        });
      }
    }
    
    if (players.length === 0) {
      return message.reply(`🏆 **RANKING**\n━━━━━━━━━━━━━━━━━━━━\n📊 No one has played yet!\n💡 Be the first to play and earn points!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    players.sort((a, b) => b.points - a.points);
    
    let rankText = `🏆 **GUESS NUMBER RANKING** 🏆\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    for (let i = 0; i < Math.min(players.length, 10); i++) {
      const p = players[i];
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
      rankText += `${medal} ${p.name}\n   Wins: ${p.wins} | Losses: ${p.losses} | Points: ${p.points}\n`;
      if (p.bestAttempt) rankText += `   Best: ${p.bestAttempt} attempts\n`;
      rankText += "\n";
    }
    
    rankText += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ Type 'guessnumber info' to see your stats";
    
    await message.reply(rankText);
  } catch(e) {
    console.error("Rank error:", e);
    message.reply("❌ Failed to fetch ranking.");
  }
}

// শো ইউজার ইনফো
async function showUserInfo(message, event, usersData) {
  try {
    let targetID = event.senderID;
    
    if (Object.keys(event.mentions).length) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    }
    
    const userData = await usersData.get(targetID);
    const userName = userData.name || "Unknown";
    const stats = userData.gameStats?.guessnumber || { wins: 0, losses: 0, totalPoints: 0, bestAttempt: null };
    
    const totalGames = stats.wins + stats.losses;
    const winRate = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : 0;
    
    const statsMsg = `
📊 **${userName}'s STATS** 📊
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Points: ${stats.totalPoints || 0}
✅ Wins: ${stats.wins}
❌ Losses: ${stats.losses}
📈 Total Games: ${totalGames}
📊 Win Rate: ${winRate}%
${stats.bestAttempt ? `🎯 Best: ${stats.bestAttempt} guesses` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Type 'guessnumber' to play!
⚡ MW Legends Bot`;
    
    await message.reply(statsMsg);
  } catch(e) {
    console.error("Info error:", e);
    message.reply("❌ Failed to fetch user stats.");
  }
}
