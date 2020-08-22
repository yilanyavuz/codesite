const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  var embed = new Discord.RichEmbed()
  .setColor('RED')
  .setAuthor("#PlagueCode", client.user.avatarURL)
	.setDescription(`
**Nasıl kodlara erişeceğim?**\n[Buraya tıklayarak](https://web.plaguecode.tk/) sitemize erişebilirsin!
`)
  message.channel.send(embed)
  
};

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: 0,
}

exports.help = {
	name: 's',
	description: 'yardım',
	usage: 'yardım'
}