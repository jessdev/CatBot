// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var catbot = require('./catbot.js');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var catbot;
var catbotMessage;
//var port = process.env.PORT || 3000;
//var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
//var router = express.Router();              // get an instance of the express Router
//app.use(express.static('dist'));
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//     res.sendFile('dist/index.html');
// });
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });
app.use(express.static(__dirname + '/public'));
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);

// START THE SERVER
// =============================================================================
//app.listen(port);
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
console.log('Magic happens on port ' + port);


// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    console.log('new message');
    if(catbot)
     catbot.reply(catbotMessage,data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
  // Catbot
  catbot.listen(function(bot,message){
      catbot = bot;
      catbotMessage = message;
      console.log('good');
      console.log({
            username: 'catBot',
            message: message.match[0]
        });
        socket.broadcast.emit('new message', {
            username: 'catBot',
            message: message.match[0]
        });
     //bot.reply(message,':cat2: Meow Meow Meow (I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ')');
  });
  
});