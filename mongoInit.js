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
    const user = callUserPromise(username)
      .then (user=>{
        console.log("user in writeLogin2db: "+ user);
        if (user == null){
          entry = {login: username, admin: false}
          upsertEntry(db, collectionName, entry, function(){
            console.log("WriteLogin2db: Close Connection");
            client.close();
          });
        } else client.close();
      });
    });
}
//     const user = findEntry(db, collectionName, query, function(entry){
//       console.log("Entry: "+ entry);
//       //client.close();
//       return entry;
//     });
//     console.log("user: "+ user);
//     if (user == null){
//       entry = {login: username, admin: false}
//       upsertEntry(db, collectionName, entry, function(){
//         console.log("WriteLogin2db: Close Connection");
//         client.close();
//       });
//     } else client.close();
//     //console.log("Client connected: "+ client.isConnected);
//   });
// }
const clientPromise = () =>{
  return new Promise((resolve, reject) =>{
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: false}, function(err, client){
      err ?
        reject(err) : resolve(client);
  });
  });
}

const callClientPromise = async() =>{
  const client = await(clientPromise());
  return client;
}

async function callUserPromise(username) {
  const user = await(userPromise(username));
  return user;
}
 
const userPromise = (username) =>{
  return new Promise((resolve, reject) => {
    callClientPromise().then(client => {
      const query = {login: username}
      const db = client.db(dbName);
      const entryPromise = () => {
        return new Promise((resolve, reject)=>{
          db
            .collection(collectionName)
            .findOne(query, function (err, doc){
              err ?
              reject(err) : resolve(doc);
            
            });
        });
      }
    
      const callEntryPromise = async () =>{
        const user = await(entryPromise());
        console.log("CallEntrPromise (user): "+ user);
        return user;
      };
      callEntryPromise().then(function(user){
        client.close();
        resolve(user);
      });
    });
  })
}

async function getUser(username){
  //const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: false});
  callClientPromise().then(client => {
    const query = {login: username}
    const db = client.db(dbName);
    const entryPromise = () => {
      return new Promise((resolve, reject)=>{
        db
          .collection(collectionName)
          .findOne(query, function (err, doc){
            err ?
            reject(err) : resolve(doc);
          
          });
      });
    }
  
    const callEntryPromise = async () =>{
      const user = await(entryPromise());
      console.log("CallEntrPromise (user): "+ user);
      return user;
    };
    callEntryPromise().then(function(user){
      client.close();
      return user;
    });
  });
 //  return user;
}

    
    // //findEntry(db, collectionName, query, function(err, doc){
    //   if(err){
    //     console.log(err);
    //     client.close();
    //     return;
    //   }
    //   if(doc){
    //     console.log("username exists");
    //     //console.dir(doc);
    //     client.close();
    //     return doc;
    //   } else {
    //     console.log('good to go');
    //     console.log("doc: " + doc);
    //     client.close();
    //     return null;
    //   }
    // });
      

const findEntry = async function(db, collection, query, callback){
  db.collection(collection).findOne(query, function (err, doc){
    if(err){
      callback(err);
    }
    else {
      callback(null, doc);
    }
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




exports.mConnect = mConnect;
exports.writeLogin2db = writeLogin2db;
exports.getUser = getUser;
exports.callUserPromise = callUserPromise;
