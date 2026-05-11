const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
    name: 'autotime',
    version: '15.2.0',
    hasPermssion: 0,
    credits: 'OMOR TE',
    description: 'Automatically sends messages at set times (on/off control)',
    commandCategory: 'group messenger',
    usages: '[on/off]',
    cooldowns: 3
};

const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
const styles = {
    header: "╔════════════════╗",
    footer: "╚════════════════╝",
    divider: "➖➖➖➖➖➖➖➖➖➖"
};

// Global variable with default ON status
global.autotimeStatus = global.autotimeStatus || {};

const nam = [
    {
        timer: '12:00:00 AM',
        message: [`${styles.header}\n  🌜 𝗠𝗶𝗱𝗻𝗶𝗴𝗵𝘁 𝗧𝗿𝗮𝗻𝘀𝗶𝘁𝗶𝗼𝗻 🌛\n${styles.divider}\n${clockEmojis[0]} 𝗡𝗼𝘄: 12:00 AM\n\n» Prepare for sleep 💤\n» Good night commanders! 🌃😴\n» See you tomorrow! ✨🌄\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '1:00:00 AM',
        message: [`${styles.header}\n  🌙 𝗠𝗶𝗱𝗻𝗶𝗴𝗵𝘁 𝗨𝗽𝗱𝗮𝘁𝗲 🌙\n${styles.divider}\n${clockEmojis[1]} 𝗡𝗼𝘄: 1:00 AM\n\n𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝗲𝗿𝘀! Completed your Modern Warships missions? ⚓⏳\nFinish fast and rest well! ⚡💤\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '2:00:00 AM',
        message: [`${styles.header}\n  🌌 𝗟𝗮𝘁𝗲 𝗡𝗶𝗴𝗵𝘁 𝗔𝗹𝗲𝗿𝘁 🌌\n${styles.divider}\n${clockEmojis[2]} 𝗡𝗼𝘄: 2:00 AM\n\n𝗗𝗼𝗻'𝘁 𝘀𝘁𝗮𝘆 𝘂𝗽 𝗹𝗮𝘁𝗲! 🛌🌠\nSleep now for an energetic tomorrow! 💫⚡\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '3:00:00 AM',
        message: [`${styles.header}\n  🌃 𝗗𝗲𝗲𝗽 𝗡𝗶𝗴𝗵𝘁 🌃\n${styles.divider}\n${clockEmojis[3]} 𝗡𝗼𝘄: 3:00 AM\n\nSweet dreams, commanders! 💤🌉\nRest well for tomorrow's battles! ⚓✨\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '4:00:00 AM',
        message: [`${styles.header}\n  🌅 𝗙𝗮𝗷𝗿 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝘁𝗶𝗼𝗻 🌅\n${styles.divider}\n${clockEmojis[4]} 𝗡𝗼𝘄: 4:00 AM\n\nPrepare for Fajr prayer 🌙🕌\nSpiritual renewal time! 📿🙏\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '5:00:00 AM',
        message: [`${styles.header}\n  🌄 𝗘𝗮𝗿𝗹𝘆 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 🌄\n${styles.divider}\n${clockEmojis[5]} 𝗡𝗼𝘄: 5:00 AM\n\nEarly risers! Students start studying now! 📚✍️\nPerfect time for focus! 💡🧠\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '6:00:00 AM',
        message: [`${styles.header}\n  ☀️ 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 𝗕𝗿𝗲𝗲𝘇𝗲 ☀️\n${styles.divider}\n${clockEmojis[6]} 𝗡𝗼𝘄: 6:00 AM\n\nRefresh with morning nap! 😴🌿\nRecharge for the day ahead! 🔋⚡\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '6:05:00 AM',
        message: [`${styles.header}\n  🌸 𝗠𝘂𝘀𝗹𝗶𝗺 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆 🌸\n${styles.divider}\n🕌 𝗘𝘀𝘀𝗲𝗻𝗰𝗲 𝗼𝗳 𝗕𝗲𝗹𝗶𝗲𝗳 🕌\n\n• 𝗡𝗮𝗺𝗲: Muslim\n• 𝗙𝗮𝘁𝗵𝗲𝗿: Adam (AS)\n• 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: Allah\n• 𝗜𝗱𝗲𝗮𝗹: Muhammad (SAW)\n• 𝗛𝗼𝗹𝘆 𝗕𝗼𝗼𝗸: Quran\n• 𝗗𝗮𝗶𝗹𝘆 𝗥𝗼𝘂𝘁𝗶𝗻𝗲: 5 Prayers\n• 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆: لَا إِلٰهَ إِلَّا الله مُحَمَّدٌ رَسُولُ الله\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '7:00:00 AM',
        message: [`${styles.header}\n  🌞 𝗚𝗼𝗼𝗱 𝗠𝗼𝗿𝗻𝗶𝗻𝗴! 🌞\n${styles.divider}\n${clockEmojis[7]} 𝗡𝗼𝘄: 7:00 AM\n\n🪥 Brush teeth | 🍳 Breakfast time!\nPrepare for productive day! 💼📈\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '8:00:00 AM',
        message: [`${styles.header}\n  ⚓ 𝗠𝗼𝗱𝗲𝗿𝗻 𝗪𝗮𝗿𝘀𝗵𝗶𝗽𝘀 𝗨𝗽𝗱𝗮𝘁𝗲 ⚓\n${styles.divider}\n${clockEmojis[8]} 𝗡𝗼𝘄: 8:00 AM\n\n🌟 𝗝𝗼𝗶𝗻 𝗘𝗹𝗶𝘁𝗲 𝗖𝗹𝗮𝗻: ★MW Legends★\n➤ Level 15+ | 150 pts/week\n➤ Discord: https://discord.gg/PQN4P6qSrM\n➤ Clan ID: GDT8FL\n"𝗗𝗼𝗺𝗶𝗻𝗮𝘁𝗲 𝘁𝗵𝗲 𝘀𝗲𝗮𝘀!" 🌊🔥\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '9:00:00 AM',
        message: [`${styles.header}\n  💡 𝗕𝗼𝘁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗚𝘂𝗶𝗱𝗲 💡\n${styles.divider}\n${clockEmojis[9]} 𝗡𝗼𝘄: 9:00 AM\n\n📌 𝗨𝘀𝗲𝗳𝘂𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:\n» /help - All commands\n» /mw - Modern Warships photos\n» /meme - Funny memes\n» /admin - Owner info\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '10:00:00 AM',
        message: [`${styles.header}\n  🎮 𝗚𝗮𝗺𝗶𝗻𝗴 𝗧𝗶𝗺𝗲 🎮\n${styles.divider}\n${clockEmojis[10]} 𝗡𝗼𝘄: 10:00 AM\n\n👇 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗡𝗼𝘄!\n» Modern Warships (Play Store)\n» Ultimate naval battles! ⚓💥\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '11:00:00 AM',
        message: [`${styles.header}\n  🆘 𝗦𝘂𝗽𝗽𝗼𝗿𝘁 𝗖𝗵𝗮𝗻𝗻𝗲𝗹𝘀 🆘\n${styles.divider}\n${clockEmojis[11]} 𝗡𝗼𝘄: 11:00 AM\n\n🔗 𝗝𝗼𝗶𝗻 𝗼𝘂𝗿 𝗗𝗶𝘀𝗰𝗼𝗿𝗱:\n» https://discord.gg/PQN4P6qSrM\n» Get help & updates!\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '11:15:00 AM',
        message: [`${styles.header}\n  ℹ️ 𝗠𝗼𝗱𝗲𝗿𝗻 𝗪𝗮𝗿𝘀𝗵𝗶𝗽𝘀 𝗜𝗻𝘁𝗿𝗼 ℹ️\n${styles.divider}\n⛴️ 𝗪𝗵𝗮𝘁 𝗶𝘀 𝗠𝗪?\n» PvP naval combat game\n» Real warships & customization\n» Strategic battles & clans\n» Stunning Ultra graphics\n» FREE to play (with in-app)\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '12:30:00 PM',
        message: [`${styles.header}\n  ☀️ 𝗠𝗶𝗱𝗱𝗮𝘆 𝗨𝗽𝗱𝗮𝘁𝗲 ☀️\n${styles.divider}\n🕧 𝗡𝗼𝘄: 12:30 PM\n\nPrepare for Dhuhr Prayer! 🕌📿\nTake short break & refresh! 🚿💦\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '1:00:00 PM',
        message: [`${styles.header}\n  📺 𝗖𝗿𝗲𝗮𝘁𝗼𝗿'𝘀 𝗬𝗧 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 📺\n${styles.divider}\n🕐 𝗡𝗼𝘄: 1:00 PM\n\n🌟 𝗦𝘂𝗯𝘀𝗰𝗿𝗶𝗯𝗲 𝗻𝗼𝘄:\n» TXRS Zone\n» https://youtube.com/@TXRS_Zone \nSupport my journey! 🙏❤️\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '2:00:00 PM',
        message: [`${styles.header}\n  🍽️ 𝗟𝘂𝗻𝗰𝗵𝘁𝗶𝗺𝗲 𝗥𝗲𝗺𝗶𝗻𝗱𝗲𝗿 🍽️\n${styles.divider}\n🕑 𝗡𝗼𝘄: 2:00 PM\n\nFinish your meal commanders! 🍛🥗\nStay nourished & energized! 💪🔋\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '3:00:00 PM',
        message: [`${styles.header}\n  ⚔️ 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 𝗕𝗮𝘁𝘁𝗹𝗲𝘀 ⚔️\n${styles.divider}\n🕒 𝗡𝗼𝘄: 3:00 PM\n\nSquad up in Modern Warships! ⚓🎯\nComplete daily missions! 📜✅\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '4:00:00 PM',
        message: [`${styles.header}\n  🔥 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 𝗚𝗿𝗶𝗻𝗱 🔥\n${styles.divider}\n🕓 𝗡𝗼𝘄: 4:00 PM\n\nKeep dominating the seas! 🌊⚓\nUpgrade your warships! 🚀🔧\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '4:30:00 PM',
        message: [`${styles.header}\n  🌇 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 𝗕𝗿𝗲𝗮𝗸 🌇\n${styles.divider}\n🕟 𝗡𝗼𝘄: 4:30 PM\n\n» Finish Asr Prayer 🕌\n» Outdoor activities time! ⚽🏸\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '5:30:00 PM',
        message: [`${styles.header}\n  🌆 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 𝗧𝗿𝗮𝗻𝘀𝗶𝘁𝗶𝗼𝗻 🌆\n${styles.divider}\n🕠 𝗡𝗼𝘄: 5:30 PM\n\nPrepare for Maghrib Prayer! 🌙🕌\nReflect & recharge spiritually! 📿🤲\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '6:00:00 PM',
        message: [`${styles.header}\n  📚 𝗦𝘁𝘂𝗱𝘆 𝗛𝗼𝘂𝗿𝘀 📚\n${styles.divider}\n🕕 𝗡𝗼𝘄: 6:00 PM\n\nStudents start studying! 📖✍️\nFocus & learn effectively! 🧠💡\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '7:30:00 PM',
        message: [`${styles.header}\n  🌙 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 𝗥𝗲𝗹𝗮𝘅𝗮𝘁𝗶𝗼𝗻 🌙\n${styles.divider}\n🕢 𝗡𝗼𝘄: 7:30 PM\n\n» Take quality rest\n» Prepare for Isha Prayer 🕌\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '8:05:00 PM',
        message: [`${styles.header}\n  🌸 𝗠𝘂𝘀𝗹𝗶𝗺 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆 🌸\n${styles.divider}\n🕌 𝗘𝘀𝘀𝗲𝗻𝗰𝗲 𝗼𝗳 𝗕𝗲𝗹𝗶𝗲𝗳 🕌\n\n• 𝗡𝗮𝗺𝗲: Muslim\n• 𝗙𝗮𝘁𝗵𝗲𝗿: Adam (AS)\n• 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: Allah\n• 𝗜𝗱𝗲𝗮𝗹: Muhammad (SAW)\n• 𝗛𝗼𝗹𝘆 𝗕𝗼𝗼𝗸: Quran\n• 𝗗𝗮𝗶𝗹𝘆 𝗥𝗼𝘂𝘁𝗶𝗻𝗲: 5 Prayers\n• 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆: لَا إِلٰهَ إِلَّا الله مُحَمَّدٌ رَسُولُ الله\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016`]
    },
    {
        timer: '8:30:00 PM',
        message: [`${styles.header}\n  🌃 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 𝗥𝗲𝗳𝗹𝗲𝗰𝘁𝗶𝗼𝗻 🌃\n${styles.divider}\n🕣 𝗡𝗼𝘄: 8:30 PM\n\nHope you completed Isha Prayer! 🕌🤲\nPeaceful evening vibes! ☁️✨\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '9:00:00 PM',
        message: [`${styles.header}\n  🍲 𝗗𝗶𝗻𝗻𝗲𝗿 𝗧𝗶𝗺𝗲 🍲\n${styles.divider}\n🕘 𝗡𝗼𝘄: 9:00 PM\n\nEnjoy your meal commanders! 🍛🥘\nFamily time & conversations! 👨‍👩‍👧‍👦💬\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '10:00:00 PM',
        message: [`${styles.header}\n  ⚓ 𝗡𝗶𝗴𝗵𝘁 𝗕𝗮𝘁𝘁𝗹𝗲𝘀 ⚓\n${styles.divider}\n🕙 𝗡𝗼𝘄: 10:00 PM\n\nSail into Modern Warships! 🌊🚢\nNight combat missions await! 🌙🎯\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    },
    {
        timer: '11:00:00 PM',
        message: [`${styles.header}\n  🌌 𝗟𝗮𝘁𝗲 𝗡𝗶𝗴𝗵𝘁 𝗦𝗲𝘀𝘀𝗶𝗼𝗻 🌌\n${styles.divider}\n🕚 𝗡𝗼𝘄: 11:00 PM\n\nCommanders conquering seas! ⚓🌊\nStay hydrated & take breaks! 💧⏸️\n${styles.footer}\n👑 Owner: https://fb.com/Omor.TE.16016 \n✨ 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ★OMOR TE★`]
    }
];

module.exports.onLoad = async (o) => {
    if (global.autotimeInterval) clearInterval(global.autotimeInterval);
    
    global.autotimeInterval = setInterval(() => {
        const bangladeshTime = moment().tz('Asia/Dhaka');
        const formattedTime = bangladeshTime.format('h:mm:ss A');
        
        const r = arr => arr[Math.floor(Math.random() * arr.length)];
        const event = nam.find(item => item.timer === formattedTime);
        
        if (event) {
            console.log(`[AUTOTIME] ${formattedTime} triggered`);
            global.data.allThreadID.forEach(threadID => {
                // Default ON for new groups
                if (typeof global.autotimeStatus[threadID] === 'undefined') {
                    global.autotimeStatus[threadID] = true;
                }
                
                if (global.autotimeStatus[threadID]) {
                    o.api.sendMessage(r(event.message), threadID);
                }
            });
        }
    }, 1000);
};

module.exports.run = async ({ api, event, args }) => {
    const threadID = event.threadID;
    
    // Initialize if not exists (default ON)
    if (typeof global.autotimeStatus[threadID] === 'undefined') {
        global.autotimeStatus[threadID] = true;
    }
    
    try {
        // Check if user is bot admin or group admin
        const isBotAdmin = global.config.ADMINBOT.includes(event.senderID.toString());
        const threadInfo = await api.getThreadInfo(threadID);
        const isGroupAdmin = threadInfo.adminIDs.some(admin => admin.id == event.senderID);
        const hasPermission = isBotAdmin || isGroupAdmin;
        
        switch (args[0]?.toLowerCase()) {
            case 'on':
                if (!hasPermission) {
                    return api.sendMessage("❌ Only bot admins or group admins can enable autotime.", threadID);
                }
                global.autotimeStatus[threadID] = true;
                api.sendMessage("🟢 **Autotime ENABLED** - Hourly messages will be sent in this group.", threadID);
                break;
                
            case 'off':
                if (!hasPermission) {
                    return api.sendMessage("❌ Only bot admins or group admins can disable autotime.", threadID);
                }
                global.autotimeStatus[threadID] = false;
                api.sendMessage("🔴 **Autotime DISABLED** - No more hourly messages in this group.", threadID);
                break;
                
            default:
                const status = global.autotimeStatus[threadID] ? "🟢 ON" : "🔴 OFF";
                const controlText = hasPermission ? 
                    "/autotime on - Enable hourly messages\n/autotime off - Disable hourly messages" :
                    "Contact bot admins or group admins to change autotime settings";
                
                api.sendMessage(
                    `⏰ **Autotime Status**: ${status}\n\n` +
                    "Usage:\n" +
                    `${controlText}\n` +
                    "/autotime - Check current status",
                    threadID
                );
        }
    } catch (error) {
        console.error("Error in autotime command:", error);
        api.sendMessage("❌ An error occurred while processing your request.", threadID);
    }
};
