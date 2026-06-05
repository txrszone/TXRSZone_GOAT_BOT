const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { getTime, convertTime } = global.utils;

// Difficulty levels with rewards
const difficultyLevels = {
  easy: { col: 4, row: 10, rewardPoint: 1, range: 50, maxAttempts: 8, name: "Easy" },
  normal: { col: 4, row: 10, rewardPoint: 1, range: 100, maxAttempts: 10, name: "Normal" },
  hard: { col: 5, row: 12, rewardPoint: 2, range: 1000, maxAttempts: 12, name: "Hard" },
  pro: { col: 6, row: 15, rewardPoint: 3, range: 1000, maxAttempts: 8, name: "Pro" }
};

// Ranking system
let rankingData = [];

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["gn", "guessnum"],
    version: "1.0.0",
    author: "OMOR TE",
    role: 0,
    countDown: 5,
    description: {
      en: "Guess the number challenge - Test your guessing skills!"
    },
    category: "game",
    guide: "{pn} [easy|normal|hard|pro] - Start game\n{pn} rank - View ranking\n{pn} info - View your stats"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, messageID, senderID } = event;
    
    // Check for rank command
    if (args[0] === "rank") {
      return showRanking(message, usersData);
    }
    
    // Check for info command
    if (args[0] === "info") {
      return showUserInfo(message, event, usersData);
    }
    
    // Initialize game storage
    if (!global.games) global.games = {};
    if (!global.games.guessnumber) global.games.guessnumber = new Map();
    
    const gameKey = `${threadID}_${senderID}`;
    const existingGame = global.games.guessnumber.get(gameKey);
    
    if (existingGame && existingGame.active) {
      return message.reply("❌ You already have an active game! Finish it first or type 'guessnumber rank' to see ranking.");
    }
    
    // Parse difficulty
    let difficulty = "normal";
    if (args[0]) {
      const diff = args[0].toLowerCase();
      if (difficultyLevels[diff]) {
        difficulty = diff;
      }
    }
    
    const config = difficultyLevels[difficulty];
    const maxNumber = config.range;
    const secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    
    const gameData = {
      active: true,
      secretNumber: secretNumber,
      maxNumber: maxNumber,
      maxAttempts: config.maxAttempts,
      attempts: 0,
      attemptsHistory: [],
      hints: [],
      startTime: Date.now(),
      difficulty: difficulty,
      rewardPoint: config.rewardPoint,
      col: config.col,
      row: config.row,
      senderID: senderID,
      threadID: threadID,
      lastMessageID: null
    };
    
    global.games.guessnumber.set(gameKey, gameData);
    
    // Create canvas image for game
    const canvasImage = await createGameCanvas(gameData);
    
    const startMsg = await message.reply({
      body: `🎮 **GUESS THE NUMBER CHALLENGE** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Difficulty: ${config.name.toUpperCase()}
🔢 Range: 1 to ${maxNumber}
🎲 Attempts: ${config.maxAttempts} chances
⭐ Reward: ${config.rewardPoint} points

💡 How to play:
• Type a number to guess
• I'll tell you if it's HIGHER or LOWER
• Guess correctly within attempts to win!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 Enter your first guess (e.g., 50):
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
    
    if (!global.games) global.games = {};
    if (!global.games.guessnumber) global.games.guessnumber = new Map();
    
    const gameKey = `${threadID}_${senderID}`;
    const game = global.games.guessnumber.get(gameKey);
    
    if (!game || !game.active) {
      return message.reply("❌ No active game found! Type 'guessnumber' to start a new game.");
    }
    
    const guess = parseInt(body.trim());
    
    if (isNaN(guess)) {
      return message.reply(`❌ Please enter a valid number! (1 to ${game.maxNumber})`);
    }
    
    if (guess < 1 || guess > game.maxNumber) {
      return message.reply(`❌ Please enter a number between 1 and ${game.maxNumber}!`);
    }
    
    game.attempts++;
    game.attemptsHistory.push(guess);
    
    let remaining = game.maxAttempts - game.attempts;
    let replyMsg = "";
    let isGameOver = false;
    let isWin = false;
    
    // Check the guess
    if (guess === game.secretNumber) {
      // WIN!
      const timeTaken = Date.now() - game.startTime;
      const pointsEarned = calculatePoints(game);
      
      isWin = true;
      isGameOver = true;
      
      replyMsg = `
🎉 **CONGRATULATIONS!** 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ You guessed the correct number!
🔢 Number was: ${game.secretNumber}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⭐ Points earned: +${pointsEarned}
⏱️ Time taken: ${(timeTaken / 1000).toFixed(1)} seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 You won the challenge! 🏆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
      
      // Save to ranking
      await updateRanking(senderID, game, true, pointsEarned, usersData);
      game.active = false;
      
    } else if (game.attempts >= game.maxAttempts) {
      // GAME OVER - LOST
      isGameOver = true;
      
      replyMsg = `
❌ **GAME OVER!** ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

😔 You ran out of attempts!
🔢 Correct number was: ${game.secretNumber}
🎯 Your attempts: ${game.attempts}/${game.maxAttempts}
📊 Your guesses: ${game.attemptsHistory.join(" → ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 Better luck next time!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
      
      await updateRanking(senderID, game, false, 0, usersData);
      game.active = false;
      
    } else {
      // Continue game
      const isHigher = guess < game.secretNumber;
      const hint = isHigher ? "HIGHER ⬆️" : "LOWER ⬇️";
      
      // Calculate range help
      let minPossible = 1;
      let maxPossible = game.maxNumber;
      
      for (const g of game.attemptsHistory) {
        if (g < game.secretNumber && g > minPossible) minPossible = g + 1;
        if (g > game.secretNumber && g < maxPossible) maxPossible = g - 1;
      }
      
      const rangeHelp = minPossible < maxPossible ? ` (${minPossible}-${maxPossible})` : "";
      
      // Create progress bar
      const barLength = 20;
      const progress = game.attempts / game.maxAttempts;
      const filled = Math.floor(barLength * progress);
      const bar = "▓".repeat(filled) + "░".repeat(barLength - filled);
      
      replyMsg = `
🔍 Guess: **${guess}** → ${hint}

📊 Progress: ${bar}
🎯 Attempts: ${game.attempts}/${game.maxAttempts}
⏳ Remaining: ${remaining} chances
📝 History: ${game.attemptsHistory.join(" → ")}
💡 Range${rangeHelp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${remaining === 1 ? "⚠️ LAST CHANCE! Guess carefully!" : "🔥 Keep guessing! Enter your next number:"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`;
    }
    
    // Delete previous message
    if (game.lastMessageID) {
      try {
        await api.unsendMessage(game.lastMessageID);
      } catch(e) {}
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
    } else {
      global.games.guessnumber.delete(gameKey);
    }
  }
};

// Calculate points based on attempts
function calculatePoints(game) {
  const basePoints = game.rewardPoint || 10;
  const bonusPoints = Math.max(0, (game.maxAttempts - game.attempts) * 2);
  return basePoints + bonusPoints;
}

// Update ranking system
async function updateRanking(userId, game, isWin, points, usersData) {
  try {
    const userData = await usersData.get(userId);
    const userName = userData.name || "Unknown";
    const currentMoney = userData.money || 0;
    
    if (isWin) {
      await usersData.set(userId, {
        money: currentMoney + points,
        exp: (userData.exp || 0) + 5
      });
    }
    
    // Update ranking array
    const existingIndex = rankingData.findIndex(r => r.id === userId);
    if (existingIndex === -1) {
      rankingData.push({
        id: userId,
        name: userName,
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        points: isWin ? points : 0,
        bestAttempt: isWin ? game.attempts : null
      });
    } else {
      rankingData[existingIndex].wins += isWin ? 1 : 0;
      rankingData[existingIndex].losses += isWin ? 0 : 1;
      rankingData[existingIndex].points += isWin ? points : 0;
      if (isWin && (rankingData[existingIndex].bestAttempt === null || game.attempts < rankingData[existingIndex].bestAttempt)) {
        rankingData[existingIndex].bestAttempt = game.attempts;
      }
      rankingData[existingIndex].name = userName;
    }
    
    // Sort ranking
    rankingData.sort((a, b) => b.points - a.points);
  } catch(e) {}
}

// Show ranking
async function showRanking(message, usersData) {
  if (rankingData.length === 0) {
    return message.reply("🏆 **RANKING**\n━━━━━━━━━━━━━━\n📊 No one has played yet!\n💡 Be the first to play and earn points!\n━━━━━━━━━━━━━━\n⚡ MW Legends Bot");
  }
  
  let rankText = "🏆 **GUESS NUMBER RANKING** 🏆\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  
  for (let i = 0; i < Math.min(rankingData.length, 10); i++) {
    const player = rankingData[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
    rankText += `${medal} ${player.name}\n   Wins: ${player.wins} | Losses: ${player.losses} | Points: ${player.points}\n`;
    if (player.bestAttempt) rankText += `   Best: ${player.bestAttempt} attempts\n`;
    rankText += "\n";
  }
  
  rankText += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ Type 'guessnumber info' to see your stats";
  
  await message.reply(rankText);
}

// Show user info
async function showUserInfo(message, event, usersData) {
  let targetID = event.senderID;
  
  if (Object.keys(event.mentions).length) {
    targetID = Object.keys(event.mentions)[0];
  } else if (event.messageReply) {
    targetID = event.messageReply.senderID;
  }
  
  const userData = await usersData.get(targetID);
  const userName = userData.name || "Unknown";
  
  const playerStats = rankingData.find(r => r.id === targetID);
  
  if (!playerStats) {
    return message.reply(`📊 **${userName}'s STATS**\n━━━━━━━━━━━━━━━━━━━━\n🎮 No games played yet!\n💡 Play 'guessnumber' to start!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
  }
  
  const totalGames = playerStats.wins + playerStats.losses;
  const winRate = totalGames > 0 ? ((playerStats.wins / totalGames) * 100).toFixed(1) : 0;
  
  const statsMsg = `
📊 **${userName}'s STATS** 📊
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Points: ${playerStats.points}
✅ Wins: ${playerStats.wins}
❌ Losses: ${playerStats.losses}
📈 Total Games: ${totalGames}
📊 Win Rate: ${winRate}%
${playerStats.bestAttempt ? `🎯 Best Attempt: ${playerStats.bestAttempt} guesses` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Type 'guessnumber' to play!
⚡ MW Legends Bot`;
  
  await message.reply(statsMsg);
}

// Create game canvas with visual representation
async function createGameCanvas(game, isGameOver = false) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Title
  ctx.fillStyle = "#e94560";
  ctx.font = "bold 32px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("🎲 GUESS THE NUMBER 🎲", width / 2, 60);
  
  // Info panel
  ctx.fillStyle = "#0f3460";
  ctx.fillRect(50, 90, width - 100, 120);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px 'Arial'";
  ctx.fillText(`Range: 1 - ${game.maxNumber}`, 70, 125);
  ctx.fillText(`Difficulty: ${game.difficulty.toUpperCase()}`, 70, 160);
  ctx.fillText(`Attempts: ${game.attempts}/${game.maxAttempts}`, 70, 195);
  
  // Progress bar
  const barWidth = 250;
  const barHeight = 25;
  const progress = game.attempts / game.maxAttempts;
  ctx.fillStyle = "#2c2c3e";
  ctx.fillRect(width - 320, 125, barWidth, barHeight);
  ctx.fillStyle = "#e94560";
  ctx.fillRect(width - 320, 125, barWidth * progress, barHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px 'Arial'";
  ctx.fillText(`${Math.round(progress * 100)}%`, width - 320 + barWidth / 2, 145);
  
  // Range indicator
  let minRange = 1;
  let maxRange = game.maxNumber;
  for (const g of game.attemptsHistory) {
    if (g < game.secretNumber && g > minRange) minRange = g + 1;
    if (g > game.secretNumber && g < maxRange) maxRange = g - 1;
  }
  
  if (!isGameOver && game.attempts > 0) {
    ctx.fillStyle = "#4ecca3";
    ctx.font = "18px 'Arial'";
    ctx.fillText(`💡 Current Range: ${minRange} - ${maxRange}`, width / 2, 240);
  }
  
  // History display
  if (game.attemptsHistory.length > 0) {
    ctx.fillStyle = "#eeeeee";
    ctx.font = "16px 'Arial'";
    ctx.fillText("📝 Guess History:", 70, 280);
    
    const historyStartX = 70;
    let historyY = 310;
    let xOffset = 0;
    
    for (let i = 0; i < game.attemptsHistory.length; i++) {
      const guess = game.attemptsHistory[i];
      const isCorrect = guess === game.secretNumber;
      
      ctx.fillStyle = isCorrect ? "#4ecca3" : (guess < game.secretNumber ? "#ffd93d" : "#ff6b6b");
      ctx.fillRect(historyStartX + xOffset, historyY, 60, 40);
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 18px 'Arial'";
      ctx.fillText(guess.toString(), historyStartX + xOffset + 30, historyY + 28);
      
      xOffset += 70;
      if (xOffset > 600) {
        xOffset = 0;
        historyY += 50;
      }
    }
  }
  
  // Game over overlay
  if (isGameOver) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    
    const isWin = game.attemptsHistory[game.attemptsHistory.length - 1] === game.secretNumber;
    ctx.fillStyle = isWin ? "#4ecca3" : "#ff6b6b";
    ctx.font = "bold 48px 'Arial'";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "🎉 YOU WIN! 🎉" : "💀 GAME OVER 💀", width / 2, height / 2);
    ctx.font = "24px 'Arial'";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`The number was: ${game.secretNumber}`, width / 2, height / 2 + 60);
  }
  
  return canvas.createPNGStream();
}
