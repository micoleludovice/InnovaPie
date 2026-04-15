// Shared default configuration and constants used by both server and client.
// Keep this file CommonJS so Node can require() it directly; the client
// imports it via Vite's resolution (it is ES-module compatible via default
// export interop).

const DEFAULT_STATUSES = [
  { key: "pending", label: "Pending", color: "#9ca3af", isInitial: true },
  { key: "review", label: "Review", color: "#3b82f6" },
  { key: "approved", label: "Approved", color: "#10b981" },
  { key: "closed", label: "Closed", color: "#6b7280", isTerminal: true },
];

const DEFAULT_AGING_THRESHOLDS = {
  warnDays: 7,
  overdueDays: 14,
};

const DEFAULT_CUSTOM_FIELDS = [
  { key: "owner", label: "Owner", type: "text" },
  { key: "department", label: "Department", type: "text" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: ["Internal", "External", "Compliance"],
  },
];

const FIELD_TYPES = ["text", "textarea", "number", "date", "select"];

const DEFAULT_CONFIG = {
  statuses: DEFAULT_STATUSES,
  agingThresholds: DEFAULT_AGING_THRESHOLDS,
  customFields: DEFAULT_CUSTOM_FIELDS,
};

module.exports = {
  DEFAULT_STATUSES,
  DEFAULT_AGING_THRESHOLDS,
  DEFAULT_CUSTOM_FIELDS,
  DEFAULT_CONFIG,
  FIELD_TYPES,
};
