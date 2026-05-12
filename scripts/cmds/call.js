const axios = require("axios");

module.exports = {
  config: {
    name: "call",
    version: "2.0.0",
    author: "Omor TE",
    countDown: 1,
    role: 0,
    shortDescription: "Call Bomber",
    longDescription: "Call bombing tool for Bangladesh numbers (for fun purposes only)",
    guide: "{p}call 01xxxxxxxxx",
    category: "tool"
  },

  onStart: async function ({ message, event, args, api }) {
    const number = args[0];
    
    if (!number || !/^01[0-9]{9}$/.test(number)) {
      return message.reply(`📞 **CALL BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n❌ ভুল নাম্বার ফরম্যাট!\n📌 সঠিক ব্যবহার: call 01xxxxxxxxx\n⚠️ শুধুমাত্র বাংলাদেশি নাম্বার\n━━━━━━━━━━━━━━━━━━━━\n🎯 শুধু মজার জন্য ব্যবহার করুন!`);
    }
    
    // কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`📞 **CALL BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📱 নাম্বার: ${number}\n⏳ স্ট্যাটাস: কল বোম্বিং শুরু হচ্ছে...\n━━━━━━━━━━━━━━━━━━━━\n⚠️ শুধু মজার জন্য ব্যবহার করুন!\n👑 Omor T.E`);
    
    try {
      const response = await axios.get(`https://tbblab.shop/callbomber.php?mobile=${number}`);
      
      // কনফার্মেশন মেসেজ ডিলিট
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
      
      // সাফল্যের মেসেজ
      await message.reply(`✅ **CALL BOMBER COMPLETED**\n━━━━━━━━━━━━━━━━━━━━\n📱 নাম্বার: ${number}\n📞 স্ট্যাটাস: কল বোম্বিং সম্পন্ন!\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW LEGENDS\n👑 Omor T.E`);
      
    } catch (error) {
      // কনফার্মেশন মেসেজ ডিলিট
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
      
      // এরর মেসেজ
      await message.reply(`❌ **CALL BOMBER FAILED**\n━━━━━━━━━━━━━━━━━━━━\n📱 নাম্বার: ${number}\n⚠️ ত্রুটি: ${error.message}\n━━━━━━━━━━━━━━━━━━━━\n💡 পরে আবার চেষ্টা করুন!`);
    }
  }
};
