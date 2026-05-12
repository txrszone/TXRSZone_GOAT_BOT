const axios = require('axios');
const moment = require('moment-timezone');

// Global status
let isInitialized = false;

module.exports = {
  config: {
    name: 'autotime',
    version: '20.0.0',
    author: 'OMOR TE',
    countDown: 3,
    role: 0,
    shortDescription: 'Auto time messages',
    longDescription: 'Automatically sends messages at set times',
    guide: '{p}autotime / {p}autotime on / {p}autotime off',
    category: 'system'
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // Initialize status
    if (typeof global.autotimeStatus === 'undefined') {
      global.autotimeStatus = {};
    }
    if (typeof global.autotimeStatus[threadID] === 'undefined') {
      global.autotimeStatus[threadID] = true;
    }

    const action = args[0]?.toLowerCase();

    // Permission check
    let isAdmin = false;
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      isAdmin = threadInfo.adminIDs?.some(admin => admin.id == senderID) || false;
    } catch(e) {}
    
    // Handle on/off
    if (action === 'on') {
      if (!isAdmin) return message.reply("❌ শুধু গ্রুপ এডমিনরা চালু করতে পারবেন।");
      global.autotimeStatus[threadID] = true;
      return message.reply("✅ **Autotime চালু করা হয়েছে!**\n⏰ এই গ্রুপে সময়ভিত্তিক মেসেজ যাবে।");
    }

    if (action === 'off') {
      if (!isAdmin) return message.reply("❌ শুধু গ্রুপ এডমিনরা বন্ধ করতে পারবেন।");
      global.autotimeStatus[threadID] = false;
      return message.reply("❌ **Autotime বন্ধ করা হয়েছে!**\n⏰ এই গ্রুপে আর মেসেজ যাবে না।");
    }

    // Show status
    const status = global.autotimeStatus[threadID] ? "✅ চালু আছে" : "❌ বন্ধ আছে";
    message.reply(`⏰ **AUTOTIME স্ট্যাটাস**\n━━━━━━━━━━━━━━\n📌 স্ট্যাটাস: ${status}\n━━━━━━━━━━━━━━\n📌 চালু করতে: autotime on\n📌 বন্ধ করতে: autotime off`);
  }
};

