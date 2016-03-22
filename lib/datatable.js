var fs = require("fs");
var file = "test.db";
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
    }
});

var datamodule = {
    addUser: addUser,
    readUser: readUser
};

module.exports = {
    datamodule: datamodule
};

function addUser(id, name, friendly){
    db.serialize(function(){
        //var stmt = db.prepare("INSERT INTO tblUser VALUES (?)");
        var query = "INSERT INTO Customers (USERID, NAME, FRIENDLY) VALUES ('"+id+"', '"+name+"', "+friendly+")";
        db.run(query);
    });
}

function readUser(id){
    return db.serialize(function(){
        return db.run("SELECT * FROM tblUser WHERE USERID="+"'"+id+"'");
    });
}