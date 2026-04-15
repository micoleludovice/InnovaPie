const express = require("express");
const prisma = require("../db");
const { getConfig } = require("../lib/config");
const { computeAging } = require("../lib/aging");

const router = express.Router();

router.get("/aging", async (_req, res, next) => {
  try {
    const [docs, config] = await Promise.all([
      prisma.document.findMany({ include: { history: true } }),
      getConfig(),
    ]);

    const perStatus = Object.fromEntries(config.statuses.map((s) => [s.key, 0]));
    let overdueCount = 0;
    let warnCount = 0;
    const overdueDocs = [];

    const enriched = docs.map((d) => {
      const aging = computeAging(d, config.agingThresholds);
      if (perStatus[d.currentStatus] === undefined) {
        perStatus[d.currentStatus] = 0;
      }
      perStatus[d.currentStatus] += 1;
      if (aging.overdueLevel === "overdue") {
        overdueCount += 1;
        overdueDocs.push({
          id: d.id,
          title: d.title,
          currentStatus: d.currentStatus,
          totalAgeDays: aging.totalAgeDays,
          timeInCurrentDays: aging.timeInCurrentDays,
        });
      } else if (aging.overdueLevel === "warn") {
        warnCount += 1;
      }
      return { id: d.id, createdAt: d.createdAt, aging };
    });

    // Top oldest by total age (open documents only — exclude terminal statuses)
    const terminalKeys = new Set(
      config.statuses.filter((s) => s.isTerminal).map((s) => s.key)
    );
    const oldestOpen = docs
      .filter((d) => !terminalKeys.has(d.currentStatus))
      .map((d) => ({
        id: d.id,
        title: d.title,
        currentStatus: d.currentStatus,
        totalAgeDays: computeAging(d, config.agingThresholds).totalAgeDays,
      }))
      .sort((a, b) => b.totalAgeDays - a.totalAgeDays)
      .slice(0, 5);

    res.json({
      total: docs.length,
      perStatus,
      warnCount,
      overdueCount,
      overdueDocs,
      oldestOpen,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
