var Botkit = require("botkit");

var controller = Botkit.slackbot({
    debug: true,
});

var feeling = {
    happy: 'smiley_cat',
    sad:'crying_cat_face',
    shocked: 'scream_cat',
    pout: 'pouting_cat',
    love: 'heart_eyes_cat'
};

var bot = controller.spawn({
    token: 'xoxb-26876200608-6bw3bhhrdlBzelTms47UrpaE'
}).startRTM();

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
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
    theBotHeardThat(bot, message, feeling.love);
    
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
    theBotHeardThat(bot, message, feeling.shocked);
    
    controller.storage.users.get(message.user, function(err, user){
        if (!user) {
            user = {
                id: message.user
            };
        }
        user.friendly = false;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Hisssss');
        });
    });
});


function theBotHeardThat(bot, message, emoji){
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