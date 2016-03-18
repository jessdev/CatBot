var Botkit = require("botkit");

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: 'xoxb-26876200608-6bw3bhhrdlBzelTms47UrpaE'
}).startRTM();

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {
    theBotHeardThat(bot, message)


    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.friendly) {
            bot.reply(message,'meow..?');
        } else {
            bot.reply(message,'mwwwaaa');
        }
    });
});

controller.hears(['good cat', 'good kitty', 'good catbot'], ['ambient'], function(bot, message){
    theBotHeardThat(bot, message);
    
    controller.storage.users.get(message.user, function(err, user){
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.friendly = true;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Prrrrrrrr');
        });
    });
});
controller.hears(['bad cat', 'bad kitty', 'bad catbot'], ['ambient'], function(bot, message){
    theBotHeardThat(bot, message);
    
    controller.storage.users.get(message.user, function(err, user){
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.friendly = false;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Hisssss');
        });
    });
});


function theBotHeardThat(bot, message){
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });
}