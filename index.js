const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs');
const db = require('quick.db');
const useful = require('useful-tools');
client.ayar = db;

client.htmll = require('cheerio');
client.useful = useful;
client.tags = require('html-tags');


client.ayarlar = {
  "prefix": "!",
  "oauthSecret": "",
	"callbackURL":  "siteurl/callback",
  "renk": "#D49818"
  
}



client.yetkililer = [""]
client.webyetkililer = [""]
client.sunucuyetkililer = [""]

client.on('ready', async () => {
  client.appInfo = await client.fetchApplication();
  setInterval( async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);
  require("./app.js")(client);
  client.user.setActivity(`!yardım`, { type:"PLAYING" })
  console.log(`Şu an ${client.channels.size} kanala, ${client.guilds.size} sunucuya ve ${client.users.size} kullanıcıya hizmet veriyorum!`)
});


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  console.log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    console.log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  })
});

client.on("message", async message => {

	if (message.author.bot) return
	if (!message.content.startsWith(client.ayarlar.prefix)) return
	var command = message.content.split(' ')[0].slice(client.ayarlar.prefix.length)
	var args = message.content.split(' ').slice(1)
	var cmd;

	if (client.commands.has(command)) cmd = client.commands.get(command)
  if (client.aliases.has(command)) cmd = client.commands.get(client.aliases.get(command))
		cmd.run(client, message, args)
});
client.on("message", async message => {
  if(message.member.id == client.user.id) return;
  else {
    if(message.content.includes("<@&700433591234199703>" || "@「🎉」Kod Duyuru")) {
      message.delete()
    }
  }
})


client.login("")
process.env = {}
process.env.TOKEN = "";   
