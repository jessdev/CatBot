var Botkit = require("botkit");
var database = require('./datatable.js');
var callback;

var controller = Botkit.slackbot({
    debug: false,
});

database.getAllUsers(function(users) {
    for (var i = 0; i < users.length; i++) {
        controller.storage.users.get(users[i].USERID, function(err, user) {
            if (!user) {
                user = {
                    id: users[i].USERID,
                    name: users[i].NAME,
                    friendly: (users[i].FRIENDLY==1? true : false)
                };
            }
            controller.storage.users.save(user,function(err, id) {
                //console.log(user);
            });
        });
    }
});

var feeling = {
    happy: 'smiley_cat',
    sad:'crying_cat_face',
    shocked: 'scream_cat',
    pout: 'pouting_cat',
    love: 'heart_eyes_cat',
    cat: 'cat2'
};

var bot = controller.spawn({
    token: 'xoxb-26876200608-6bw3bhhrdlBzelTms47UrpaE'
}).startRTM();

controller.hears(['hello','hi', 'hey'],'direct_message,direct_mention,mention',function(bot, message) {
    callListen(bot, message)
    controller.storage.users.get(message.user,function(err, user) {
        if(!user){
            user = userinit(message.user, '?', false);
        }
        ///onsole.log(user);
        if (user && user.friendly) {
            theBotHeardThat(bot, message, feeling.happy);
            bot.reply(message,'meow..?');
        } else {
            theBotHeardThat(bot, message, feeling.pout);
            bot.reply(message,'mwwwaaa');
        }
    });
});

controller.hears(['good cat', 'good kitty', 'good catbot'], ['ambient'], function(bot, message){
    callListen(bot, message)
    theBotHeardThat(bot, message, feeling.love);
    
    controller.storage.users.get(message.user, function(err, user){
        if (!user) {
            user = userinit(message.user, "?", true);
        }else if(!user.friendly){
            user.friendly = true;
            updateUser(user);
        }
        user.friendly = true;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Prrrrrrrr');
        });
    });
});
controller.hears(['bad cat', 'bad kitty', 'bad catbot'], ['ambient'], function(bot, message){
    callListen(bot, message)
    theBotHeardThat(bot, message, feeling.shocked);
    
    controller.storage.users.get(message.user, function(err, user){
        if (!user) {
            user = userinit(message.user, "?", false);
        }else if(user.friendly){
            user.friendly = false;
            updateUser(user);
        }
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Hisssss');
        });
    });
});

controller.hears(['call me (.*)'],['ambient','direct_message','direct_mention','mention'],function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    theBotHeardThat(bot, message, feeling.cat);
    callListen(bot, message)
    controller.storage.users.get(message.user,function(err, user) {
        if(!user){
            user = userinit(message.user, name, false);
        }else{
            user.name = name;
            updateUser(user);
        }
        controller.storage.users.save(user,function(err, id) {
            //bot.reply(message,'Nya~');
        });
    });
});

controller.hears(['report'], ['direct_message','direct_mention','mention'], function(bot, message){
    callListen(bot, message);
    controller.storage.users.get(message.user,function(err, user) {
        if(user && user.name == 'jdev'){
            database.getAllUsers(function(users) {
                for (var i = 0; i < users.length; i++) {
                    bot.reply(message, users[i].USERID + " "+users[i].NAME + " "+users[i].FRIENDLY);
                }
            });
            database.readMessages(function(response){
                for (var i = 0; i < response.length; i++) {
                    bot.reply(message, response[i]);
                }
            });
        }
        bot.reply(message, 'Nya~~~~~');
    });
});

controller.hears(['shutdown'], ['direct_message','direct_mention','mention'], function(bot, message){
    callListen(bot, message);
    theBotHeardThat(bot, message, feeling.happy);
    bot.reply(message, "meow ZZZZZZZ (catbot is shutting down)");
    setTimeout(function() {
        process.exit();
    }, 3000);
});

controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {
    callListen(bot, message)
    theBotHeardThat(bot, message, feeling.cat);
    var uptime = formatUptime(process.uptime());
    bot.reply(message,':cat2: Meow Meow Meow (I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ')');
});

controller.hears([''], ['direct_message','direct_mention','mention'], function(bot, message){
    theBotHeardThat(bot, message, feeling.cat);
    database.addMessage(message.user, message.text);
});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

function theBotHeardThat(bot, message, emoji){
    callListen(bot, message)
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: emoji,
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });
}

function userinit(userid, name, friendly){
    user = {
        id: userid,
        name: name,
        friendly: friendly 
    };
    database.addUser(userid, name, friendly);
    return user;
}
function callListen(bot, message){
    console.log('working');
    if(callback !== undefined)
        callback(bot,message);
}
function updateUser(user){
    database.updateUser(user.id, user.name, user.friendly);
}
function listen(toCallback){
    callback = toCallback;
}
module.exports.listen = listen;