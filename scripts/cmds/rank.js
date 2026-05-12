const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

// এক্সপ লেভেল ক্যালকুলেশন
const deltaNext = 5;

function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

function levelToExp(level) {
  return Math.floor(((Math.pow(level, 2) - level) * deltaNext) / 2);
}

module.exports = {
  config: {
    name: "rank",
    version: "1.7",
    author: "NTKhang (Converted by OMOR TE)",
    countDown: 5,
    role: 0,
    shortDescription: "View user rank",
    longDescription: "View your level or mentioned user's rank",
    guide: "{p}rank\n{p}rank @user",
    category: "rank"
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    let targetUsers = [];
    
    if (Object.keys(event.mentions).length > 0) {
      targetUsers = Object.keys(event.mentions);
    } else {
      targetUsers = [event.senderID];
    }

    // কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply("📊 Fetching rank information...");

    try {
      for (const userID of targetUsers) {
        const userData = await usersData.get(userID);
        const exp = userData.exp || 0;
        const level = expToLevel(exp);
        const currentLevelExp = levelToExp(level);
        const nextLevelExp = levelToExp(level + 1);
        const expNeeded = nextLevelExp - currentLevelExp;
        const currentExp = exp - currentLevelExp;
        const percent = Math.floor((currentExp / expNeeded) * 100);
        
        // সব ইউজার বের করে র‍্যাঙ্কিং
        const allUsers = await usersData.getAll();
        allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));
        const rank = allUsers.findIndex(u => u.userID == userID) + 1;
        
        const userName = userData.name || (await usersData.getName(userID));
        const avatarUrl = await usersData.getAvatarUrl(userID);
        
        // ক্যানভাস তৈরি
        const width = 1000;
        const height = 350;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        
        // ব্যাকগ্রাউন্ড
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // গ্রেডিয়েন্ট যোগ
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "#16213e");
        gradient.addColorStop(1, "#0f3460");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // প্রোফাইল ছবি (বৃত্তাকার)
        const avatarSize = 120;
        const avatarX = 50;
        const avatarY = (height - avatarSize) / 2;
        
        try {
          const avatarBuffer = await axios.get(avatarUrl, { responseType: "arraybuffer" });
          const avatarImg = await Canvas.loadImage(avatarBuffer.data);
          
          // বৃত্তাকার ক্লিপিং
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
          ctx.restore();
          
          // বর্ডার
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "#e94560";
          ctx.lineWidth = 4;
          ctx.stroke();
        } catch(e) {}
        
        // নাম
        ctx.font = `bold 32px "Poppins", "Segoe UI", "Arial"`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(userName.length > 20 ? userName.slice(0, 18) + "..." : userName, 200, 110);
        
        // লেভেল
        ctx.font = `24px "Poppins", "Segoe UI", "Arial"`;
        ctx.fillStyle = "#e94560";
        ctx.fillText(`Level ${level}`, 200, 160);
        
        // র‍্যাঙ্ক
        ctx.fillStyle = "#ffd700";
        ctx.fillText(`Rank #${rank} / ${allUsers.length}`, 200, 200);
        
        // এক্সপি বার
        const barX = 200;
        const barY = 240;
        const barWidth = width - 250;
        const barHeight = 25;
        
        // ব্যাকগ্রাউন্ড বার
        ctx.fillStyle = "#2c2c3e";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // ফোরগ্রাউন্ড বার
        const filledWidth = (percent / 100) * barWidth;
        const barGradient = ctx.createLinearGradient(barX, barY, barX + filledWidth, barY);
        barGradient.addColorStop(0, "#e94560");
        barGradient.addColorStop(1, "#ff6b6b");
        ctx.fillStyle = barGradient;
        ctx.fillRect(barX, barY, filledWidth, barHeight);
        
        // বর্ডার
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // এক্সপি টেক্সট
        ctx.font = `16px "Poppins", "Segoe UI", "Arial"`;
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`${currentExp} / ${expNeeded} XP (${percent}%)`, barX + 10, barY + 19);
        
        // ক্যাশ করুন ও পাঠান
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const imgPath = path.join(cacheDir, `rank_${userID}_${Date.now()}.png`);
        fs.writeFileSync(imgPath, canvas.toBuffer());
        
        await message.reply({
          body: `📊 **RANK CARD**\n━━━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(imgPath)
        });
        
        fs.unlinkSync(imgPath);
      }
      
      // কনফার্মেশন মেসেজ ডিলিট
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      
    } catch (error) {
      console.error("Rank error:", error);
      try { await api.unsendMessage(confirmMsg.messageID); } catch(e) {}
      message.reply("❌ Unable to generate rank card. Please try again.");
    }
  },
  
  onEvent: async function ({ usersData, event }) {
    // এক্সপি আপডেট (প্রতি মেসেজে +1)
    if (event.senderID) {
      try {
        let userData = await usersData.get(event.senderID);
        let currentExp = userData.exp || 0;
        await usersData.set(event.senderID, { exp: currentExp + 1 });
      } catch(e) {}
    }
  }
};
