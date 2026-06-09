const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "2.0",
    author: "MAHBUB ULLASH", //original author Loid Butter
    countDown: 8,
    role: 2,
    shortDescription: "Accept/Delete friend requests",
    longDescription: "Accept/Delete friend requests",
    category: "Utility",
    guide: "{p}{n}",
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.floor(Math.random() * 100000).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    }
    else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }
    else {
      api.unsendMessage(messageID);
      return api.sendMessage("❗Usage: <add | del> <number | all>", event.threadID);
    }

    let targetIDs = args.slice(1);
    if (args[1] === "all") {
      targetIDs = listRequest.map((_, i) => i + 1);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];

      if (!u) {
        failed.push(`Invalid index: ${stt}`);
        continue;
      }

      form.variables.input.friend_requester_id = u.node.id;

      const tempVars = form.variables;
      form.variables = JSON.stringify(form.variables);

      newTargetIDs.push(u);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));

      form.variables = tempVars;
    }

    for (let i = 0; i < newTargetIDs.length; i++) {
      try {
        const friendRequest = await promiseFriends[i];
        const json = JSON.parse(friendRequest);

        if (json.errors) failed.push(newTargetIDs[i].node.name);
        else success.push(newTargetIDs[i].node.name);

      } catch {
        failed.push(newTargetIDs[i].node.name);
      }
    }

    let box = "╔═══════════════════╗\n";
    box += `   ${args[0] === "add" ? "𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒 𝐀𝐂𝐂𝐄𝐏𝐓𝐄𝐃" : "𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒 𝐃𝐄𝐋𝐄𝐓𝐄𝐃"}\n`;
    box += "╚═══════════════════╝\n\n";

    box += `🎯 SUCCESS (${success.length})\n`;
    box += success.length ? success.map(u => `✔ ${u}`).join("\n") : "—";

    if (failed.length > 0) {
      box += `\n\n⚠️ FAILED (${failed.length})\n`;
      box += failed.map(u => `✖ ${u}`).join("\n");
    }

    api.sendMessage(box, event.threadID, event.messageID);
    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    const countDown = module.exports.config.countDown;

    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    const data = JSON.parse(
      await api.httpPost("https://www.facebook.com/api/graphql/", form)
    );

    const listRequest = data.data.viewer.friending_possibilities.edges;

    if (!listRequest || listRequest.length === 0)
      return api.sendMessage("🎉 No pending friend requests!", event.threadID);

    let msg = "";
    msg += "╔═══════════════════╗\n";
    msg += "      𝐅𝐑𝐈𝐄𝐍𝐃 𝐑𝐄𝐐𝐔𝐄𝐒𝐓 𝐋𝐈𝐒𝐓\n";
    msg += "╚═══════════════════╝\n\n";

    listRequest.forEach((user, index) => {
      msg += "╔⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n";
      msg += `┃       𝐍𝐨: ${index + 1}\n`;
      msg += `┃       𝐍𝐚𝐦𝐞: ${user.node.name}\n`;
      msg += `┃       𝐈𝐃: ${user.node.id}\n`;
      msg += `┃       𝐔𝐑𝐋: ${user.node.url.replace("www.facebook", "fb")}\n`;
      msg += `┃       𝐓𝐢𝐦𝐞: ${moment(user.time * 1000).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
      msg += "╚⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n";
    });

    msg += "👉 Reply: add <number | all>\n";
    msg += "👉 Reply: del <number | all>";

    api.sendMessage(msg, event.threadID, (e, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        listRequest,
        author: event.senderID,
        unsendTimeout: setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, countDown * 20000)
      });
    }, event.messageID);
  }
};
