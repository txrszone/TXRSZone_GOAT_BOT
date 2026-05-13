const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const { randomString } = global.utils;

const percentage = total => total / 100;

// ফন্ট রেজিস্টার (যদি ফাইল থাকে)
const fontBoldPath = `${__dirname}/assets/font/BeVietnamPro-Bold.ttf`;
const fontSemiBoldPath = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;

if (fs.existsSync(fontBoldPath)) {
  Canvas.registerFont(fontBoldPath, { family: "BeVietnamPro-Bold" });
}
if (fs.existsSync(fontSemiBoldPath)) {
  Canvas.registerFont(fontSemiBoldPath, { family: "BeVietnamPro-SemiBold" });
}

let deltaNext = 5;
const expToLevel = (exp, deltaNextLevel = deltaNext) => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
const levelToExp = (level, deltaNextLevel = deltaNext) => Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);

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
    let targetUsers;
    const arrayMentions = Object.keys(event.mentions);

    if (arrayMentions.length == 0)
      targetUsers = [event.senderID];
    else
      targetUsers = arrayMentions;

    const rankCards = [];
    
    for (const userID of targetUsers) {
      try {
        const rankCard = await makeRankCard(userID, usersData, threadsData, event.threadID, deltaNext, api);
        const imgPath = path.join(__dirname, "cache", `${randomString(10)}.png`);
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        // Stream থেকে ফাইল সেভ করা
        const chunks = [];
        for await (const chunk of rankCard) {
          chunks.push(chunk);
        }
        fs.writeFileSync(imgPath, Buffer.concat(chunks));
        
        rankCards.push(fs.createReadStream(imgPath));
        
        // ফাইল ডিলিট করার জন্য টাইমার
        setTimeout(() => {
          try { fs.unlinkSync(imgPath); } catch(e) {}
        }, 10000);
      } catch(e) {
        console.error("Rank card error for user", userID, e);
      }
    }

    if (rankCards.length === 0) {
      return message.reply("❌ র‍্যাঙ্ক কার্ড জেনারেট করতে ব্যর্থ হয়েছে।");
    }

    return message.reply({
      attachment: rankCards
    });
  },

  onEvent: async function ({ usersData, event }) {
    if (!event.senderID) return;
    try {
      let { exp } = await usersData.get(event.senderID);
      if (isNaN(exp) || typeof exp != "number") exp = 0;
      await usersData.set(event.senderID, { exp: exp + 1 });
    } catch (e) { }
  }
};

const defaultDesignCard = {
  widthCard: 2000,
  heightCard: 500,
  main_color: "#474747",
  sub_color: "rgba(255, 255, 255, 0.5)",
  alpha_subcard: 0.9,
  exp_color: "#e1e1e1",
  expNextLevel_color: "#3f3f3f",
  text_color: "#000000"
};

async function makeRankCard(userID, usersData, threadsData, threadID, deltaNext, api = null) {
  const userData = await usersData.get(userID);
  const exp = userData.exp || 0;
  const levelUser = expToLevel(exp, deltaNext);

  const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
  const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);

  const allUser = await usersData.getAll();
  allUser.sort((a, b) => (b.exp || 0) - (a.exp || 0));
  const rank = allUser.findIndex(user => user.userID == userID) + 1;
  const userName = userData.name || (await usersData.getName(userID)) || "User";
  const avatarUrl = await usersData.getAvatarUrl(userID);

  const dataLevel = {
    exp: currentExp,
    expNextLevel,
    name: userName,
    rank: `#${rank}/${allUser.length}`,
    level: levelUser,
    avatar: avatarUrl
  };

  const image = new RankCard({
    ...defaultDesignCard,
    ...dataLevel
  });
  return await image.buildCard();
}

class RankCard {
  constructor(options) {
    this.widthCard = 2000;
    this.heightCard = 500;
    this.main_color = "#474747";
    this.sub_color = "rgba(255, 255, 255, 0.5)";
    this.alpha_subcard = 0.9;
    this.exp_color = "#e1e1e1";
    this.expNextLevel_color = "#3f3f3f";
    this.text_color = "#000000";
    this.fontName = "BeVietnamPro-Bold";
    this.textSize = 0;

    for (const key in options)
      this[key] = options[key];
  }

