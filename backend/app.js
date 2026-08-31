const express = require("express");
const cors = require("cors");

const scanRoutes =
    require("./routes/scanroutes");

const authRoutes =
  require("./routes/authroutes");

const analyticsRoutes = require("./routes/analyticsroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api", scanRoutes);

app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AccessGuardAI backend is running.",
  });
});

module.exports = app;