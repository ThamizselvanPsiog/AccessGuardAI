const express = require("express");
const cors = require("cors");

const scanRoutes =
    require("./routes/scanroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", scanRoutes);

module.exports = app;