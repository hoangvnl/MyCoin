import express from "express";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import {
  getBlockchain,
  generateNextBlock,
  getAccountBalance,
} from "./blockchain";
import { initWallet } from "./wallet";
import fileupload from "express-fileupload";

// Init Variables
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileupload());

app.get("/createWallet", (req, res) => {
  res.send(initWallet());
});

app.post("/accessWallet", (req, res) => {
  const buffer = req.files.private_key.data.toString();
});

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
