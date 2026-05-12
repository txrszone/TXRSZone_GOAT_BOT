const axios = require("axios");

module.exports = {
  config: {
    name: "nagadf",
    version: "1.4",
    author: "Omor TE",
    countDown: 4,
    role: 0,
    shortDescription: "Fake Nagad Screenshot",
    longDescription: "Create a fake Nagad transaction screenshot",
    guide: "{p}nagadf 019xxxxxxxx - TXN12345 - 5000 - 10",
    category: "fun"
  },

  onStart: async function ({ message, event, args, api }) {
    const input = args.join(" ");
    
    if (!input.includes("-")) {
      return message.reply(`❌ Wrong format!\n📌 Use: nagadf 019xxxxxxxx - TXN12345 - 5000 - 10`);
    }

    const [numberRaw, transactionRaw, amountRaw, chargeRaw] = input.split("-");
    const number = numberRaw.trim();
    const transaction = transactionRaw.trim();
    const amount = chargeRaw ? amountRaw.trim() : "0";
    const charge = chargeRaw ? chargeRaw.trim() : "0";
    const total = (parseFloat(amount) + parseFloat(charge)).toFixed(2);

    const url = `https://masterapi.site/api/nagadf.php?number=${encodeURIComponent(number)}&transaction=${encodeURIComponent(transaction)}&amount=${encodeURIComponent(amount)}&charge=${encodeURIComponent(charge)}&total=${encodeURIComponent(total)}`;

    // 1️⃣ কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`📤 **Generating fake Nagad screenshot...**\n━━━━━━━━━━━━━━━━━━━━\n⏳ Please wait!`);

    // 4 সেকেন্ড পর কনফার্মেশন মেসেজ ডিলিট
    setTimeout(async () => {
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
    }, 4000);

    try {
      const response = await axios.get(url, { responseType: "stream" });
      const attachment = response.data;

      await message.reply({
        body: `━━━━━━━━━━━━━━━━━━━━━━━
📸 **FAKE NAGAD SCREENSHOT GENERATED** ✅
━━━━━━━━━━━━━━━━━━━━━━━

📱 Mobile Number : ${number}
🧾 Transaction ID : ${transaction}
💵 Amount : ৳${amount}
💸 Charge : ৳${charge}
💰 Total : ৳${total}

📤 Your fake Nagad receipt is ready!

━━━━━━━━━━━━━━━━━━━━━━━
🛠 Powered by: ★ OMOR TE ★
━━━━━━━━━━━━━━━━━━━━━━━`,
        attachment: attachment,
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ An error occurred while generating the screenshot. Try again later!");
    }
  }
};
