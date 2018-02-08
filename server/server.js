const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const routes = require("./routes/routes");

require("dotenv").config({ path: "../.env" });

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_PATH);

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
