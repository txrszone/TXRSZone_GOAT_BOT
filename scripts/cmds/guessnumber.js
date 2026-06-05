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
    version: "2.2.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge" },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} off - Stop current game"
  },

  onStart: async function ({ message, event, args, usersData, api, role }) {
    const { threadID, senderID } = event;

    // ========== OFF COMMAND ==========
    if (args[0] && args[0].toLowerCase() === "off") {
      if (!activeGames.has(threadID)) {
        return message.reply(`❌ No active game found in this thread!\n💡 Start with: guessnumber`);
      }

      const game = activeGames.get(threadID);
      const isGameOwner = game.senderID === senderID;
      const isGroupAdmin = role === 'admin' || role === 'moderator';
      const isBotAdmin = global.config.admins?.includes(senderID);

      if (isGameOwner || isGroupAdmin || isBotAdmin) {
        activeGames.delete(threadID);
        return message.reply(`🏁 **GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 Game terminated by ${isGameOwner ? 'owner' : 'admin'}.\n💡 Start new: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } else {
        return message.reply(`❌ **Permission denied!**\nOnly the game starter, group admin, or bot admin can end this game.`);
      }
    }

    // ========== CHECK EXISTING GAME ==========
    if (activeGames.has(threadID)) {
      const existing = activeGames.get(threadID);
      return message.reply(`❌ **GAME IN PROGRESS!**\n━━━━━━━━━━━━━━━━━━━━\n🎯 ${existing.difficulty.toUpperCase()} | ${existing.attempts}/${existing.maxAttempts} attempts\n👤 Player: <@${existing.senderID}>\n💡 Type '{p}guessnumber off' to stop.`);
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

🎯 Difficulty: ${difficulty.toUpperCase()}
🔢 Range: 1 to ${config.range}
🎲 Attempts: ${config.maxAttempts} chances
⭐ Reward: ${config.rewardPoint} points
👤 Player: <@${senderID}>

💡 Reply with a number (e.g., ${Math.floor(config.range / 2)}):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);

    // Set onReply for this game
    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  },

  onReply: async function ({ message, event, api, usersData, role }) {
    const { body, threadID, senderID } = event;

    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game in this thread! Start with: {p}guessnumber`);
    }

    const game = activeGames.get(threadID);

    // Only the player who started can guess
    if (senderID !== game.senderID) {
      return message.reply(`❌ Not your game! Only <@${game.senderID}> can play. Type '{p}guessnumber off' to end.`);
    }

    // Check if the user typed "off" inside reply
    if (body.trim().toLowerCase() === "off") {
      const isGameOwner = game.senderID === senderID;
      const isGroupAdmin = role === 'admin' || role === 'moderator';
      const isBotAdmin = global.config.admins?.includes(senderID);
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

      try {
        const userData = await usersData.get(senderID);
        await usersData.set(senderID, { money: (userData.money || 0) + pointsEarned });
      } catch (e) {}

      await message.reply(`🎉 **CORRECT!** 🎉
━━━━━━━━━━━━━━━━━━━━
🔢 Number: ${game.secretNumber}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⭐ Points earned: +${pointsEarned}
━━━━━━━━━━━━━━━━━━━━
🏆 YOU WIN! 🏆`);

      activeGames.delete(threadID);
      return;
    }

    // ========== GAME OVER (max attempts reached) ==========
    if (game.attempts >= game.maxAttempts) {
      await message.reply(`❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━
🔢 Correct number: ${game.secretNumber}
📊 Your guesses: ${game.attemptsHistory.join(" → ")}
━━━━━━━━━━━━━━━━━━━━
💪 Better luck next time!`);

      activeGames.delete(threadID);
      return;
    }

    // ========== CONTINUE - Provide hint and updated range ==========
    const isHigher = guess < game.secretNumber;
    const hint = isHigher ? "📈 HIGHER ⬆️" : "📉 LOWER ⬇️";
    const remaining = game.maxAttempts - game.attempts;

    // Calculate narrowed range based on past guesses
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

    // Update onReply for next message
    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: game.senderID,
      threadID: threadID
    });
  }
};
