const difficultyLevels = {
  easy: { range: 50, maxAttempts: 8, rewardPoint: 5, name: "Easy", emoji: "🌟", description: "Perfect for beginners! Very forgiving." },
  normal: { range: 100, maxAttempts: 10, rewardPoint: 10, name: "Normal", emoji: "⭐", description: "Standard difficulty. Balanced challenge." },
  hard: { range: 500, maxAttempts: 12, rewardPoint: 20, name: "Hard", emoji: "🔥", description: "For experienced players. Think carefully!" },
  pro: { range: 1000, maxAttempts: 8, rewardPoint: 30, name: "Pro", emoji: "👑", description: "Ultimate challenge. Only for masters!" }
};

let activeGames = new Map();

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["gn", "guessnum"],
    version: "2.4.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge with AI difficulty levels" },
    category: "game",
    guide: "━━━━ 📜 COMMANDS ━━━━\n\n🎮 {p}guessnumber easy\n🎮 {p}guessnumber normal\n🎮 {p}guessnumber hard\n🎮 {p}guessnumber pro\n🛑 {p}guessnumber off\n💰 {p}guessnumber score\n📊 {p}guessnumber info\n📊 {p}guessnumber info @mention\n\n━━━━ 🎯 DIFFICULTY ━━━━\n🌟 EASY: 1-50, 8 tries, +5 pts\n⭐ NORMAL: 1-100, 10 tries, +10 pts\n🔥 HARD: 1-500, 12 tries, +20 pts\n👑 PRO: 1-1000, 8 tries, +30 pts"
  },

  onStart: async function ({ message, event, args, usersData, api, role }) {
    const { threadID, senderID, mentions } = event;

    // ========== SCORE COMMAND ==========
    if (args[0] && args[0].toLowerCase() === "score") {
      try {
        const userData = await usersData.get(senderID);
        const totalScore = userData?.guessnumber_score || 0;
        return message.reply(`💰 **YOUR SCORE** 💰\n━━━━━━━━━━━━━━━━━━━━\n👤 ${await getUserName(senderID, usersData)}\n⭐ Total: ${totalScore} points\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } catch(e) {
        console.error("Score fetch error:", e);
        return message.reply(`💰 Your score: 0 points`);
      }
    }

    // ========== INFO COMMAND ==========
    if (args[0] && args[0].toLowerCase() === "info") {
      let targetID = senderID;
      let targetName = await getUserName(senderID, usersData);
      
      if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID];
      }
      else if (args[1] && args[1].match(/[0-9]+/)) {
        targetID = args[1];
        targetName = await getUserName(targetID, usersData);
      }
      
      try {
        const userData = await usersData.get(targetID);
        const totalScore = userData?.guessnumber_score || 0;
        const gamesPlayed = userData?.guessnumber_played || 0;
        const gamesWon = userData?.guessnumber_won || 0;
        const winRate = gamesPlayed > 0 ? Math.floor((gamesWon / gamesPlayed) * 100) : 0;
        
        let rank = "🥉 Beginner";
        let rankEmoji = "🌱";
        if (totalScore >= 1000) { rank = "👑 Grandmaster"; rankEmoji = "👑"; }
        else if (totalScore >= 500) { rank = "🏆 Master"; rankEmoji = "🏆"; }
        else if (totalScore >= 200) { rank = "⭐ Expert"; rankEmoji = "⭐"; }
        else if (totalScore >= 100) { rank = "🌟 Advanced"; rankEmoji = "🌟"; }
        else if (totalScore >= 50) { rank = "📈 Intermediate"; rankEmoji = "📈"; }
        else if (totalScore >= 10) { rank = "🌱 Beginner"; rankEmoji = "🌱"; }
        
        const isOwnProfile = targetID === senderID;
        
        return message.reply(`${isOwnProfile ? '📊 **YOUR STATS**' : '📊 **PLAYER STATS**'} 📊
━━━━━━━━━━━━━━━━━━━━
👤 Player: ${targetName}
🏅 Rank: ${rankEmoji} ${rank}

💰 Total Score: ${totalScore} points
🎮 Games Played: ${gamesPlayed}
🏆 Games Won: ${gamesWon}
📊 Win Rate: ${winRate}%

━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
      } catch(e) {
        console.error("Info fetch error:", e);
        return message.reply(`❌ Could not find stats for this player!`);
      }
    }

    // ========== OFF COMMAND ==========
    if (args[0] && args[0].toLowerCase() === "off") {
      if (!activeGames.has(threadID)) {
        return message.reply(`❌ No active game found!\n💡 Start with: ${global.GoatBot.config.prefix}guessnumber easy`);
      }

      const game = activeGames.get(threadID);
      const isGameOwner = game.senderID === senderID;
      const isGroupAdmin = role === 'admin' || role === 'moderator';
      const isBotAdmin = global.GoatBot?.config?.adminBot?.includes(senderID) || false;

      if (isGameOwner || isGroupAdmin || isBotAdmin) {
        activeGames.delete(threadID);
        return message.reply(`🏁 **GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 Game terminated by ${isGameOwner ? 'owner' : 'admin'}.\n💡 Start new: ${global.GoatBot.config.prefix}guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } else {
        return message.reply(`❌ **Permission denied!**\nOnly the game starter, group admin, or bot admin can end this game.`);
      }
    }

    // ========== CHECK EXISTING GAME ==========
    if (activeGames.has(threadID)) {
      const existing = activeGames.get(threadID);
      const diffConfig = difficultyLevels[existing.difficulty];
      return message.reply(`❌ **GAME IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
${diffConfig.emoji} ${existing.difficulty.toUpperCase()} | ${existing.attempts}/${existing.maxAttempts} attempts
👤 Player: ${await getUserName(existing.senderID, usersData)}
💡 Type '${global.GoatBot.config.prefix}guessnumber off' to stop.`);
    }

    // ========== PARSE DIFFICULTY ==========
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

${config.emoji} Difficulty: ${difficulty.toUpperCase()}
📝 ${config.description}
🔢 Range: 1 to ${config.range}
🎲 Attempts: ${config.maxAttempts} chances
⭐ Reward: ${config.rewardPoint} points
👤 Player: ${await getUserName(senderID, usersData)}

💡 Reply with a number (e.g., ${Math.floor(config.range / 2)}):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);

    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  },

  onReply: async function ({ message, event, api, usersData, role }) {
    const { body, threadID, senderID } = event;

    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game in this thread! Start with: ${global.GoatBot.config.prefix}guessnumber`);
    }

    const game = activeGames.get(threadID);

    if (senderID !== game.senderID) {
      return message.reply(`❌ Not your game! Only ${await getUserName(game.senderID, usersData)} can play. Type '${global.GoatBot.config.prefix}guessnumber off' to end.`);
    }

    // Handle off in reply
    if (body.trim().toLowerCase() === "off") {
      const isGameOwner = game.senderID === senderID;
      const isGroupAdmin = role === 'admin' || role === 'moderator';
      const isBotAdmin = global.GoatBot?.config?.adminBot?.includes(senderID) || false;
      
      if (isGameOwner || isGroupAdmin || isBotAdmin) {
        activeGames.delete(threadID);
        return message.reply(`🏁 Game ended by command.`);
      } else {
        return message.reply(`❌ You cannot end this game.`);
      }
    }

    const guess = parseInt(body.trim());

    if (isNaN(guess) || guess < 1 || guess > game.range) {
      return message.reply(`❌ Enter a valid number between 1 and ${game.range}!`);
    }

    game.attempts++;
    game.attemptsHistory.push(guess);

    // ========== WIN ==========
    if (guess === game.secretNumber) {
      const pointsEarned = game.rewardPoint + Math.max(0, (game.maxAttempts - game.attempts) * 2);
      const diffConfig = difficultyLevels[game.difficulty];

      try {
        // Get current user data
        const userData = await usersData.get(senderID);
        
        // Calculate new values
        const newScore = (userData?.guessnumber_score || 0) + pointsEarned;
        const newPlayed = (userData?.guessnumber_played || 0) + 1;
        const newWon = (userData?.guessnumber_won || 0) + 1;
        const newMoney = (userData?.money || 0) + pointsEarned;
        
        // Update user data using proper method
        await usersData.set(senderID, {
          money: newMoney,
          guessnumber_score: newScore,
          guessnumber_played: newPlayed,
          guessnumber_won: newWon
        });
        
        console.log(`Score updated for ${senderID}: +${pointsEarned} points, Total: ${newScore}`);
        
      } catch (e) {
        console.error("Score update error:", e);
      }

      await message.reply(`🎉 **CORRECT!** 🎉
━━━━━━━━━━━━━━━━━━━━
${diffConfig.emoji} Difficulty: ${game.difficulty.toUpperCase()}
🔢 Number: ${game.secretNumber}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⭐ Points earned: +${pointsEarned}
━━━━━━━━━━━━━━━━━━━━
🏆 YOU WIN! 🏆`);

      activeGames.delete(threadID);
      return;
    }

    // ========== GAME OVER ==========
    if (game.attempts >= game.maxAttempts) {
      const diffConfig = difficultyLevels[game.difficulty];
      
      try {
        const userData = await usersData.get(senderID);
        const newPlayed = (userData?.guessnumber_played || 0) + 1;
        
        await usersData.set(senderID, {
          guessnumber_played: newPlayed
        });
        
        console.log(`Game played updated for ${senderID}: Total played: ${newPlayed}`);
        
      } catch (e) {
        console.error("Game over update error:", e);
      }

      await message.reply(`❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━
${diffConfig.emoji} Difficulty: ${game.difficulty.toUpperCase()}
🔢 Correct number: ${game.secretNumber}
📊 Your guesses: ${game.attemptsHistory.join(" → ")}
━━━━━━━━━━━━━━━━━━━━
💪 Better luck next time!`);

      activeGames.delete(threadID);
      return;
    }

    // ========== CONTINUE ==========
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
⏳ ${remaining} chance${remaining !== 1 ? 's' : ''} left
💡 Range: ${minRange} - ${maxRange}
📝 History: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${remaining === 1 ? "⚠️ LAST CHANCE!" : "🔥 Enter your next guess:"}`);

    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: game.senderID,
      threadID: threadID
    });
  }
};

// Helper function to get user name
async function getUserName(userID, usersData) {
  try {
    const userData = await usersData.get(userID);
    return userData?.name || userData?.displayName || "Unknown User";
  } catch(e) {
    return "User";
  }
}
