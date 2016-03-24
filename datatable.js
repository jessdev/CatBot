var fs = require("fs");
var file = "catbot.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

// db.serialize(function() {
//   if(!exists) {
//     db.run("CREATE TABLE Stuff (thing TEXT)");
//   }
  
//         var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");
  
// //Insert random data
//   var rnd;
//   for (var i = 0; i < 10; i++) {
//     rnd = Math.floor(Math.random() * 10000000);
//     stmt.run("Thing #" + rnd);
//   }
  
// stmt.finalize();
//   db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
//     console.log(row.id + ": " + row.thing);
//   });
// });

// db.close();

db.serialize(function(){
    if(!exists){
        db.run('CREATE TABLE tblUser (USERID TEXT, NAME TEXT, FRIENDLY BOOL)');
        db.run('CREATE TABLE tblMessage (TBLUSERID TEXT, MESSAGE TEXT)');
        db.run('CREATE TABLE tblChannel (CHANNELID TEXT, NAME TEXT)');
        addUser('U0SRL10KF', 'jdev', true);
    }
});

function addUser(id, name, friendly){
    db.serialize(function(){
        var stmt = db.prepare("INSERT INTO tblUser VALUES (?, ?, ?)");
        stmt.run(id, name, friendly);
        stmt.finalize();
        //console.log('Added User: '+id);
    });
}

function addMessage(userid, message) {
    readUser(userid, function(user) {
        if (user != null) {
            db.serialize(function() {
                var stmt = db.prepare("INSERT INTO tblMessage VALUES (?, ?)");
                stmt.run(user[0].USERID, message);
                stmt.finalize();
            });
        }
    });
}

function readMessages(callback){
    var messages = [];
    db.serialize(function(){
        db.each("SELECT * from tblMessage", function(err, row){
            messages.push(row.TBLUSERID + ": "+row.MESSAGE);
        }, function(){callback(messages)});
    });
}

function readUser(id, callback){
    var query = 'SELECT * FROM tblUser WHERE USERID="'+id+'"';
    db.serialize(function(){
        db.all(query, function(err, rows){
            callback(rows);
        });
    });
}

function updateUser(id, name, friendly){
    var query = 'UPDATE tblUser SET NAME="'+name+'", FRIENDLY='+(friendly? 1: 0)+' where USERID="'+id+'"' ;
    //console.log(query);
    db.serialize(function(){
        db.run(query);
        //console.log('Update complete');
    });
}

function getAllUsers(callback){
    var users = [];
    db.serialize(function(){
        db.each("SELECT * from tblUser", function(err, row){
            users.push(row);
        }, function(err, idk){
            callback(users);
        });
    });
}

function addChannel(id, name) {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO tblChannel VALUES (?, ?)");
        stmt.run(id, name);
        stmt.finalize();
    });
}

function getAllChannels(callback){
    var channels = [];
    db.serialize(function(){
        db.each("SELECT * from tblChannel", function(err, row){
            channels.push(row);
        }, function(err, idk){
            callback(channels);
        });
    });
}

// readMessages(function(response){
//     console.log(response);
// });

var datamodule = {
    addUser: addUser,
    readUser: readUser,
    updateUser: updateUser,
    getAllUsers: getAllUsers,
    addMessage: addMessage,
    readMessages: readMessages,
    addChannel: addChannel,
    getAllChannels: getAllChannels
};

module.exports = datamodule;