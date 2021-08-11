const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://empinfo:empinfo@cluster0.8xam9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err);
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});