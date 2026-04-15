import { useEffect, useState } from "react";
import { api } from "../api.js";

const FIELD_TYPES = ["text", "textarea", "number", "date", "select"];

export default function AdminSettings() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getConfig().then(setConfig).catch((e) => setError(e.message));
  }, []);

  function update(key, value) {
    setConfig({ ...config, [key]: value });
  }

  async function onSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const saved = await api.saveConfig(config);
      setConfig(saved);
      setSuccess("Settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !config) return <div className="error-box">{error}</div>;
  if (!config) return <p>Loading…</p>;

  return (
    <>
      <h1>Admin Settings</h1>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <div className="panel status-editor">
        <h2>Statuses</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Configure the workflow. Drag order, rename labels, change colors, or
          mark the initial / terminal states. Statuses in use by documents
          cannot be deleted.
        </p>
        <StatusEditor
          statuses={config.statuses}
          onChange={(s) => update("statuses", s)}
        />
      </div>

      <div className="panel">
        <h2>Aging thresholds</h2>
        <div className="row">
          <div>
            <label>Warn after (days)</label>
            <input
              type="number"
              min="0"
              value={config.agingThresholds.warnDays}
              onChange={(e) =>
                update("agingThresholds", {
                  ...config.agingThresholds,
                  warnDays: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label>Overdue after (days)</label>
            <input
              type="number"
              min="0"
              value={config.agingThresholds.overdueDays}
              onChange={(e) =>
                update("agingThresholds", {
                  ...config.agingThresholds,
                  overdueDays: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="panel field-editor">
        <h2>Custom fields</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          These appear on document create / edit forms.
        </p>
        <FieldEditor
          fields={config.customFields}
          onChange={(f) => update("customFields", f)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save all settings"}
        </button>
      </div>
    </>
  );
}

function StatusEditor({ statuses, onChange }) {
  function move(i, dir) {
    const next = statuses.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function updateAt(i, patch) {
    const next = statuses.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    // enforce a single isInitial
    if (patch.isInitial) {
      next.forEach((s, idx) => {
        if (idx !== i) s.isInitial = false;
      });
    }
    onChange(next);
  }
  function removeAt(i) {
    onChange(statuses.filter((_, idx) => idx !== i));
  }
  function add() {
    const base = `status${statuses.length + 1}`;
    onChange([
      ...statuses,
      { key: base, label: "New Status", color: "#9ca3af" },
    ]);
  }

  return (
    <>
      <div className="status-row" style={{ fontWeight: 500, color: "var(--muted)", fontSize: 12 }}>
        <span>#</span><span>Key</span><span>Label</span><span>Color</span>
        <span>Initial</span><span>Terminal</span><span></span>
      </div>
      {statuses.map((s, i) => (
        <div key={i} className="status-row">
          <span style={{ color: "var(--muted)" }}>{i + 1}</span>
          <input
            value={s.key}
            onChange={(e) => updateAt(i, { key: e.target.value })}
          />
          <input
            value={s.label}
            onChange={(e) => updateAt(i, { label: e.target.value })}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="color"
              value={s.color || "#9ca3af"}
              onChange={(e) => updateAt(i, { color: e.target.value })}
            />
            <span
              className="badge"
              style={{ background: s.color || "#9ca3af" }}
            >
              {s.label}
            </span>
          </div>
          <label className="cb">
            <input
              type="checkbox"
              checked={Boolean(s.isInitial)}
              onChange={(e) => updateAt(i, { isInitial: e.target.checked })}
            />
          </label>
          <label className="cb">
            <input
              type="checkbox"
              checked={Boolean(s.isTerminal)}
              onChange={(e) => updateAt(i, { isTerminal: e.target.checked })}
            />
          </label>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="btn secondary small" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button className="btn secondary small" onClick={() => move(i, 1)} disabled={i === statuses.length - 1}>↓</button>
            <button className="btn danger small" onClick={() => removeAt(i)}>×</button>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={add}>+ Add status</button>
      </div>
    </>
  );
}

function FieldEditor({ fields, onChange }) {
  function updateAt(i, patch) {
    onChange(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function removeAt(i) {
    onChange(fields.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([
      ...fields,
      { key: `field${fields.length + 1}`, label: "New Field", type: "text" },
    ]);
  }

  return (
    <>
      <div className="field-row" style={{ fontWeight: 500, color: "var(--muted)", fontSize: 12 }}>
        <span>Key</span><span>Label</span><span>Type</span><span>Options (select)</span><span></span>
      </div>
      {fields.map((f, i) => (
        <div key={i} className="field-row">
          <input value={f.key} onChange={(e) => updateAt(i, { key: e.target.value })} />
          <input value={f.label} onChange={(e) => updateAt(i, { label: e.target.value })} />
          <select
            value={f.type}
            onChange={(e) => updateAt(i, { type: e.target.value })}
          >
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            placeholder="option1, option2"
            disabled={f.type !== "select"}
            value={(f.options || []).join(", ")}
            onChange={(e) =>
              updateAt(i, {
                options: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
          <button className="btn danger small" onClick={() => removeAt(i)}>×</button>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={add}>+ Add field</button>
      </div>
    </>
  );
}
