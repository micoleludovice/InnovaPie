const express = require("express");
const cors = require("cors");

const documents = require("./routes/documents");
const metrics = require("./routes/metrics");
const config = require("./routes/config");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/documents", documents);
app.use("/api/metrics", metrics);
app.use("/api/config", config);

// Central error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${PORT}`);
});
