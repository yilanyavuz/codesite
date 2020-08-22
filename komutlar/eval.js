const Discord = require("discord.js");
const db = require("quick.db")
exports.run = async (client, message, args, color, prefix) => {
  if(message.member.id !== "679694797270810642") return;
  try {
    let codein = args.join(" ");
    let code = eval(codein);

    if (codein.length < 1)
      return message.reply(`deneyebilmek için bir kod girmelisin!`);

    if (typeof code !== "string")
      code = require("util").inspect(code, { depth: 0 });
    let embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .addField("» :inbox_tray: Giriş;", `\`\`\`js\n${codein}\`\`\``)
      .addField("» :outbox_tray: Çıkış;", `\`\`\`js\n${code}\n\`\`\``);
    message.channel.send(embed);
  } catch (e) {
    let embed2 = new Discord.RichEmbed()
      .setColor("RANDOM")
      .addField("» Hata", "```js\n" + e + "\n```");
    message.channel.send(embed2);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "eval",
  description: "Gizli!",
  usage: "eval"
};