  async buildCard() {
    let { widthCard, heightCard } = this;
    const {
      main_color, sub_color, alpha_subcard, exp_color, expNextLevel_color,
      text_color, name_color, level_color, rank_color, line_color, exp_text_color,
      exp, expNextLevel, name, level, rank, avatar
    } = this;

    widthCard = Number(widthCard);
    heightCard = Number(heightCard);

    const canvas = Canvas.createCanvas(widthCard, heightCard);
    const ctx = canvas.getContext("2d");

    const alignRim = 3 * percentage(widthCard);
    const Alpha = parseFloat(alpha_subcard || 0);

    ctx.globalAlpha = Alpha;
    await this.checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20);
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = "destination-out";

    const xyAvatar = heightCard / 2;
    const resizeAvatar = 60 * percentage(heightCard);

    const widthLineBetween = 58 * percentage(widthCard);
    const heightLineBetween = 2 * percentage(heightCard);
    const angleLineCenter = 40;
    const edge = heightCard / 2 * Math.tan(angleLineCenter * Math.PI / 180);

    if (line_color) {
      if (!this.isUrl(line_color)) {
        ctx.fillStyle = ctx.strokeStyle = this.checkGradientColor(ctx,
          Array.isArray(line_color) ? line_color : [line_color],
          xyAvatar - resizeAvatar / 2 - heightLineBetween, 0,
          xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0
        );
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.save();
        const img = await Canvas.loadImage(line_color);
        ctx.globalCompositeOperation = "source-over";

        ctx.beginPath();
        ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
        ctx.fill();

        ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
        ctx.fill();

        ctx.translate(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
        ctx.rotate(angleLineCenter * Math.PI / 180);
        ctx.rect(0, 0, heightLineBetween, 1000);
        ctx.fill();
        ctx.rotate(-angleLineCenter * Math.PI / 180);
        ctx.translate(-xyAvatar - resizeAvatar / 2 - widthLineBetween - edge, 0);

        ctx.clip();
        ctx.drawImage(await img, 0, 0, widthCard, heightCard);
        ctx.restore();
      }
    }
    ctx.beginPath();
    if (!this.isUrl(line_color))
      ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
    ctx.fill();

    ctx.beginPath();
    if (!this.isUrl(line_color)) {
      ctx.moveTo(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
      ctx.lineTo(xyAvatar + resizeAvatar / 2 + widthLineBetween - edge, heightCard);
      ctx.lineWidth = heightLineBetween;
      ctx.stroke();
    }

    ctx.beginPath();
    if (!this.isUrl(line_color))
      ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";

    ctx.fillRect(0, 0, widthCard, alignRim);
    ctx.fillRect(0, heightCard - alignRim, widthCard, alignRim);

    const radius = 6 * percentage(heightCard);
    const xStartExp = (25 + 1.5) * percentage(widthCard),
      yStartExp = 67 * percentage(heightCard),
      widthExp = 40.5 * percentage(widthCard),
      heightExp = radius * 2;
    ctx.globalCompositeOperation = "source-over";
    
    try {
      const avatarImg = await Canvas.loadImage(avatar);
      this.centerImage(ctx, avatarImg, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);
    } catch(e) {}

    // Draw Exp bar background
    if (!this.isUrl(expNextLevel_color)) {
      ctx.beginPath();
      ctx.fillStyle = this.checkGradientColor(ctx, expNextLevel_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
      ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
      ctx.fill();
      ctx.fillRect(xStartExp, yStartExp, widthExp, heightExp);
      ctx.arc(xStartExp + widthExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
      ctx.fill();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xStartExp, yStartExp);
      ctx.lineTo(xStartExp + widthExp, yStartExp);
      ctx.arcTo(xStartExp + widthExp + radius, yStartExp, xStartExp + widthExp + radius, yStartExp + radius, radius);
      ctx.lineTo(xStartExp + widthExp + radius, yStartExp + heightExp - radius);
      ctx.arcTo(xStartExp + widthExp + radius, yStartExp + heightExp, xStartExp + widthExp, yStartExp + heightExp, radius);
      ctx.lineTo(xStartExp, yStartExp + heightExp);
      ctx.arcTo(xStartExp, yStartExp + heightExp, xStartExp - radius, yStartExp + heightExp - radius, radius);
      ctx.lineTo(xStartExp - radius, yStartExp + radius);
      ctx.arcTo(xStartExp, yStartExp, xStartExp, yStartExp, radius);
      ctx.closePath();
      ctx.clip();
      const expBarImg = await Canvas.loadImage(expNextLevel_color);
      ctx.drawImage(expBarImg, xStartExp, yStartExp, widthExp + radius, heightExp);
      ctx.restore();
    }

    const widthExpCurrent = (100 / expNextLevel * exp) * percentage(widthExp);
    if (!this.isUrl(exp_color)) {
      ctx.fillStyle = this.checkGradientColor(ctx, exp_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
      ctx.beginPath();
      ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
      ctx.fill();
      ctx.fillRect(xStartExp, yStartExp, widthExpCurrent, heightExp);
      ctx.beginPath();
      ctx.arc(xStartExp + widthExpCurrent - 1, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.fill();
    } else {
      const imgExp = await Canvas.loadImage(exp_color);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xStartExp, yStartExp);
      ctx.lineTo(xStartExp + widthExpCurrent, yStartExp);
      ctx.arc(xStartExp + widthExpCurrent, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
      ctx.lineTo(xStartExp + widthExpCurrent + radius, yStartExp + heightExp - radius);
      ctx.arcTo(xStartExp + widthExpCurrent + radius, yStartExp + heightExp, xStartExp + widthExpCurrent, yStartExp + heightExp, radius);
      ctx.lineTo(xStartExp, yStartExp + heightExp);
      ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
      ctx.lineTo(xStartExp - radius, yStartExp + radius);
      ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(imgExp, xStartExp - radius, yStartExp, widthExp + radius * 2, heightExp);
      ctx.restore();
    }

    const maxSizeFont_Name = 4 * percentage(widthCard) + this.textSize;
    const maxSizeFont_Exp = 2 * percentage(widthCard) + this.textSize;
    const maxSizeFont_Level = 3.25 * percentage(widthCard) + this.textSize;
    const maxSizeFont_Rank = 4 * percentage(widthCard) + this.textSize;

    ctx.textAlign = "end";

    // Draw Rank
    ctx.font = this.autoSizeFont(18.4 * percentage(widthCard), maxSizeFont_Rank, rank, ctx, this.fontName);
    const metricsRank = ctx.measureText(rank);
    ctx.fillStyle = this.checkGradientColor(ctx, rank_color || text_color,
      94 * percentage(widthCard) - metricsRank.width,
      76 * percentage(heightCard) + metricsRank.emHeightDescent,
      94 * percentage(widthCard),
      76 * percentage(heightCard) - metricsRank.actualBoundingBoxAscent
    );
    ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));

    // Draw Level
    const textLevel = `Lv ${level}`;
    ctx.font = this.autoSizeFont(9.8 * percentage(widthCard), maxSizeFont_Level, textLevel, ctx, this.fontName);
    const metricsLevel = ctx.measureText(textLevel);
    const xStartLevel = 94 * percentage(widthCard);
    const yStartLevel = 32 * percentage(heightCard);
    ctx.fillStyle = this.checkGradientColor(ctx, level_color || text_color,
      xStartLevel - ctx.measureText(textLevel).width,
      yStartLevel + metricsLevel.emHeightDescent,
      xStartLevel,
      yStartLevel - metricsLevel.actualBoundingBoxAscent
    );
    ctx.fillText(textLevel, xStartLevel, yStartLevel);
    
    ctx.font = this.autoSizeFont(52.1 * percentage(widthCard), maxSizeFont_Name, name, ctx, this.fontName);
    ctx.textAlign = "center";

    // Draw Name
    const metricsName = ctx.measureText(name);
    ctx.fillStyle = this.checkGradientColor(ctx, name_color || text_color,
      47.5 * percentage(widthCard) - metricsName.width / 2,
      40 * percentage(heightCard) + metricsName.emHeightDescent,
      47.5 * percentage(widthCard) + metricsName.width / 2,
      40 * percentage(heightCard) - metricsName.actualBoundingBoxAscent
    );
    ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

    // Draw Exp text
    const textExp = `Exp ${exp}/${expNextLevel}`;
    ctx.font = this.autoSizeFont(49 * percentage(widthCard), maxSizeFont_Exp, textExp, ctx, this.fontName);
    const metricsExp = ctx.measureText(textExp);
    ctx.fillStyle = this.checkGradientColor(ctx, exp_text_color || text_color,
      47.5 * percentage(widthCard) - metricsExp.width / 2,
      61.4 * percentage(heightCard) + metricsExp.emHeightDescent,
      47.5 * percentage(widthCard) + metricsExp.width / 2,
      61.4 * percentage(heightCard) - metricsExp.actualBoundingBoxAscent
    );
    ctx.fillText(textExp, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

    // Draw MAIN CARD BACKGROUND
    ctx.globalCompositeOperation = "destination-over";
    if (main_color?.match?.(/^https?:\/\//) || Buffer.isBuffer(main_color)) {
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(widthCard - radius, 0);
      ctx.quadraticCurveTo(widthCard, 0, widthCard, radius);
      ctx.lineTo(widthCard, heightCard - radius);
      ctx.quadraticCurveTo(widthCard, heightCard, widthCard - radius, heightCard);
      ctx.lineTo(radius, heightCard);
      ctx.quadraticCurveTo(0, heightCard, 0, heightCard - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      const bgImg = await Canvas.loadImage(main_color);
      ctx.drawImage(bgImg, 0, 0, widthCard, heightCard);
    } else {
      ctx.fillStyle = this.checkGradientColor(ctx, main_color, 0, 0, widthCard, heightCard);
      this.drawSquareRounded(ctx, 0, 0, widthCard, heightCard, radius, main_color);
    }
    return canvas.createPNGStream();
  }

  async checkColorOrImageAndDraw(xStart, yStart, width, height, ctx, colorOrImage, r) {
    if (!colorOrImage?.match?.(/^https?:\/\//)) {
      if (Array.isArray(colorOrImage)) {
        const gradient = ctx.createLinearGradient(xStart, yStart, xStart + width, yStart + height);
        colorOrImage.forEach((color, index) => {
          gradient.addColorStop(index / (colorOrImage.length - 1), color);
        });
        ctx.fillStyle = gradient;
      }
      this.drawSquareRounded(ctx, xStart, yStart, width, height, r, colorOrImage);
    } else {
      const imageLoad = await Canvas.loadImage(colorOrImage);
      ctx.save();
      this.roundedImage(xStart, yStart, width, height, r, ctx);
      ctx.clip();
      ctx.drawImage(imageLoad, xStart, yStart, width, height);
      ctx.restore();
    }
  }

  drawSquareRounded(ctx, x, y, w, h, r, color) {
    ctx.save();
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (color) ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  roundedImage(x, y, width, height, radius, ctx) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  centerImage(ctx, img, xCenter, yCenter, w, h) {
    const x = xCenter - w / 2;
    const y = yCenter - h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(xCenter, yCenter, w / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  autoSizeFont(maxWidthText, maxSizeFont, text, ctx, fontName) {
    let sizeFont = 1;
    while (sizeFont < maxSizeFont) {
      ctx.font = sizeFont + "px " + fontName;
      if (ctx.measureText(text).width > maxWidthText) break;
      sizeFont++;
    }
    return (sizeFont - 1) + "px " + fontName;
  }

  checkGradientColor(ctx, color, x1, y1, x2, y2) {
    if (Array.isArray(color)) {
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      color.forEach((c, index) => {
        gradient.addColorStop(index / (color.length - 1), c);
      });
      return gradient;
    }
    return color;
  }

  isUrl(string) {
    if (typeof string !== 'string') return false;
    try { new URL(string); return true; } catch (err) { return false; }
  }
}
