const DAY_MS = 24 * 60 * 60 * 1000;

// Compute aging info for a single document given its history and current
// thresholds. `history` should be sorted ascending by timestamp. If no
// history is present, the document's own createdAt is used as the entry
// point.
function computeAging(doc, thresholds) {
  const now = Date.now();
  const createdAt = new Date(doc.createdAt).getTime();
  const totalAgeMs = now - createdAt;

  const history = (doc.history || [])
    .slice()
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const timePerStatus = {};
  if (history.length === 0) {
    timePerStatus[doc.currentStatus] = totalAgeMs;
  } else {
    for (let i = 0; i < history.length; i++) {
      const start = new Date(history[i].timestamp).getTime();
      const end =
        i + 1 < history.length
          ? new Date(history[i + 1].timestamp).getTime()
          : now;
      const key = history[i].status;
      timePerStatus[key] = (timePerStatus[key] || 0) + Math.max(0, end - start);
    }
  }

  const timeInCurrentMs =
    history.length > 0
      ? now - new Date(history[history.length - 1].timestamp).getTime()
      : totalAgeMs;

  const warnMs = (thresholds.warnDays || 0) * DAY_MS;
  const overdueMs = (thresholds.overdueDays || 0) * DAY_MS;

  let overdueLevel = "none";
  if (overdueMs > 0 && timeInCurrentMs >= overdueMs) overdueLevel = "overdue";
  else if (warnMs > 0 && timeInCurrentMs >= warnMs) overdueLevel = "warn";

  return {
    totalAgeMs,
    totalAgeDays: Math.floor(totalAgeMs / DAY_MS),
    timeInCurrentMs,
    timeInCurrentDays: Math.floor(timeInCurrentMs / DAY_MS),
    timePerStatus,
    overdueLevel,
  };
}

module.exports = { computeAging, DAY_MS };
