const prisma = require("../db");
const {
  DEFAULT_CONFIG,
  FIELD_TYPES,
} = require("@innovapie/shared");

const CONFIG_KEYS = ["statuses", "agingThresholds", "customFields"];

async function getConfig() {
  const rows = await prisma.config.findMany();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, safeParse(r.value)]));
  return {
    statuses: byKey.statuses ?? DEFAULT_CONFIG.statuses,
    agingThresholds: byKey.agingThresholds ?? DEFAULT_CONFIG.agingThresholds,
    customFields: byKey.customFields ?? DEFAULT_CONFIG.customFields,
  };
}

async function setConfig(partial) {
  const validated = validateConfig(partial);
  for (const key of Object.keys(validated)) {
    await prisma.config.upsert({
      where: { key },
      create: { key, value: JSON.stringify(validated[key]) },
      update: { value: JSON.stringify(validated[key]) },
    });
  }
  return getConfig();
}

function validateConfig(partial) {
  const out = {};
  if (partial.statuses !== undefined) {
    if (!Array.isArray(partial.statuses) || partial.statuses.length === 0) {
      throw httpError(400, "statuses must be a non-empty array");
    }
    const keys = new Set();
    out.statuses = partial.statuses.map((s) => {
      if (!s || typeof s.key !== "string" || !s.key.trim()) {
        throw httpError(400, "Each status needs a non-empty string 'key'");
      }
      if (keys.has(s.key)) {
        throw httpError(400, `Duplicate status key: ${s.key}`);
      }
      keys.add(s.key);
      return {
        key: s.key,
        label: s.label || s.key,
        color: s.color || "#9ca3af",
        isInitial: Boolean(s.isInitial),
        isTerminal: Boolean(s.isTerminal),
      };
    });
    const initialCount = out.statuses.filter((s) => s.isInitial).length;
    if (initialCount > 1) {
      throw httpError(400, "Only one status may be marked as initial");
    }
  }
  if (partial.agingThresholds !== undefined) {
    const t = partial.agingThresholds;
    const warn = Number(t.warnDays);
    const overdue = Number(t.overdueDays);
    if (!Number.isFinite(warn) || warn < 0) {
      throw httpError(400, "warnDays must be a non-negative number");
    }
    if (!Number.isFinite(overdue) || overdue < 0) {
      throw httpError(400, "overdueDays must be a non-negative number");
    }
    out.agingThresholds = { warnDays: warn, overdueDays: overdue };
  }
  if (partial.customFields !== undefined) {
    if (!Array.isArray(partial.customFields)) {
      throw httpError(400, "customFields must be an array");
    }
    const keys = new Set();
    out.customFields = partial.customFields.map((f) => {
      if (!f || typeof f.key !== "string" || !f.key.trim()) {
        throw httpError(400, "Each custom field needs a non-empty 'key'");
      }
      if (keys.has(f.key)) {
        throw httpError(400, `Duplicate custom field key: ${f.key}`);
      }
      keys.add(f.key);
      const type = FIELD_TYPES.includes(f.type) ? f.type : "text";
      const base = { key: f.key, label: f.label || f.key, type };
      if (type === "select") {
        base.options = Array.isArray(f.options) ? f.options.map(String) : [];
      }
      return base;
    });
  }
  return out;
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function getInitialStatusKey(statuses) {
  const initial = statuses.find((s) => s.isInitial);
  return (initial || statuses[0]).key;
}

module.exports = {
  CONFIG_KEYS,
  getConfig,
  setConfig,
  validateConfig,
  getInitialStatusKey,
};
