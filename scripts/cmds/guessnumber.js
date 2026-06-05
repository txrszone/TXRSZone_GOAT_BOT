const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

// Difficulty levels
const difficultyLevels = {
  easy: { range: 50, maxAttempts: 8, rewardPoint: 5, name: "Easy" },
  normal: { range: 100, maxAttempts: 10, rewardPoint: 10, name: "Normal" },
  hard: { range: 500, maxAttempts: 12, rewardPoint: 20, name: "Hard" },
  pro: { range: 1000, maxAttempts: 8, rewardPoint: 30, name: "Pro" }
};

// Store active games (threadID -> gameData)
let activeGames = new Map();

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["gn", "guessnum"],
    version: "2.0.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: { en: "Guess the number challenge" },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} off - Stop current game"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, messageID, senderID } = event;
    
    // ✅ OFF command - force stop game
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeGames.has(threadID)) {
        const gameData = activeGames.get(threadID);
        activeGames.delete(threadID);
        return message.reply(`❌ **GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 The current game has been terminated.\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } else {
        return message.reply(`❌ No active game found in this group!\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      }
    }
    
    // ✅ Check if there's an active game in this thread
    if (activeGames.has(threadID)) {
      const existingGame = activeGames.get(threadID);
      const remainingAttempts = existingGame.maxAttempts - existingGame.attempts;
      return message.reply(`❌ **A GAME IS ALREADY IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
🎮 Difficulty: ${existingGame.difficulty.toUpperCase()}
🎯 Range: 1 - ${existingGame.range}
📊 Progress: ${existingGame.attempts}/${existingGame.maxAttempts} attempts
⏳ Remaining: ${remainingAttempts} chances

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
      threadID: threadID,
      lastMessageID: null
    };
    
    activeGames.set(threadID, gameData);
    
    // Create canvas image
    const canvasImage = await createGameCanvas(gameData);
    
    const startMsg = await message.reply({
      body: `🎮 **GUESS THE NUMBER** 🎮
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
⚡ MW Legends Bot`,
      attachment: canvasImage
    });
    
    gameData.lastMessageID = startMsg.messageID;
    
    global.GoatBot.onReply.set(startMsg.messageID, {
      commandName: "guessnumber",
      author: senderID,
      threadID: threadID
    });
  },
  
  onReply: async function ({ message, event, api, usersData }) {
    const { body, threadID, messageID, senderID } = event;
    
    // ✅ Check if game exists in this thread
    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active game found!\n💡 Start a new game with: guessnumber\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    const game = activeGames.get(threadID);
    
    // ✅ Only the game starter can play
    if (senderID !== game.senderID) {
      return message.reply(`❌ **NOT YOUR GAME!**
━━━━━━━━━━━━━━━━━━━━
👑 This game was started by <@${game.senderID}>
💡 Start your own game with: guessnumber
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    }
    
    const guess = parseInt(body.trim());
    
    if (isNaN(guess)) {
      return message.reply(`❌ Please enter a valid number! (1 to ${game.range})`);
    }
    
    if (guess < 1 || guess > game.range) {
      return message.reply(`❌ Please enter a number between 1 and ${game.range}!`);
    }
    
    game.attempts++;
    game.attemptsHistory.push(guess);
    
    let remaining = game.maxAttempts - game.attempts;
    let replyMsg = "";
    let isGameOver = false;
    let isWin = false;
    
    // Check guess
    if (guess === game.secretNumber) {
      // WIN!
      const timeTaken = Date.now() - game.startTime;
      const pointsEarned = game.rewardPoint + Math.max(0, (game.maxAttempts - game.attempts) * 2);
      
      isWin = true;
      isGameOver = true;
      
      // Update user money
      try {
        const userData = await usersData.get(senderID);
        const currentMoney = userData.money || 0;
        await usersData.set(senderID, { money: currentMoney + pointsEarned });
      } catch(e) {}
      
      replyMsg = `
🎉 **CONGRATULATIONS!** 🎉
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
      
    } else if (game.attempts >= game.maxAttempts) {
      // GAME OVER - LOST
      isGameOver = true;
      
      replyMsg = `
❌ **GAME OVER!** ❌
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
      
    } else {
      // Continue game
      const isHigher = guess < game.secretNumber;
      const hint = isHigher ? "📈 HIGHER ⬆️" : "📉 LOWER ⬇️";
      
      // Calculate range
      let minRange = 1;
      let maxRange = game.range;
      for (const g of game.attemptsHistory) {
        if (g < game.secretNumber && g > minRange) minRange = g + 1;
        if (g > game.secretNumber && g < maxRange) maxRange = g - 1;
      }
      
      // Progress bar
      const barLength = 20;
      const progress = game.attempts / game.maxAttempts;
      const filled = Math.floor(barLength * progress);
      const bar = "▓".repeat(filled) + "░".repeat(barLength - filled);
      
      replyMsg = `
🔍 **Guess:** ${guess}
${hint}

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
    
    // Create canvas with current state
    const canvasImage = await createGameCanvas(game, isGameOver);
    
    // Send response
    const response = await message.reply({
      body: replyMsg,
      attachment: canvasImage
    });
    
    if (!isGameOver) {
      game.lastMessageID = response.messageID;
      global.GoatBot.onReply.set(response.messageID, {
        commandName: "guessnumber",
        author: senderID,
        threadID: threadID
      });
    }
  }
};

// Create game canvas
async function createGameCanvas(game, isGameOver = false) {
  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);
  
  // Title
  ctx.fillStyle = "#e94560";
  ctx.font = "bold 36px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("🎲 GUESS THE NUMBER 🎲", width / 2, 50);
  
  // Info panel
  ctx.fillStyle = "#0f3460";
  ctx.fillRect(50, 80, width - 100, 100);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px 'Arial'";
  ctx.fillText(`Range: 1 - ${game.range}`, 70, 115);
  ctx.fillText(`Difficulty: ${game.difficulty.toUpperCase()}`, 70, 145);
  ctx.fillText(`Attempts: ${game.attempts}/${game.maxAttempts}`, 70, 175);
  
  // Progress bar
  const barWidth = 300;
  const barHeight = 25;
  const progress = game.attempts / game.maxAttempts;
  ctx.fillStyle = "#2c2c3e";
  ctx.fillRect(width - 370, 110, barWidth, barHeight);
  ctx.fillStyle = "#e94560";
  ctx.fillRect(width - 370, 110, barWidth * progress, barHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px 'Arial'";
  ctx.fillText(`${Math.round(progress * 100)}%`, width - 370 + barWidth / 2, 130);
  
  // Game over overlay
  if (isGameOver) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    
    const isWin = game.attemptsHistory[game.attemptsHistory.length - 1] === game.secretNumber;
    ctx.fillStyle = isWin ? "#4ecca3" : "#ff6b6b";
    ctx.font = "bold 46px 'Arial'";
    ctx.fillText(isWin ? "🎉 VICTORY! 🎉" : "💀 GAME OVER 💀", width / 2, height / 2);
    ctx.font = "22px 'Arial'";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Number was: ${game.secretNumber}`, width / 2, height / 2 + 60);
  }
  
  return canvas.createPNGStream();
}
