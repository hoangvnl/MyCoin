import express from "express";
import startRoutes from "./start/routes";

import {
  getBlockchain,
  generateNextBlock,
  getAccountBalance,
} from "./blockchain";

// Init Variables
const app = express();
const port = process.env.PORT || 5000;

// Routes
startRoutes(app);

app.get("/blocks", (req, res) => {
  res.send(getBlockchain());
});

app.post("/mineBlock", (req, res) => {
  const newBlock = generateNextBlock();
  if (newBlock === null) {
    res.status(400).send("could not generate block");
  } else {
    res.send(newBlock);
  }
});

app.get("/balance", (req, res) => {
  const balance = getAccountBalance();
  res.send({ balance: balance });
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
