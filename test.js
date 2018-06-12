var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:18510/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("waves");
  dbo.collection("festreg").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});