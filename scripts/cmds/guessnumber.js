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
    version: "2.1.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge" },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} off - Stop current game"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, senderID } = event;
    
    // OFF command
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeGames.has(threadID)) {
        activeGames.delete(threadID);
        return message.reply(`❌ **GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 Game terminated.\n💡 Start new: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      }
      return message.reply(`❌ No active game found!\n💡 Start with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    // Check existing game
    if (activeGames.has(threadID)) {
      const existing = activeGames.get(threadID);
      return message.reply(`❌ **GAME IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
🎯 ${existing.difficulty.toUpperCase()} | ${existing.attempts}/${existing.maxAttempts} attempts
💡 Type 'guessnumber off' to stop.
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
    
    // ✅ সঠিকভাবে onReply সেট করা
    const replyMsg = await message.reply(`🎮 **GUESS THE NUMBER** 🎮
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
    
    // ✅ onReply সেট করা
    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  },

  onReply: async function ({ message, event, api, usersData }) {
    const { body, threadID, senderID } = event;
    
    // ✅ চেক করা: এই থ্রেডে গেম আছে কিনা
    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game!\n💡 Start new: guessnumber`);
    }
    
    const game = activeGames.get(threadID);
    
    // ✅ চেক করা: শুধু গেম স্টার্টার খেলতে পারে
    if (senderID !== game.senderID) {
      return message.reply(`❌ Not your game! Type 'guessnumber' to start your own.`);
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
        await usersData.set(senderID, { money: (userData.money || 0) + pointsEarned });
      } catch(e) {}
      
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
      await message.reply(`❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━
😔 You lost!
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
    
    // Calculate range
    let minRange = 1, maxRange = game.range;
    for (const g of game.attemptsHistory) {
      if (g < game.secretNumber && g > minRange) minRange = g + 1;
      if (g > game.secretNumber && g < maxRange) maxRange = g - 1;
    }
    
    // Progress bar
    const progress = Math.floor((game.attempts / game.maxAttempts) * 20);
    const bar = "▓".repeat(progress) + "░".repeat(20 - progress);
    
    await message.reply(`🔍 **Guess:** ${guess} → ${hint}

📊 ${bar}
🎯 ${game.attempts}/${game.maxAttempts} attempts
⏳ ${remaining} chances left
💡 Range: ${minRange} - ${maxRange}
📝 History: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${remaining === 1 ? "⚠️ LAST CHANCE!" : "🔥 Enter your next guess:"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
  }
};
