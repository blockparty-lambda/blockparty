const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