// ⏰ Auto-message system (শুধু গ্রুপে)
if (!isInitialized) {
  isInitialized = true;
  
  console.log("✅ Autotime সিস্টেম চালু হয়েছে...");
  
  setInterval(() => {
    const bangladeshTime = moment().tz('Asia/Dhaka');
    const formattedTime = bangladeshTime.format('h:mm:ss A');
    
    const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
    const styles = {
      header: "╔════════════════╗",
      footer: "╚════════════════╝",
      divider: "➖➖➖➖➖➖➖➖➖➖"
    };
    
    const messages = [
      { timer: '12:00:00 AM', msg: `${styles.header}\n  🌜 𝗠𝗶𝗱𝗻𝗶𝗴𝗵𝘁 𝗧𝗿𝗮𝗻𝘀𝗶𝘁𝗶𝗼𝗻 🌛\n${styles.divider}\n${clockEmojis[0]} 𝗡𝗼𝘄: 12:00 AM\n\n» Prepare for sleep 💤\n» Good night! 🌃😴\n» See you tomorrow! ✨\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '1:00:00 AM', msg: `${styles.header}\n  🌙 𝗠𝗶𝗱𝗻𝗶𝗴𝗵𝘁 𝗨𝗽𝗱𝗮𝘁𝗲 🌙\n${styles.divider}\n${clockEmojis[1]} 𝗡𝗼𝘄: 1:00 AM\n\nFinish your missions! ⚓\nRest well! 💤\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '2:00:00 AM', msg: `${styles.header}\n  🌌 𝗟𝗮𝘁𝗲 𝗡𝗶𝗴𝗵𝘁 𝗔𝗹𝗲𝗿𝘁 🌌\n${styles.divider}\n${clockEmojis[2]} 𝗡𝗼𝘄: 2:00 AM\n\nDon't stay up late! 🛌\nSleep now! 💫\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '3:00:00 AM', msg: `${styles.header}\n  🌃 𝗗𝗲𝗲𝗽 𝗡𝗶𝗴𝗵𝘁 🌃\n${styles.divider}\n${clockEmojis[3]} 𝗡𝗼𝘄: 3:00 AM\n\nSweet dreams! 💤\nRest well! ⚓\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '4:00:00 AM', msg: `${styles.header}\n  🌅 𝗙𝗮𝗷𝗿 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝘁𝗶𝗼𝗻 🌅\n${styles.divider}\n${clockEmojis[4]} 𝗡𝗼𝘄: 4:00 AM\n\nPrepare for Fajr prayer 🌙🕌\nSpiritual renewal! 📿\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '5:00:00 AM', msg: `${styles.header}\n  🌄 𝗘𝗮𝗿𝗹𝘆 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 🌄\n${styles.divider}\n${clockEmojis[5]} 𝗡𝗼𝘄: 5:00 AM\n\nStudy time! 📚✍️\nFocus! 💡\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '6:00:00 AM', msg: `${styles.header}\n  ☀️ 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 𝗕𝗿𝗲𝗲𝘇𝗲 ☀️\n${styles.divider}\n${clockEmojis[6]} 𝗡𝗼𝘄: 6:00 AM\n\nGood morning! 😴🌿\nRecharge! 🔋\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '7:00:00 AM', msg: `${styles.header}\n  🌞 𝗚𝗼𝗼𝗱 𝗠𝗼𝗿𝗻𝗶𝗻𝗴! 🌞\n${styles.divider}\n${clockEmojis[7]} 𝗡𝗼𝘄: 7:00 AM\n\n🪥 Brush teeth | 🍳 Breakfast!\nProductive day! 💼\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '8:00:00 AM', msg: `${styles.header}\n  ⚓ 𝗠𝗼𝗱𝗲𝗿𝗻 𝗪𝗮𝗿𝘀𝗵𝗶𝗽𝘀 ⚓\n${styles.divider}\n${clockEmojis[8]} 𝗡𝗼𝘄: 8:00 AM\n\nJoin ★MW Legends★\nDiscord: discord.gg/PQN4P6qSrM\nClan ID: GDT8FL\n"Dominate the seas!" 🌊\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '9:00:00 AM', msg: `${styles.header}\n  💡 𝗕𝗼𝘁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 💡\n${styles.divider}\n${clockEmojis[9]} 𝗡𝗼𝘄: 9:00 AM\n\n📌 Useful Commands:\n» help - All commands\n» mw - MW photos\n» meme - Funny memes\n» owner - Owner info\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '10:00:00 AM', msg: `${styles.header}\n  🎮 𝗚𝗮𝗺𝗶𝗻𝗴 𝗧𝗶𝗺𝗲 🎮\n${styles.divider}\n${clockEmojis[10]} 𝗡𝗼𝘄: 10:00 AM\n\nDownload Modern Warships!\nUltimate naval battles! ⚓\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '11:00:00 AM', msg: `${styles.header}\n  🆘 𝗦𝘂𝗽𝗽𝗼𝗿𝘁 🆘\n${styles.divider}\n${clockEmojis[11]} 𝗡𝗼𝘄: 11:00 AM\n\nJoin our Discord:\ndiscord.gg/PQN4P6qSrM\nGet help & updates!\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '12:00:00 PM', msg: `${styles.header}\n  ☀️ 𝗡𝗼𝗼𝗻 𝗨𝗽𝗱𝗮𝘁𝗲 ☀️\n${styles.divider}\n🕛 𝗡𝗼𝘄: 12:00 PM\n\nPrepare for Dhuhr Prayer! 🕌\nTake a break! 🚿\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '1:00:00 PM', msg: `${styles.header}\n  📺 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 📺\n${styles.divider}\n🕐 𝗡𝗼𝘄: 1:00 PM\n\nSubscribe: TXRS Zone\nyoutube.com/@TXRS_Zone\nSupport me! 🙏\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '2:00:00 PM', msg: `${styles.header}\n  🍽️ 𝗟𝘂𝗻𝗰𝗵𝘁𝗶𝗺𝗲 🍽️\n${styles.divider}\n🕑 𝗡𝗼𝘄: 2:00 PM\n\nFinish your meal! 🍛\nStay energized! 💪\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '3:00:00 PM', msg: `${styles.header}\n  ⚔️ 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 ⚔️\n${styles.divider}\n🕒 𝗡𝗼𝘄: 3:00 PM\n\nSquad up in MW! ⚓\nComplete missions! 📜\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '4:00:00 PM', msg: `${styles.header}\n  🔥 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 𝗚𝗿𝗶𝗻𝗱 🔥\n${styles.divider}\n🕓 𝗡𝗼𝘄: 4:00 PM\n\nKeep dominating! 🌊\nUpgrade warships! 🚀\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '4:30:00 PM', msg: `${styles.header}\n  🌇 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 𝗕𝗿𝗲𝗮𝗸 🌇\n${styles.divider}\n🕟 𝗡𝗼𝘄: 4:30 PM\n\nFinish Asr Prayer 🕌\nOutdoor time! ⚽\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '5:00:00 PM', msg: `${styles.header}\n  🌆 𝗘𝗩𝗘𝗡𝗜𝗡𝗚 𝗧𝗜𝗠𝗘 🌆\n${styles.divider}\n🕔 𝗡𝗼𝘄: 5:00 PM\n\nTake a walk! 🚶\nEnjoy the evening! 🌿\nRelax and recharge! 💭\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '5:30:00 PM', msg: `${styles.header}\n  🌆 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 🌆\n${styles.divider}\n🕠 𝗡𝗼𝘄: 5:30 PM\n\nPrepare for Maghrib Prayer! 🌙\nReflect spiritually! 📿\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '6:00:00 PM', msg: `${styles.header}\n  📚 𝗦𝘁𝘂𝗱𝘆 𝗛𝗼𝘂𝗿𝘀 📚\n${styles.divider}\n🕕 𝗡𝗼𝘄: 6:00 PM\n\nStudy time! 📖\nFocus & learn! 🧠\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '7:30:00 PM', msg: `${styles.header}\n  🌙 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 🌙\n${styles.divider}\n🕢 𝗡𝗼𝘄: 7:30 PM\n\nTake rest!\nPrepare for Isha Prayer 🕌\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '8:05:00 PM', msg: `${styles.header}\n  🌸 𝗠𝘂𝘀𝗹𝗶𝗺 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆 🌸\n${styles.divider}\n🕌 Essence of Belief 🕌\n\nName: Muslim\nCreator: Allah\nIdeal: Muhammad (SAW)\nHoly Book: Quran\nDaily: 5 Prayers\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '8:30:00 PM', msg: `${styles.header}\n  🌃 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 🌃\n${styles.divider}\n🕣 𝗡𝗼𝘄: 8:30 PM\n\nHope you prayed Isha! 🕌\nPeaceful evening! ☁️\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '9:00:00 PM', msg: `${styles.header}\n  🍲 𝗗𝗶𝗻𝗻𝗲𝗿 𝗧𝗶𝗺𝗲 🍲\n${styles.divider}\n🕘 𝗡𝗼𝘄: 9:00 PM\n\nEnjoy your meal! 🍛\nFamily time! 👨‍👩‍👧\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '10:00:00 PM', msg: `${styles.header}\n  ⚓ 𝗡𝗶𝗴𝗵𝘁 𝗕𝗮𝘁𝘁𝗹𝗲𝘀 ⚓\n${styles.divider}\n🕙 𝗡𝗼𝘄: 10:00 PM\n\nNight missions await! 🌙\nMW Legends! ⚓\n${styles.footer}\n👑 fb.com/Omor.TE.16016` },
      { timer: '11:00:00 PM', msg: `${styles.header}\n  🌌 𝗟𝗮𝘁𝗲 𝗡𝗶𝗴𝗵𝘁 🌌\n${styles.divider}\n🕚 𝗡𝗼𝘄: 11:00 PM\n\nStay hydrated! 💧\nTake breaks! ⏸️\n${styles.footer}\n👑 fb.com/Omor.TE.16016` }
    ];
    
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const eventItem = messages.find(item => item.timer === formattedTime);
    
    if (eventItem && global.autotimeStatus) {
      // শুধু গ্রুপে পাঠানো হবে
      const allThreads = global.data?.allThreadID || [];
      
      allThreads.forEach(threadID => {
        if (global.autotimeStatus[threadID] === true) {
          // গ্রুপ চেক (মেসেঞ্জার গ্রুপ সাধারণত negative number হয় না)
          if (threadID > 0) {
            try {
              api.sendMessage(r(eventItem.msg), threadID);
            } catch(e) {}
          }
        }
      });
    }
  }, 1000);
}

// API globally accessible করার জন্য
process.on('message', (msg) => {
  if (msg && msg.type === 'api') {
    global.api = msg.api;
  }
});
