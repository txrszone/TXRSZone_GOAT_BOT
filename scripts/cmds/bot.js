const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "Obot",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "OMOR TE",
  description: "Interactive assistant bot",
  commandCategory: "Noprefix",
  usages: "noprefix",
  cooldowns: 4,
};

module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  var { threadID, messageID } = event;
  const moment = require("moment-timezone");
  var id = event.senderID;
  var name = await Users.getNameUser(event.senderID);

  var responses = [
    "আপনাকে কিভাবে সাহায্য করতে পারি? 😊",
    "হ্যালো! কেমন আছেন আপনি? 🌼",
    "আপনার জন্য কি করতে পারি? 🤗",
    "আপনার কথা শুনছি, বলুন... 👂",
    "আজকে আপনার দিন কেমন যাচ্ছে? ☀️",
    "আমি এখানে আছি আপনাকে সাহায্য করার জন্য! 💖",
    "কিছু বলতে চাচ্ছেন? 😊",
    "আপনার জন্য অপেক্ষা করছি... ⏳",
    "সুন্দর একটা দিন হোক আপনার! 🩷",
    "আমার সাথে চ্যাট করতে ভালো লাগছে! 😊",
    "আপনার স্মার্ট অ্যাসিস্টেন্ট রেডি! 💡",
    "কি নতুন কিছু শিখতে চান আজ? 📚",
    "আপনার কথা শুনে আমি আনন্দিত! 😊"
  ];
  
  var randResponse = responses[Math.floor(Math.random() * responses.length)];

  // Custom responses for specific phrases
  if (event.body.toLowerCase() === "miss you") {
    return api.sendMessage("আপনাকে দেখে ভালো লাগছে! 😊", threadID);
  }

  if (event.body.toLowerCase() === "assalamualaikum" || 
      event.body.toLowerCase() === "salam") {
    return api.sendMessage("ওয়ালাইকুম আসসালাম! 🤲", threadID);
  }

  if (event.body.toLowerCase() === "thank you" || 
      event.body.toLowerCase() === "thanks") {
    return api.sendMessage("আপনাকে স্বাগতম! 😊", threadID);
  }

  if (event.body.toLowerCase() === "how are you" || 
      event.body.toLowerCase() === "kemon acho") {
    return api.sendMessage("আমি ভালো আছি, ধন্যবাদ! আপনার দিনটি ভালো যাক 🌸", threadID);
  }

  if (event.body.toLowerCase() === "owner" || 
      event.body.toLowerCase() === "creator") {
    return api.sendMessage("এই বটটি Omor TE দ্বারা তৈরি হয়েছে", threadID);
  }

  if (event.body.toLowerCase() === "help" || 
      event.body.toLowerCase() === "sahajjo") {
    return api.sendMessage("আমি আপনাকে সাহায্য করতে পারি: 1. তথ্য খুঁজে দিতে 2. সময় জানাতে 3. গান/ছবি সাজেস্ট করতে। কী চান?", threadID);
  }

  if (event.body.toLowerCase() === "time" || 
      event.body.toLowerCase() === "somoy") {
    // Corrected time format: 12-hour with AM/PM and DD/MM/YYYY
    const currentTime = moment().tz("Asia/Dhaka").format("hh:mm:ss A DD/MM/YYYY");
    return api.sendMessage(`এখন বাংলাদেশ সময়: ${currentTime} ⏰`, threadID);
  }

  if (event.body.toLowerCase() === "i love you" || 
      event.body.toLowerCase() === "valobashi") {
    return api.sendMessage("ধন্যবাদ! 😊 মানুষ ও প্রযুক্তির মধ্যে সুন্দর সম্পর্ক গড়ে উঠুক ❤️", threadID);
  }

  // General bot trigger
  if (event.body.toLowerCase().startsWith("bot") || 
      event.body.toLowerCase().startsWith("obot")) {
    var msg = {
      body: `${name}, ${randResponse}`
    }
    return api.sendMessage(msg, threadID, messageID);
  }
}

module.exports.run = function({ api, event, client, __GLOBAL }) { }
