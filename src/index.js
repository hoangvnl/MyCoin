import express from "express";
import startRoutes from "./start/routes";
import dotenv from "dotenv";

// Environment variables
dotenv.config({ path: "./src/api/v2/configs/.env" });

// Init Variables
const app = express();
const port = process.env.PORT || 5000;

// Routes
startRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
