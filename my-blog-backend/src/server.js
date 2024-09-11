import express from "express";
import { connectToDB, db } from "./db.js";

const app = express();
app.use(express.json());

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
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    res.json(article);
  } else {
    res.sendStatus(404).send(`The ${name} article doesn\'t exists`);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  // const article = articlesInfo.find((article) => article.name === name);
  await db.collection("articles").updateOne(
    { name },
    {
      $inc: { upvote: 1 },
    }
  );

  const article = await db.collection("articles").findOne({ name });
  if (article) {
    // article.upvote += 1;
    res.json(article);
  } else {
    res.send(`The ${name} article doesn\'t exists`);
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;

  // const article = articlesInfo.find((article) => article.name === name);

  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { postedBy, text } },
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
