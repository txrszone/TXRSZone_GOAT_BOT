const axios = require("axios");

module.exports = {
  config: {
    name: "uprobot",
    version: "1.0.0",
    author: "Omor TE",
    role: 0,
    shortDescription: "Create UptimeRobot monitor",
    longDescription: "Create a monitor using UptimeRobot API",
    guide: "{p}uprobot [name] [url]",
    category: "system"
  },

  onStart: async function ({ message, event, args }) {
    if (args.length < 2) {
      return message.reply(`❌ **UPTIME MONITOR**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: upt [নাম] [URL]\n📝 উদাহরণ: upt MyBot https://example.com\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    const name = args[0];
    const url = args[1];
    const interval = 300; // auto default 5 minutes

    if (!url.startsWith("http")) {
      return message.reply("❌ দয়া করে একটি সঠিক URL দিন! (http:// বা https:// দিয়ে শুরু হতে হবে)");
    }

    try {
      const res = await axios.get("https://web-api-delta.vercel.app/upt", {
        params: { name, url, interval }
      });

      const result = res.data;

      if (result.error) {
        return message.reply(`⚠️ Error: ${result.error}`);
      }

      const monitor = result.data;
      const msg = `✅ **MONITOR CREATED!** ✅\n━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${monitor.id}\n📛 Name: ${monitor.name}\n🔗 URL: ${monitor.url}\n⏱️ Interval: ${monitor.interval / 60} mins\n📶 Status: ${monitor.status == 1 ? "Active ✅" : "Inactive ❌"}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`;

      return message.reply(msg);

    } catch (e) {
      console.error("Uptime error:", e);
      return message.reply(`❌ API request failed!\n💡 ${e.message}`);
    }
  }
};
