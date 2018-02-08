const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");

const routes = require("./routes/routes");

require("dotenv").config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_PATH);

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

routes(app);

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
