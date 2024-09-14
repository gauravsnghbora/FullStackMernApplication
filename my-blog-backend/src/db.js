import { MongoClient } from "mongodb";
let db;

async function connectToDB(cb) {
  // const client = new MongoClient("mongodb://localhost:27017");
  const client = new MongoClient(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.biabi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  );

  await client.connect();

  db = client.db("react-blog-db");
  cb();
}

export { db, connectToDB };
