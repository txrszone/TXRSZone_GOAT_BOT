// Difficulty levels
const difficultyLevels = {
  easy: { range: 50, maxAttempts: 8, rewardPoint: 5, name: "Easy" },
  normal: { range: 100, maxAttempts: 10, rewardPoint: 10, name: "Normal" },
  hard: { range: 500, maxAttempts: 12, rewardPoint: 20, name: "Hard" },
  pro: { range: 1000, maxAttempts: 8, rewardPoint: 30, name: "Pro" }
};

// Store active games
let activeGames = new Map();

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["gn", "guessnum"],
    version: "2.1.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge" },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} off - Stop current game"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, messageID, senderID } = event;
    
    // OFF command
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeGames.has(threadID)) {
        activeGames.delete(threadID);
        return message.reply(`❌ **GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 The current game has been terminated.\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } else {
        return message.reply(`❌ No active game found!\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      }
    }
    
    // Check existing game
    if (activeGames.has(threadID)) {
      const existing = activeGames.get(threadID);
      return message.reply(`❌ **A GAME IS ALREADY IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
🎮 Difficulty: ${existing.difficulty.toUpperCase()}
📊 Progress: ${existing.attempts}/${existing.maxAttempts} attempts
⏳ Remaining: ${existing.maxAttempts - existing.attempts} chances

💡 Continue playing or type 'guessnumber off' to stop.
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
    
    await message.reply(`🎮 **GUESS THE NUMBER** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Difficulty: ${difficulty.toUpperCase()}
🔢 Range: 1 to ${config.range}
🎲 Attempts: ${config.maxAttempts} chances
⭐ Reward: ${config.rewardPoint} points

💡 **How to play:**
• Reply with a number between 1-${config.range}
• I'll tell you HIGHER or LOWER
• Guess correctly to win!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 Enter your first guess (e.g., ${Math.floor(config.range / 2)}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
  },
  
  onReply: async function ({ message, event, api, usersData }) {
    const { body, threadID, messageID, senderID } = event;
    
    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game found!\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    const game = activeGames.get(threadID);
    
    if (senderID !== game.senderID) {
      return message.reply(`❌ **NOT YOUR GAME!**
━━━━━━━━━━━━━━━━━━━━
👑 This game was started by another player
💡 Start your own game with: guessnumber
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    }
    
    const guess = parseInt(body.trim());
    
    if (isNaN(guess) || guess < 1 || guess > game.range) {
      return message.reply(`❌ Please enter a valid number between 1 and ${game.range}!`);
    }
    
    game.attempts++;
    game.attemptsHistory.push(guess);
    
    let replyMsg = "";
    let isGameOver = false;
    
    if (guess === game.secretNumber) {
      // WIN
      const timeTaken = Date.now() - game.startTime;
      const pointsEarned = game.rewardPoint + Math.max(0, (game.maxAttempts - game.attempts) * 2);
      
      try {
        const userData = await usersData.get(senderID);
        const currentMoney = userData.money || 0;
        await usersData.set(senderID, { money: currentMoney + pointsEarned });
      } catch(e) {}
      
      replyMsg = `🎉 **CONGRATULATIONS!** 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ You guessed the correct number!
🔢 Number was: ${game.secretNumber}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⭐ Points earned: +${pointsEarned}
⏱️ Time: ${(timeTaken / 1000).toFixed(1)} seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 YOU WIN! 🏆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
      
      activeGames.delete(threadID);
      isGameOver = true;
      
    } else if (game.attempts >= game.maxAttempts) {
      // LOST
      replyMsg = `❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

😔 You ran out of attempts!
🔢 Correct number was: ${game.secretNumber}
🎯 Attempts used: ${game.attempts}/${game.maxAttempts}
📊 Your guesses: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 Better luck next time!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
      
      activeGames.delete(threadID);
      isGameOver = true;
      
    } else {
      // Continue
      const isHigher = guess < game.secretNumber;
      const hint = isHigher ? "📈 HIGHER ⬆️" : "📉 LOWER ⬇️";
      
      let minRange = 1, maxRange = game.range;
      for (const g of game.attemptsHistory) {
        if (g < game.secretNumber && g > minRange) minRange = g + 1;
        if (g > game.secretNumber && g < maxRange) maxRange = g - 1;
      }
      
      const barLength = 20;
      const progress = game.attempts / game.maxAttempts;
      const filled = Math.floor(barLength * progress);
      const bar = "▓".repeat(filled) + "░".repeat(barLength - filled);
      const remaining = game.maxAttempts - game.attempts;
      
      replyMsg = `🔍 **Guess:** ${guess} → ${hint}

📊 Progress: ${bar}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⏳ Remaining: ${remaining} chances
💡 Range: ${minRange} - ${maxRange}
📝 History: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${remaining === 1 ? "⚠️ LAST CHANCE!" : "🔥 Enter your next guess:"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
    }
    
    await message.reply(replyMsg);
  }
};
