import express from "express";
import { connectToDB, db } from "./db.js";
import fs from "fs";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
// MongoDb cluster user -node-server: dTU5PCQpOrkKzIeS

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

app.use(async (req, res, next) => {
  const { authtoken } = req.headers;
  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);
    } catch (e) {
      return res.sendStatus(400);
    }
  }
  req.user = req.user || {};
  next();
});

// Sample apis start.
app.get("/hello/:name/goodbye/:otherName", (req, res) => {
  const { name } = req.params;
  res.send(`Hello ${name}!!`);
});

app.post("/hello", (req, res) => {
  res.send(`Hello ${req.body.name}!`);
});
// Sample apis end.

// const articlesInfo = [
//   {
//     name: "learn-react",
//     upvote: 0,
//     comments: [],
//   },
//   {
//     name: "learn-node",
//     upvote: 0,
//     comments: [],
//   },
//   {
//     name: "mongo",
//     upvote: 0,
//     comments: [],
//   },
// ];

app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article);
  } else {
    res.sendStatus(404).send(`The ${name} article doesn\'t exists`);
  }
});

app.use((req, res, next) => {
  if (!!req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);
    if (canUpvote) {
      await db.collection("articles").updateOne(
        { name },
        {
          $inc: { upvote: 1 },
          $push: { upvoteIds: uid },
        }
      );
    }

    const updatedArticle = await db.collection("articles").findOne({ name });
    res.json(updatedArticle);
  } else {
    res.send(`The ${name} article doesn\'t exists`);
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { text } = req.body;
  const { email } = req.user;
  // const article = articlesInfo.find((article) => article.name === name);

  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { email, text } },
    }
  );

  const article = await db.collection("articles").findOne({ name });

  if (article) {
    // article.comments.push({ postedBy, text });;
    res.json(article);
  } else {
    res.send(`The ${name} article doesn\'t exists`);
  }
});

const PORT = process.env.PORT || 8000;

connectToDB(() => {
  console.log("Successfully Connected to DB");
  app.listen(PORT, () => {
    console.log("Started listining on port" + PORT);
  });
});
