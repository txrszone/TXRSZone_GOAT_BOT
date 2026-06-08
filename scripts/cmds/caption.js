const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "caption",
    version: "1.0.0",
    author: "OMOR TE",
    countDown: 11,
    role: 0,
    shortDescription: "Islamic Quotes with Image",
    longDescription: "Sends random Islamic quotes with beautiful images",
    category: "islamic",
    guide: "{p}{n}"
  },

  onStart: async function ({ message, api, event }) {
    // Random quotes
    const quotes = [
      "🤲💭🕋\n*** 🖤মনে রাখবেন: ইসলাম বিজয়ী হবেই হবে। \nআপনাকে সহ কিংবা আপনাকে ছাড়া।কিন্তু আপনি বিজয়ী হতে পারবেন না, ইসলামকে ছাড়া।✨✨✨\n\n\n— OMOR TE",
      "°°°﷽𝑨𝒍𝒉𝒂𝒎𝒅𝒖𝒍𝒊𝒍𝒍𝒂𝒉﷽\nআলহামদুলিল্লাহ! আমরা কতই না ভাগ্যবান, ইসলাম আমাদের ধর্ম এবং ইতিহাসে শ্রেষ্ঠ নবীর উম্মত আমরা।\n╚╩══••✠•❀•✠••══╩╝\n\n\n— OMOR TE",
      "🕋🕋🕋🕋\n___কখনোই বান্দাকে আল্লাহ বঞ্চিত করেন না।\n হয়তো আপনি যা চান,সেটায় আপনার কল্যাণ নেই, তাই আল্লাহ আপনাকে দেন নাই।🤲💭 🕋 🖤🥀\n\n\n— OMOR TE",
      "✿•𝐁𝐞𝐬𝐭 𝐋𝐢𝐧𝐞❥•\nইসলাম বলে, বিশ্ব ভ্রতিত্বের কথা, এমন এক পৃথিবী যেখানে সকল দেশের,\nসকল বর্ণের মানুষেরা একে অপরের ভাই ভাই।\n🌸”𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥𝐢𝐥𝐥𝐚h”🌼\n\n\n— OMOR TE",
      "♡༎𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥𝐢𝐥𝐥𝐚𝐡♡༎ 💖\nপ্রকৃত ঈমানদারের হাত ও মুখ থেকে সবাই নিরাপদ।\n❤️🌼🍀🌸🌺🍀\n\n\n— OMOR TE",
      "😌💔. ✿🐼⛈️🖇️𝗧𝗵𝗶𝘀 𝗔𝗯𝗼𝘂𝘁 𝗟𝗶𝗻𝗲-\n“ᵉ😻🌻🔐আমরা মানুষ কতই না বোকা, দুনিয়ার লাভের আশায় পরকালের সুখ থেকে বঞ্চিত হই।\n─༅༎༅💙🌼🩷༅༎༅─\n\n\n— OMOR TE",
      "〇ლ__♥❤💙💙\nহে নারী সাবধান, ইন্টারনেটে তোমাকে শিকারের শিখারীর অভাব নেই।\n♥ ´¨`♥•.¸¸.• ♥ ´¨`♥•.¸¸.•♥´¨` ♥\n\n\n— OMOR TE",
      "🕌🕌🕌🕌🕌\nআমরা অনিশ্চিত ভবিষ্যৎ নিয়ে যতটা চিন্তিত কিন্তু নিশ্চিত মৃত্যু নিয়ে ততটা চিন্তা করি না।\n🔆🔆🔆🔆🔆\n\n\n— OMOR TE",
      "🌿🦋🍁\nযে মানুষ মানুষের মাঝে বিভেদ সৃষ্টি করে, সে আর যাই হোক, মুসলিম নয়।\n🌿🦋🍁\n\n\n— OMOR TE",
      "⌓❥︎𝐈𝐧 𝐬𝐡𝐚 𝐀𝐥𝐥𝐚𝐡❥︎⌓ \n“_কিসের তোষক আর এসি রুম। এই দুনিয়ার সর্বাপেক্ষা শান্তির জায়গা হলো, আল্লাহর ঘর মসজিদ।\n🍁━━━❖🍀💝❖━━━🍁\n\n\n— OMOR TE",
      "🌸”𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥𝐢𝐥𝐥𝐚𝐡”🌸\nসাধারণ জীবনেও ইসলামী নীতি মেনে চলো। ছোট ছোটকাজের মধ্যেও আল্লাহর সন্তুষ্টি লাভের চেষ্টা করো।\n🔱━━✥❖✥━━🔱\n\n\n— OMOR TE",
      "💖∙──༅༎﷽༎༅──∙ 💖\nমধ্য রাতের নামাজ শ্রেষ্ঠতর নামাজ, কিন্তু কমসংখ্যক লোকই তা আদায় করে থাকে।\n─༅༎•🔸💠🔸༅༎•─\n\n\n— OMOR TE",
      " إِنَّا كَذَٰلِكَ نَجْزِى ٱلْمُحْسِنِينَ\nনবী বলেন, রাতের দুই রাকাত নামাজ দুনিয়ার সবকিছু থেকে উত্তম।তা আদায় করা কষ্টকর না হলে আমি তা উম্মতের উপর ফরজ করে দিতাম।❣️•﷽°°•~—•••\n\n\n— OMOR TE",
      " -Ｉ ωιѕн.!🥰\nশিশুরা যেমন কেঁদে কেঁদে সবকিছু আদায় করে, ঠিক তেমনি ভাবে আমাদের উচিৎ আল্লাহর কাছে কেঁদে কেঁদে সব সমস্যার সমাধান করে নেওয়া।\n🙂🌸🦋🌻\n\n\n— OMOR TE",
      " ✿•𝐁𝐞𝐬𝐭 𝐋𝐢𝐧𝐞❥•\nজীবনের প্রতিটি কোণে ইসলামের আলো প্রতিফলিত করে।\n🌸”𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥𝐢𝐥𝐥𝐚h”🌼\n\n\n— OMOR TE",
      " ✿❛ლ︵❝།།😘🤝💝ლ❛✿\nআল্লাহর উপর ভরসা করুন, আর তিনিই সকল বিষয়ের একমাত্র কর্তা।\n(সূরা আহযাব, আয়াত ৩)\n✿❛ლ︵❝།།😘🤝💝ლ❛✿\n\n\n— OMOR TE",
      " 🔱━━❤️❥❥━🔱\nসবচেয়ে উত্তম ঈমান হচ্ছে আল্লাহর সঙ্গে সাক্ষাৎ না করেও তাঁকে এতবেশি ভালোবাসা, যেন দেখেছ। \n(বুখারি ও মুসলিম)\n🔱━━❤️❥❥━🔱\n\n\n— OMOR TE",
      " ╔━━━━𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥i𝐥𝐥𝐚━━━━╗\nযে ব্যক্তি কোনো মুমিনের কোনো দুনিয়াবি দুঃখ দূর করে দেয়,আল্লাহ (আল্লাহ সুবহানাল্লাহু তাআলা) তার আখেরাতেরএকটা দুঃখ দূর করে দেবেন। (হাদিস)\n╚━━━━𝐀𝐥𝐡𝐚𝐦𝐝𝐮𝐥i𝐥𝐥𝐚━━━━╝\n\n\n— OMOR TE",
      " ✿❛ლ︵❝།།🌞🌹💝ლ❛✿\nএকজন মুসলিম যদি গাছ লাগায়, অথবা জমি চাষ করে –যেখান থেকে পশু ও পাখিরা খেতে পারে – তাহলে সে একটি সদকা করল – মুসলিম\n✿❛ლ︵❝།།🌞🌹💝ლ❛✿\n\n\n— OMOR TE",
      " 💟💠─༅༎•🌿🦋🍁\nআল্লাহর (আল্লাহ সুবহানাল্লাহু তাআলা) কাছে সবচেয়ে ভালোবাসারকাজ হলো ফরজ ইবাদত সম্পূর্ণ করা। \n(বুখারি ও মুসলিম)\n💟💠─༅༎•🌿🦋🍁\n\n\n— OMOR TE",
      " 🪔︵︵︵💛💙💚\nনিজের ভাইয়ের (মুসলিম) উপর জুলুম করো না এবং কাউকে তার(মুসলিম) জিনিসপত্র দখল করার সাহায্য করো না।\n (তিরমিজি)\n🪔︵︵︵💛💙💚\n\n\n— OMOR TE",
      "ლ𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐀𝐚𝐥𝐚𝐢𝐤𝐮𝐦_༊━━❝ !!ღ᭄࿐\nনিজেকে কুৎসিত মনে করা, আল্লাহ্‌ পছন্দ করেন না।কারণ তিনি যত্ন করে আমাদের উত্তম রূপে বানিয়েছেন ।\n🙂🌸🦋🌻\n\n\n— OMOR TE",
      "🕋🕋🕋🕋\nআল্লাহ্‌র উপর ভরসা করলে, তিনি কাওকেই হতাশ করেন না, সবকিছু দিয়ে দেন।\n🤲💭 🕋*** 🖤🥀\n\n\n— OMOR TE",
      "💟💟─༅༎•🍀🌷\nমনে রাখবেন: যেখানে আমাদের চেষ্টার শেষ, সেখানেই আল্লাহ্‌র গায়েবী সাহায্য শুরু।\n💟💟─༅༎•🍀🌷\n\n\n— OMOR TE",
      "┇✨┇┇✨┇┇┇✨\nএই দুনিয়ার সেরা ধনীর সাহায্যের দরজা বন্ধ হয়ে যাবে, কিন্তু আল্লাহ্‌র দরজা বন্ধ হবে না কোনোদিন।\n┇┇┇✨┇┇✨┇✨\n\n\n— OMOR TE",
      "╔━━━━━━✦✦🖤✦🖤✦✦━━━━━━━━━━╗\nআপনার মনে কি শান্তি নেই ? তাহলে নামাজে গভীর আল্লাহ্‌কে স্মরণকরুন, মনে শান্তি ফিরে আসবে।\n╚━━━━━━✦✦🖤✦🖤✦✦━━━━━━━━━━╝\n\n\n— OMOR TE",
      "💙✥◈✥💙✥◈✥💙\nসেই তো প্রকৃত মুসলমান, যে আল্লাহর নির্দেশাবলী মেনে চলেএবং অন্যকে মানতে উৎসাহিত করে।\n💙✥◈✥💙✥◈✥💙\n\n\n— OMOR TE",
      "🌞🌞🌞•••༐༐༐༐༐༐•••🌞🌞🌞\nশুনে রাখুন, “একমাত্র কুরআনই হল মানুষের সেরা পথনির্দেশক। যা রাব্বুল আলামিনের নির্দেশাবলী, যা কিনা মানুষের জীবনকে সুন্দর ও সফল করে তোলে\n🌞🌞🌞•••༐༐༐༐༐༐•••🌞🌞🌞\n\n\n— OMOR TE",
      " 〇ლ__♥❤💙💙\nরাতের তারার মতো তোমার চোখ জ্বলজ্বলে, তোমার সাথে থাকতে চাই সারা জীবন।এটাই আল্লাহর কাছে প্রার্থনা করি।\n♥ ´¨`♥•.¸¸.• ♥ ´¨`♥•.¸¸.•♥´¨` ♥\n\n\n— OMOR TE"
    ];

    // Random images
    const images = [
      "https://i.imgur.com/s7lWVBQ.jpeg",
      "https://i.imgur.com/Tj6adbm.jpeg",
      "https://i.imgur.com/L5ZEaPA.jpeg",
      "https://i.imgur.com/uXi1lrg.jpeg",
      "https://i.imgur.com/h0CMDtn.jpeg",
      "https://i.imgur.com/XfYz6wN.jpeg",
      "https://i.imgur.com/MrnFFTs.jpeg",
      "https://i.imgur.com/1d4PKgo.jpeg",
      "https://i.imgur.com/QQjV0Ec.jpeg",
      "https://i.imgur.com/rbYjAZ2.jpeg",
      "https://i.imgur.com/Jo6JRP2.jpeg",
      "https://i.imgur.com/rl5DsnE.jpeg",
      "https://i.imgur.com/gc17ZIL.jpeg",
      "https://i.imgur.com/5idifU6.jpeg",
      "https://i.imgur.com/DQ391x5.jpeg",
      "https://i.imgur.com/66CoeG7.jpeg",
      "https://i.imgur.com/2NK5XTr.jpeg",
      "https://i.imgur.com/FLGuvcu.jpeg",
      "https://i.imgur.com/xfaDpuj.jpeg",
      "https://i.imgur.com/QDnkQZh.jpeg",
      "https://i.imgur.com/Z4674C4.jpeg",
      "https://i.imgur.com/YyNjYOU.jpeg",
      "https://i.imgur.com/Sbw1Ek5.jpeg",
      "https://i.imgur.com/9MyDAos.jpeg",
      "https://i.imgur.com/JmwQicn.jpeg",
      "https://i.imgur.com/RzlDJy9.jpeg",
      "https://i.imgur.com/6yjeFrc.jpeg",
      "https://i.imgur.com/vkLlOgs.jpeg",
      "https://i.imgur.com/X41jmrh.jpeg",
      "https://i.imgur.com/ESHNJxr.jpeg"
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const imagePath = path.join(cacheDir, "caption_image.jpg");

    request(encodeURI(randomImage))
      .pipe(fs.createWriteStream(imagePath))
      .on("close", () => {
        api.sendMessage({
          body: `「 ${randomQuote} 」`,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          try { fs.unlinkSync(imagePath); } catch(e) {}
        }, event.messageID);
      })
      .on("error", (err) => {
        console.error("Image download error:", err);
        api.sendMessage(`「 ${randomQuote} 」`, event.threadID, event.messageID);
      });
  }
};
