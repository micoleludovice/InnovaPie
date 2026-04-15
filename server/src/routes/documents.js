const express = require("express");
const prisma = require("../db");
const { getConfig, getInitialStatusKey } = require("../lib/config");
const { computeAging } = require("../lib/aging");

const router = express.Router();

// Hydrate a document: parse metadata JSON, attach aging info.
function hydrate(doc, thresholds) {
  let metadata = {};
  try {
    metadata = doc.metadata ? JSON.parse(doc.metadata) : {};
  } catch {
    metadata = {};
  }
  const aging = computeAging(doc, thresholds);
  return { ...doc, metadata, aging };
}

router.get("/", async (_req, res, next) => {
  try {
    const [docs, config] = await Promise.all([
      prisma.document.findMany({
        include: { history: true },
        orderBy: { createdAt: "desc" },
      }),
      getConfig(),
    ]);
    res.json(docs.map((d) => hydrate(d, config.agingThresholds)));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { history: { orderBy: { timestamp: "asc" } } },
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    const config = await getConfig();
    res.json(hydrate(doc, config.agingThresholds));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, metadata, status } = req.body || {};
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }
    const config = await getConfig();
    const validKeys = new Set(config.statuses.map((s) => s.key));
    const initialStatus =
      status && validKeys.has(status)
        ? status
        : getInitialStatusKey(config.statuses);

    const doc = await prisma.document.create({
      data: {
        title,
        metadata: JSON.stringify(metadata || {}),
        currentStatus: initialStatus,
        history: {
          create: [{ status: initialStatus }],
        },
      },
      include: { history: true },
    });
    res.status(201).json(hydrate(doc, config.agingThresholds));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, metadata } = req.body || {};
    const data = {};
    if (title !== undefined) data.title = title;
    if (metadata !== undefined) data.metadata = JSON.stringify(metadata || {});

    const doc = await prisma.document.update({
      where: { id },
      data,
      include: { history: { orderBy: { timestamp: "asc" } } },
    });
    const config = await getConfig();
    res.json(hydrate(doc, config.agingThresholds));
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.document.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: "status is required" });

    const config = await getConfig();
    const validKeys = new Set(config.statuses.map((s) => s.key));
    if (!validKeys.has(status)) {
      return res.status(400).json({
        error: `Unknown status key '${status}'. Valid keys: ${[...validKeys].join(", ")}`,
      });
    }

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    // No-op if unchanged
    if (existing.currentStatus === status) {
      const doc = await prisma.document.findUnique({
        where: { id },
        include: { history: { orderBy: { timestamp: "asc" } } },
      });
      return res.json(hydrate(doc, config.agingThresholds));
    }

    const doc = await prisma.document.update({
      where: { id },
      data: {
        currentStatus: status,
        history: { create: [{ status }] },
      },
      include: { history: { orderBy: { timestamp: "asc" } } },
    });
    res.json(hydrate(doc, config.agingThresholds));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
