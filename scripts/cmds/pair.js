const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    aliases: ["match", "couple"],
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Pair random members",
    longDescription: "Pair two random members of opposite gender",
    category: "fun",
    guide: "{p}pair"
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let pathImg = path.join(cacheDir, "background.png");
    let pathAvt1 = path.join(cacheDir, "Avtmot.png");
    let pathAvt2 = path.join(cacheDir, "Avthai.png");

    try {
      const id1 = event.senderID;
      const userInfo1 = await api.getUserInfo(id1);
      const name1 = userInfo1[id1]?.name || "User 1";

      const threadInfo = await api.getThreadInfo(event.threadID);
      const all = threadInfo.userInfo || [];

      if (all.length < 2) {
        return api.sendMessage("❌ Not enough members to pair!", event.threadID, event.messageID);
      }

      let gender1 = "MALE";
      for (let c of all) {
        if (c.id == id1) {
          gender1 = c.gender || "MALE";
          break;
        }
      }

      const botID = api.getCurrentUserID();
      let candidates = [];

      if (gender1 === "FEMALE") {
        candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else if (gender1 === "MALE") {
        candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else {
        candidates = all.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
      }

      if (!candidates.length) {
        return api.sendMessage("❌ No suitable partner found for pairing.", event.threadID, event.messageID);
      }

      const id2 = candidates[Math.floor(Math.random() * candidates.length)];
      const userInfo2 = await api.getUserInfo(id2);
      const name2 = userInfo2[id2]?.name || "User 2";

      // Random match rate
      const rd1 = Math.floor(Math.random() * 100) + 1;
      const specialRates = ["∞", "💯", "✨", "🌹", "💖", "❤️"];
      const rd2 = specialRates[Math.floor(Math.random() * specialRates.length)];
      const matchRate = Math.random() > 0.8 ? rd2 : `${rd1}%`;

      const notes = [
        "Every time I see you, my heart skips a beat.",
        "You're my today and all of my tomorrows.",
        "In your smile, I see something more beautiful than the stars.",
        "You make my heart race without even trying.",
        "Every love story is beautiful, but ours is my favorite.",
        "You're my favorite place to go when my mind searches for peace.",
        "Your eyes hold the key to my soul.",
        "I didn't choose you, my heart did.",
        "With you, every moment becomes a memory.",
        "You're the reason I believe in love."
      ];
      const lovelyNote = notes[Math.floor(Math.random() * notes.length)];

      const background = "https://i.postimg.cc/nrgPFtDG/Picsart-25-08-12-20-22-41-970.png";

      // Download images
      const avt1Res = await axios.get(`https://graph.facebook.com/${id1}/picture?width=512&height=512`, { responseType: "arraybuffer" });
      fs.writeFileSync(pathAvt1, Buffer.from(avt1Res.data));

      const avt2Res = await axios.get(`https://graph.facebook.com/${id2}/picture?width=512&height=512`, { responseType: "arraybuffer" });
      fs.writeFileSync(pathAvt2, Buffer.from(avt2Res.data));

      const bgRes = await axios.get(background, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(bgRes.data));

      // Create canvas
      const baseImage = await loadImage(pathImg);
      const imgAvt1 = await loadImage(pathAvt1);
      const imgAvt2 = await loadImage(pathAvt2);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgAvt1, 120, 170, 300, 300);
      ctx.drawImage(imgAvt2, canvas.width - 420, 170, 300, 300);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.unlinkSync(pathAvt1);
      fs.unlinkSync(pathAvt2);

      // ✅ Goat Bot-এর জন্য সঠিক মেনশন ফরম্যাট
      const kawaiiMessage = `🌸💞 *Cᴏɴɢʀᴀᴛs* 💞🌸

✨ ${name1} ✨  &  ✨ ${name2} ✨

💖 *Mᴀᴛᴄʜ Rᴀᴛᴇ:* ${matchRate} 💖

🌷 𝓛𝓸𝓿𝓮𝓵𝔂 𝓝𝓸𝓽𝓮 🌷
❝ ${lovelyNote} ❞

💫 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒎𝒚 𝒔𝒖𝒏𝒔𝒉𝒊𝒏𝒆! 💫`;

      // ✅ সঠিক মেনশন ফরম্যাট (Goat Bot-এর জন্য)
      return api.sendMessage({
        body: kawaiiMessage,
        mentions: [
          { tag: name1, id: id1 },
          { tag: name2, id: id2 }
        ],
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => {
        try { fs.unlinkSync(pathImg); } catch(e) {}
      }, event.messageID);

    } catch (error) {
      console.error("Pair error:", error);
      // Cleanup files on error
      try { fs.unlinkSync(pathImg); } catch(e) {}
      try { fs.unlinkSync(pathAvt1); } catch(e) {}
      try { fs.unlinkSync(pathAvt2); } catch(e) {}
      return api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
