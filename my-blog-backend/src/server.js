import express from "express";
import { connectToDB, db } from "./db.js";
import fs from "fs";
import admin from "firebase-admin";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());

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
  console.log(req.params);
  const { name } = req.params;
  res.send(`Hello ${name}!!`);
});

app.post("/hello", (req, res) => {
  console.log(req.body);
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
  console.log("get user", req.user);
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.include(uid);
    res.json(article);
  } else {
    res.sendStatus(404).send(`The ${name} article doesn\'t exists`);
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  console.log("put user", req.user);
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
  console.log("post user", req.user);
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

connectToDB(() => {
  console.log("Successfully Connected to DB");
  app.listen(8000, () => {
    console.log("Started listining on port 8000!");
  });
});
