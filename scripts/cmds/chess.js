const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const { Chess } = require("chess.js");

// AI Difficulty Levels
const AI_LEVELS = {
  beginner: { name: "Felix", title: "Beginner", depth: 1, randomness: 0.8, taunts: ["Hmm...", "Interesting!", "🤔"] },
  novice: { name: "Ava", title: "Novice", depth: 1, randomness: 0.6, taunts: ["Not bad!", "I see...", "🙂"] },
  club: { name: "Oliver", title: "Club", depth: 2, randomness: 0.4, taunts: ["Nice try!", "Risky...", "😏"] },
  advanced: { name: "Emma", title: "Advanced", depth: 2, randomness: 0.2, taunts: ["Solid!", "Let's see...", "🎯"] },
  gm: { name: "Magnus", title: "Grandmaster", depth: 3, randomness: 0.05, taunts: ["Weak!", "Expected!", "👑"] }
};

const AI_NAMES = {};
Object.keys(AI_LEVELS).forEach(level => { AI_NAMES[AI_LEVELS[level].name.toLowerCase()] = level; });

const PIECE_VALUES = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
const PAWN_TABLE = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
const KNIGHT_TABLE = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];

// Store active games (threadID -> gameData)
let activeGames = new Map();

module.exports = {
  config: {
    name: "chess",
    aliases: ["chessplay"],
    version: "2.1.0",
    author: "eden (Converted by OMOR TE)",
    role: 0,
    description: { en: "Play chess with AI opponents" },
    category: "games",
    countDown: 5,
    guide: "chess [beginner|novice|club|advanced|gm] - Start game\nchess off - Stop current game"
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { threadID, messageID, senderID } = event;
    
    // ✅ OFF command - force stop game
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeGames.has(threadID)) {
        const gameData = activeGames.get(threadID);
        activeGames.delete(threadID);
        
        // Delete last game board if exists
        if (gameData.lastMessageID) {
          try { await api.unsendMessage(gameData.lastMessageID); } catch(e) {}
        }
        
        return message.reply(`♟️ **CHESS GAME STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n🎮 The current chess game has been terminated.\n💡 Start a new game with: chess\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      } else {
        return message.reply(`❌ No active chess game found in this group!\n💡 Start a new game with: chess\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
      }
    }
    
    // ✅ Check if there's an active game in this thread
    if (activeGames.has(threadID)) {
      const existingGame = activeGames.get(threadID);
      return message.reply(`♟️ **A CHESS GAME IS ALREADY IN PROGRESS!**
━━━━━━━━━━━━━━━━━━━━
👑 Opponent: ${existingGame.aiName} (${existingGame.aiTitle})
🎨 You are playing as: ${existingGame.playerColor === 'white' ? 'White (moves first)' : 'Black (AI moves first)'}
📊 Status: Game in progress

💡 Continue playing or type 'chess off' to stop.
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    }
    
    // Parse AI level
    let aiLevel = "club";
    if (args[0]) {
      const input = args[0].toLowerCase();
      if (AI_LEVELS[input]) aiLevel = input;
      else if (AI_NAMES[input]) aiLevel = AI_NAMES[input];
    }
    
    const aiConfig = AI_LEVELS[aiLevel];
    const playerName = (await usersData.get(senderID))?.name || "Player";
    
    // Create new game
    const chess = new Chess();
    const playerColor = Math.random() < 0.5 ? 'white' : 'black';
    
    const gameData = {
      active: true,
      chess: chess,
      aiLevel: aiLevel,
      aiName: aiConfig.name,
      aiTitle: aiConfig.title,
      playerName: playerName,
      playerColor: playerColor,
      lastMove: null,
      moveHistory: [],
      senderID: senderID,
      threadID: threadID,
      lastMessageID: null
    };
    
    activeGames.set(threadID, gameData);
    
    const colorText = playerColor === 'white' ? 'White (you go first)' : 'Black (AI goes first)';
    
    // If AI plays first (player is black)
    if (playerColor === 'black') {
      const aiMove = getAIMove(gameData);
      if (aiMove) {
        gameData.chess.move(aiMove);
        gameData.moveHistory.push(aiMove);
        gameData.lastMove = aiMove;
      }
    }
    
    // Display board
    const boardImage = await displayBoard(gameData);
    
    const startMsg = await message.reply({
      body: `♟️ **CHESS GAME STARTED!** ♟️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Opponent: ${aiConfig.name} (${aiConfig.title})
🎨 You are playing as ${colorText}
📝 ${aiConfig.description}

💡 **How to play:**
• Send your move in format: e2 e4
• Or: e2e4 or e2-e4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${playerColor === 'black' ? `🤖 ${aiConfig.name} made the first move!\n` : ''}Enter your move:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`,
      attachment: boardImage
    });
    
    gameData.lastMessageID = startMsg.messageID;
    
    global.GoatBot.onReply.set(startMsg.messageID, {
      commandName: "chess",
      author: senderID,
      threadID: threadID
    });
  },
  
  onReply: async function ({ message, event, api, usersData }) {
    const { body, threadID, messageID, senderID } = event;
    
    // Check if game exists
    if (!activeGames.has(threadID)) {
      return message.reply(`❌ No active chess game found!\n💡 Start a new game with: chess\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }
    
    const game = activeGames.get(threadID);
    
    // Only the game starter can play
    if (senderID !== game.senderID) {
      return message.reply(`❌ **NOT YOUR GAME!**
━━━━━━━━━━━━━━━━━━━━
👑 This game was started by another player
💡 Start your own game with: chess
━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot`);
    }
    
    // Check if it's player's turn
    const playerTurn = game.playerColor === 'white' ? 'w' : 'b';
    if (game.chess.turn() !== playerTurn) {
      return message.reply(`❌ It's not your turn! Wait for AI to move.`);
    }
    
    // Parse move
    const cleanMove = body.trim().toLowerCase().replace(/\s+/g, ' ');
    let from, to;
    
    if (cleanMove.includes(' ')) {
      const parts = cleanMove.split(' ');
      from = parts[0];
      to = parts[1];
    } else if (cleanMove.includes('-')) {
      const parts = cleanMove.split('-');
      from = parts[0];
      to = parts[1];
    } else if (cleanMove.length === 4) {
      from = cleanMove.substring(0, 2);
      to = cleanMove.substring(2, 4);
    } else {
      return message.reply(`❌ Invalid format! Use: e2 e4 or e2e4 or e2-e4`);
    }
    
    // Make move
    try {
      const move = game.chess.move({ from, to, promotion: 'q' });
      if (!move) throw new Error("Invalid move");
      
      game.lastMove = move;
      game.moveHistory.push(move.san);
      
      // Delete previous board message (2 second cooldown)
      if (game.lastMessageID) {
        setTimeout(async () => {
          try { await api.unsendMessage(game.lastMessageID); } catch(e) {}
        }, 2000);
      }
      
      // Check if game over after player move
      if (game.chess.isGameOver()) {
        let resultMsg = "";
        if (game.chess.isCheckmate()) {
          const playerTurnEnd = game.playerColor === 'white' ? 'b' : 'w';
          const isPlayerWin = game.chess.turn() !== playerTurnEnd;
          resultMsg = isPlayerWin ? "🎉 **YOU WIN!** 🎉" : "😔 **AI WINS!** 😔";
        } else if (game.chess.isDraw()) {
          resultMsg = "🤝 **DRAW!** 🤝";
        } else {
          resultMsg = "🏁 **GAME OVER** 🏁";
        }
        
        const boardImage = await displayBoard(game);
        await message.reply({
          body: `${resultMsg}\n━━━━━━━━━━━━━━━━━━━━\n📊 Final position:\n${game.chess.ascii()}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`,
          attachment: boardImage
        });
        
        activeGames.delete(threadID);
        return;
      }
      
      // AI move
      setTimeout(async () => {
        const aiMove = getAIMove(game);
        if (aiMove) {
          game.chess.move(aiMove);
          game.moveHistory.push(aiMove);
          game.lastMove = aiMove;
          
          // Check if game over after AI move
          let resultMsg = null;
          if (game.chess.isGameOver()) {
            if (game.chess.isCheckmate()) {
              const isAIWin = game.chess.turn() === (game.playerColor === 'white' ? 'b' : 'w');
              resultMsg = isAIWin ? "😔 **AI WINS!** 😔" : "🎉 **YOU WIN!** 🎉";
            } else if (game.chess.isDraw()) {
              resultMsg = "🤝 **DRAW!** 🤝";
            } else {
              resultMsg = "🏁 **GAME OVER** 🏁";
            }
          }
          
          const boardImage = await displayBoard(game);
          const checkStatus = game.chess.inCheck() ? " - CHECK!" : "";
          const taunt = Math.random() < 0.3 ? ` ${AI_LEVELS[game.aiLevel].taunts[Math.floor(Math.random() * AI_LEVELS[game.aiLevel].taunts.length)]}` : "";
          
          if (resultMsg) {
            await message.reply({
              body: `${game.aiName} played ${aiMove}${checkStatus}${taunt}\n━━━━━━━━━━━━━━━━━━━━\n${resultMsg}`,
              attachment: boardImage
            });
            activeGames.delete(threadID);
          } else {
            const replyMsg = await message.reply({
              body: `${game.aiName} played ${aiMove}${checkStatus}${taunt}\n━━━━━━━━━━━━━━━━━━━━\nYour turn! Enter your move:`,
              attachment: boardImage
            });
            game.lastMessageID = replyMsg.messageID;
            
            global.GoatBot.onReply.set(replyMsg.messageID, {
              commandName: "chess",
              author: senderID,
              threadID: threadID
            });
          }
        }
      }, 1500);
      
      // Show player move confirmation
      const boardImage = await displayBoard(game);
      const checkStatus = game.chess.inCheck() ? " - CHECK!" : "";
      const confirmMsg = await message.reply({
        body: `✅ You played ${move.san}${checkStatus}\n━━━━━━━━━━━━━━━━━━━━\n🤖 AI is thinking...`,
        attachment: boardImage
      });
      
      game.lastMessageID = confirmMsg.messageID;
      global.GoatBot.onReply.set(confirmMsg.messageID, {
        commandName: "chess",
        author: senderID,
        threadID: threadID
      });
      
    } catch (error) {
      return message.reply(`❌ Invalid move! Try again.\n💡 Use format: e2 e4`);
    }
  }
};

