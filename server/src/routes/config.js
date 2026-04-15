const express = require("express");
const { getConfig, setConfig } = require("../lib/config");
const prisma = require("../db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await getConfig());
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const current = await getConfig();
    const next = { ...current, ...req.body };

    // Protect against deleting a status that is currently in use.
    if (Array.isArray(req.body.statuses)) {
      const newKeys = new Set(req.body.statuses.map((s) => s && s.key));
      const removed = current.statuses
        .map((s) => s.key)
        .filter((k) => !newKeys.has(k));
      if (removed.length > 0) {
        const inUse = await prisma.document.findMany({
          where: { currentStatus: { in: removed } },
          select: { id: true, title: true, currentStatus: true },
          take: 5,
        });
        if (inUse.length > 0) {
          return res.status(409).json({
            error:
              `Cannot delete status(es) ${removed.join(", ")}: still in use by document(s) ` +
              inUse.map((d) => `#${d.id} "${d.title}"`).join(", "),
            statusesInUse: removed,
            documents: inUse,
          });
        }
      }
    }

    const updated = await setConfig(next);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
