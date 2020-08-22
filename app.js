const request = require('request');
const db = require('quick.db');
const fs = require('fs');
const url = require("url");
const path = require("path");
const Discord = require("discord.js");
var express = require('express');
var app = express();
const moment = require("moment");
require("moment-duration-format");
const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");
const md = require("marked");

module.exports = (client) => {
  
const templateDir = path.resolve(`${process.cwd()}${path.sep}html`);
app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}css`)));

passport.serializeUser((user, done) => {
done(null, user);
});
passport.deserializeUser((obj, done) => {
done(null, obj);
});

passport.use(new Strategy({
clientID: client.user.id,
clientSecret: client.ayarlar.oauthSecret,
callbackURL: client.ayarlar.callbackURL,
scope: ["identify"]
},
(accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

app.use(session({
secret: '123',
resave: false,
saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.locals.domain = process.env.PROJECT_DOMAIN;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
extended: true
})); 

function checkAuth(req, res, next) {
if (req.isAuthenticated()) return next();
req.session.backURL = req.url;
res.redirect("/giris");
}

const renderTemplate = (res, req, template, data = {}) => {
const baseData = {
bot: client,
path: req.path,
user: req.isAuthenticated() ? req.user : null
};
res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/giris", (req, res, next) => {
if (req.session.backURL) {
req.session.backURL = req.session.backURL;
} else if (req.headers.referer) {
const parsed = url.parse(req.headers.referer);
if (parsed.hostname === app.locals.domain) {
req.session.backURL = parsed.path;
}
} else {
req.session.backURL = "/";
}
next();
},
passport.authenticate("discord"));

app.get("/baglanti-hatası", (req, res) => {
renderTemplate(res, req, "autherror.ejs");
});

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
if (req.session.backURL) {
const url = req.session.backURL;
req.session.backURL = null;
res.redirect(url);
} else {
res.redirect("/");
}
});

app.get("/cikis", function(req, res) {
req.session.destroy(() => {
req.logout();
res.redirect("/");
});
});

app.get("/", (req, res) => {
renderTemplate(res, req, "index.ejs");
});


app.get("/hakkimizda", (req, res) => {
  
renderTemplate(res, req, "hakkımızda.ejs");
});

  app.get("/rolhata", checkAuth, (req, res) => {
renderTemplate(res, req, "hatea.ejs")
});
    app.get("/sunucuhata", checkAuth, (req, res) => {
renderTemplate(res, req, "hatea1.ejs")
});
  
app.get("/bronz", checkAuth, (req, res) => {
if(!client.guilds.get("680430192694657062").members.get(req.user.id)) return res.redirect("/sunucuhata");
if(!client.guilds.get("680430192694657062").members.get(req.user.id).roles.has("692687433027813447")) return res.redirect("/rolhata");
renderTemplate(res, req, "bronze.ejs")
});

app.get("/silver", checkAuth,(req, res) => {
  if(!client.guilds.get("680430192694657062").members.get(req.user.id)) return res.redirect("/sunucuhata");
if(!client.guilds.get("680430192694657062").members.get(req.user.id).roles.has("692687514988838912")) return res.redirect("/rolhata");
renderTemplate(res, req, "silver.ejs")
});
  
  app.get("/gold", checkAuth,(req, res) => {
    if(!client.guilds.get("680430192694657062").members.get(req.user.id)) return res.redirect("/sunucuhata");
if(!client.guilds.get("680430192694657062").members.get(req.user.id).roles.has("692687640591466526")) return res.redirect("/rolhata");
renderTemplate(res, req, "gold.ejs")
});
  
  app.get("/altyapi", checkAuth,(req, res) => {
    if(!client.guilds.get("680430192694657062").members.get(req.user.id)) return res.redirect("/sunucuhata");
if(!client.guilds.get("680430192694657062").members.get(req.user.id).roles.has("684825423552446569")) return res.redirect("/rolhata");
renderTemplate(res, req, "altyapı.ejs")
});
  app.get("/altyapiplus", checkAuth, (req, res) => {
    if(!client.guilds.get("680430192694657062").members.get(req.user.id)) return res.redirect("/sunucuhata");
if(!client.guilds.get("680430192694657062").members.get(req.user.id).roles.has("692687775589335050")) return res.redirect("/rolhata");
renderTemplate(res, req, "altyapıplus.ejs")
});

app.get("/kodekle", checkAuth, (req, res) => {
 
renderTemplate(res, req, "kodekle.ejs")
});

app.post("/kodekle", checkAuth, (req, res) => {

let ayar = req.body
let ID = (Math.floor(Math.random() * 90000000000) + 9000000000);
if (ayar === {} || !ayar['kodad'] || !ayar['kodlink'] || !ayar['kısaaçıklama'] || !ayar['deger']) return res.redirect('/kodekle/hata')
    const engel = ["@everyone", "@here"];
    let m = ayar["kodad"]
    if (engel.some(word => m.includes(word))) return res.redirect("/nice")
db.set(`kodlar.${ID}.ad`, ayar["kodad"])
db.set(`kodlar.${ID}.kodlink`, ayar["kodlink"])
db.set(`kodlar.${ID}.kodkısa`, ayar["kısaaçıklama"])
db.set(`kodlar.${ID}.değeri`, ayar["deger"])
db.set(`kodlar.${ID}.özelid`, ID)  
db.set(`kodlar.${ID}.sahip`, client.users.get(req.user.id).tag)
db.set(`kodlar.${ID}.sahipid`, req.user.id)  
db.set(`kodlar.${ID}.durum`, 'Beklemede')
client.channels.get("700414535567147099").send(`${client.users.get(req.user.id).tag}(${req.user.id}), ${db.fetch(`kodlar.${ID}.ad`)} adındaki kodunu ekledi! (${db.fetch(`kodlar.${ID}.özelid`)}) [<@&700417862354862130>]`)
res.redirect("/kullanici/"+req.user.id);

});
  app.get("/kod/onayla/:kodID", checkAuth,(req, res) => {
  if(!client.yetkililer.includes(req.user.id)) return res.redirect('/yetkili/hata')
    let ID = req.params.kodID
    db.set(`kodlar.${ID}.durum`, 'Onaylı')
    client.channels.get("700414535567147099").send(`${client.users.get(req.user.id).tag}(${req.user.id}), ${db.fetch(`kodlar.${ID}.ad`)} adındaki kodu onaylandı! (${db.fetch(`kodlar.${ID}.özelid`)}) [<@&700417862354862130>]`)
    client.users.get(db.fetch(`kodlar.${req.params.kodID}.sahipid`)).send(`**${db.fetch(`kodlar.${req.params.kodID}.ad`)}** adlı kodunuz sıraya eklendi!`)
  res.redirect("/yetkili/");
});
    app.get("/kod/bekleme/:kodID", checkAuth,(req, res) => {
  if(!client.yetkililer.includes(req.user.id)) return res.redirect('/yetkili/hata')
    let ID = req.params.kodID
    db.set(`kodlar.${ID}.durum`, 'Beklemede')
      client.channels.get("700414535567147099").send(`${client.users.get(req.user.id).tag}(${req.user.id}), ${db.fetch(`kodlar.${ID}.ad`)} adındaki kodu beklemeye alındı! (${db.fetch(`kodlar.${ID}.özelid`)}) [<@&700417862354862130>]`)
    client.users.get(db.fetch(`kodlar.${req.params.kodID}.sahipid`)).send(`**${db.fetch(`kodlar.${req.params.kodID}.ad`)}** adlı kodunuz beklemeye alındı!`)
  res.redirect("/yetkili/");
});
  app.post("/kod/reddet/:kodID", checkAuth,(req, res) => {
    
  if(!client.yetkililer.includes(req.user.id)) return res.redirect('/yetkili/hata')
    let ayar = req.body
    let ID = req.params.kodID
    db.set(`kodlar.${ID}.durum`, 'Reddedilmiş')
    client.channels.get("700414535567147099").send(`${client.users.get(req.user.id).tag}(${req.user.id}), ${db.fetch(`kodlar.${ID}.ad`)} adındaki kodu reddedildi! Sebep: "**${ayar["red-sebep"]}**"(${db.fetch(`kodlar.${ID}.özelid`)}) [<@&700417862354862130>]`)
    client.users.get(db.fetch(`kodlar.${req.params.kodID}.sahipid`)).send(`**${db.fetch(`kodlar.${req.params.kodID}.ad`)}** adlı kodunuz "**${ayar["red-sebep"]}**" nedeniyle reddedildi!`)
  res.redirect("/yetkili/");
});
app.get("/kod/reddet/:kodID", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "reddet.ejs")
});

app.get("/kullanici/:userID", checkAuth,(req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "profil.ejs", {kisi})
    };
  });

});

app.get("/nice", checkAuth, (req, res) => {
  renderTemplate(res, req, "nice.ejs")
})
  app.get("/hata", checkAuth, (req, res) => {
  renderTemplate(res, req, "hata123.ejs")
})
    app.get("/hata1", checkAuth, (req, res) => {
  renderTemplate(res, req, "hata1231.ejs")
})
  app.post("/komut/:kodID/rapor", checkAuth, (req, res) => {
    let a = req.body
    if(db.fetch(`kodlar.${req.params.kodID}.${req.user.id}.yorum`)) return res.redirect('/hata1');
    if(a === {} || !a["mesaj"]) return res.redirect('/hata');
    const engel = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf", ".gd", ".az", ".party", "discord.gg", "@everyone", "@here"];
    let m = a["mesaj"]
    if (engel.some(word => m.includes(word))) return res.redirect("/nice")
    else {
    db.set(`kodlar.${req.params.kodID}.${req.user.id}.rapor`, "Kullandı")
    client.channels.get("700421611433492501").send(`-\n**${db.fetch(`kodlar.${req.params.kodID}.ad`)}** adlı kod, <@!${req.user.id}> tarafından rapor edildi! Sebep: ${a["mesaj"]}\n-`)
    res.redirect('/');
    }
  })
  app.get("/komut/:kodID/rapor", checkAuth, (req, res) => {
    renderTemplate(res, req, "rapor.ejs")
  })
  app.post("/komut/:kodID/yorum", checkAuth, (req, res) => {
    let a = req.body
    if(db.fetch(`kodlar.${req.params.kodID}.${req.user.id}.yorum`)) return res.redirect('/hata1');
    if(a === {} || !a["yorum-1"] || !a["yorum-2"]) return res.redirect('/hata');
    const engel = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf", ".gd", ".az", ".party", "discord.gg", "@everyone", "@here"];
    let m = a["yorum-2"]
    if (engel.some(word => m.includes(word))) return res.redirect("/nice")
    else {
    db.set(`kodlar.${req.params.kodID}.${req.user.id}.yorum`, "Kullandı")
    client.channels.get("700421611433492501").send(`-\n**${db.fetch(`kodlar.${req.params.kodID}.ad`)}** adlı koda, <@!${req.user.id}> tarafından yorum yapıldı!\nYorum: ${a["yorum-2"]}\nYıldız: ${a["yorum-1"]}\n-`)
    res.redirect('/');
    }
  })
  app.get("/komut/:kodID/yorum", checkAuth, (req, res) => {
    renderTemplate(res, req, "yorum.ejs")
  })
  app.get("/yetkili/hata", checkAuth, (req, res) => {
    renderTemplate(res, req, "hate.ejs")
  })

app.get("/yetkili", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
renderTemplate(res, req, "y-panel.ejs") 
});


app.listen(3000);

app.get("/blog", (req, res) => {
  res.redirect('/');
});
  
};