// Helper Functions
function evaluatePosition(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -9999 : 9999;
  if (chess.isDraw()) return 0;
  
  let score = 0;
  const board = chess.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let val = PIECE_VALUES[piece.type] || 0;
        if (piece.type === 'p') val += piece.color === 'w' ? PAWN_TABLE[i][j] : PAWN_TABLE[7-i][j];
        if (piece.type === 'n') val += piece.color === 'w' ? KNIGHT_TABLE[i][j] : KNIGHT_TABLE[7-i][j];
        score += piece.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}

function minimax(chess, depth, alpha, beta, isMax) {
  if (depth === 0 || chess.isGameOver()) return evaluatePosition(chess);
  const moves = chess.moves();
  if (isMax) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAIMove(game) {
  const config = AI_LEVELS[game.aiLevel];
  const moves = game.chess.moves();
  if (moves.length === 0) return null;
  
  if (Math.random() < config.randomness) return moves[Math.floor(Math.random() * moves.length)];
  
  let bestMove = moves[0];
  let bestScore = -Infinity;
  
  for (const move of moves) {
    game.chess.move(move);
    let score;
    if (game.aiLevel === 'beginner' || game.aiLevel === 'novice') {
      score = evaluatePosition(game.chess) + (Math.random() - 0.5) * 200;
    } else {
      const aiColor = game.playerColor === 'white' ? 'black' : 'white';
      score = minimax(game.chess, config.depth, -Infinity, Infinity, aiColor === 'white');
    }
    game.chess.undo();
    if (Math.random() < config.randomness) score += (Math.random() - 0.5) * 100;
    if (score > bestScore) { bestScore = score; bestMove = move; }
  }
  return bestMove;
}

async function displayBoard(game) {
  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#2C3E50";
  ctx.fillRect(0, 0, 800, 800);
  
  const squareSize = 80;
  const offset = 80;
  
  // Draw board
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = offset + col * squareSize;
      const y = offset + row * squareSize;
      ctx.fillStyle = (row + col) % 2 === 0 ? "#F0D9B5" : "#B58863";
      ctx.fillRect(x, y, squareSize, squareSize);
      
      // Highlight last move
      if (game.lastMove) {
        const fromFile = game.lastMove.from.charCodeAt(0) - 97;
        const fromRank = 8 - parseInt(game.lastMove.from[1]);
        const toFile = game.lastMove.to.charCodeAt(0) - 97;
        const toRank = 8 - parseInt(game.lastMove.to[1]);
        if ((row === fromRank && col === fromFile) || (row === toRank && col === toFile)) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }
    }
  }
  
  // Draw pieces
  ctx.font = "50px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };
  
  const board = game.chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const x = offset + col * squareSize + squareSize / 2;
        const y = offset + row * squareSize + squareSize / 2;
        const symbol = pieceSymbols[piece.type === piece.type.toUpperCase() ? piece.type.toUpperCase() : piece.type.toLowerCase()];
        
        if (piece.color === 'w') {
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.strokeText(symbol, x, y);
          ctx.fillStyle = "#FFF";
          ctx.fillText(symbol, x, y);
        } else {
          ctx.fillStyle = "#000";
          ctx.fillText(symbol, x, y);
        }
      }
    }
  }
  
  // Labels
  ctx.fillStyle = "#FFF";
  ctx.font = "18px 'Arial'";
  for (let i = 0; i < 8; i++) {
    ctx.fillText(String.fromCharCode(97 + i), offset + i * squareSize + squareSize/2, offset + 8 * squareSize + 30);
    ctx.fillText((8 - i).toString(), offset - 25, offset + i * squareSize + squareSize/2);
  }
  
  // Info text
  ctx.font = "20px 'Arial'";
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  const turn = game.chess.turn();
  const isPlayerTurn = (game.playerColor === 'white' && turn === 'w') || (game.playerColor === 'black' && turn === 'b');
  ctx.fillText(`${isPlayerTurn ? "YOUR TURN" : "AI THINKING..."}`, 400, 35);
  ctx.font = "16px 'Arial'";
  ctx.fillText(`${game.aiName} (${game.aiTitle}) | ${game.playerColor === 'white' ? 'White: You' : 'White: AI'}`, 400, 760);
  
  const imagePath = path.join(__dirname, "cache", `chess_${Date.now()}.png`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
  fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));
  return fs.createReadStream(imagePath);
}
