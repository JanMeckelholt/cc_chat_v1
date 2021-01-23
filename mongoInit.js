const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://logindb:27017';
const dbName = 'logindb';
const collectionName = 'documents';

// Use connect method to connect to the Server
function mConnect(){
  const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
  });
};

function writeLogin2db(username) {
  const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("WriteLogin2db: client connected");
    const query = {login: username}
    const db = client.db(dbName);
    const user = findEntry(db, collectionName, query, function(entry){
      console.log("Entry: "+ entry);
      //client.close();
      return entry;
    });
    console.log("user: "+ user);
    if (user == null){
      entry = {login: username, admin: false}
      upsertEntry(db, collectionName, entry, function(){
        console.log("WriteLogin2db: Close Connection");
        client.close();
      });
    } else client.close();
    //console.log("Client connected: "+ client.isConnected);
  });
}

function getUser(username){
  const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Get-User: client connected");
    const query = {login: username}
    const db = client.db(dbName);
    //const user=null;
    const user = findEntry(db, collectionName, query, function(entry){
      console.log("Entry: "+ entry);
      client.close();
      return entry;
    });
    return user;
  });
}

const upsertEntry = function(db, collection, entry, callback){
  db.collection(collection).updateOne(entry, {$set: entry}, {upsert:true}, function(err, result) {
    assert.equal(null, err);
    assert.equal(1, JSON.parse(result)["ok"]);
    console.log('err: ' + err);
    //console.log('result:' + result);
    console.log('result.ok:' + JSON.parse(result)["ok"]);
    
    console.log('Entry upserted');
    console.log(entry);
    callback(result);
  });
}

const findEntry = function(db, collection, query, callback){
  db.collection(collection).findOne(query, function (err, result){
    assert.equal(null, err);
    console.log('err: ' + err);
    console.log("findEntry: "+ result);
    callback(result);
  });
  
}



exports.mConnect = mConnect;
exports.writeLogin2db = writeLogin2db;
exports.getUser = getUser;