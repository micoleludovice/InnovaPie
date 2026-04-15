// Renders form inputs based on a `fields` config array. Controlled via
// `values` + `onChange(key, value)`.

export default function DynamicFormRenderer({ fields, values, onChange }) {
  if (!fields || fields.length === 0) {
    return (
      <p className="empty" style={{ padding: 16 }}>
        No custom fields defined. Add some in Admin Settings.
      </p>
    );
  }
  return (
    <div>
      {fields.map((f) => (
        <div key={f.key} className="form-row">
          <label>{f.label}</label>
          {renderInput(f, values[f.key] ?? "", (v) => onChange(f.key, v))}
        </div>
      ))}
    </div>
  );
}

function renderInput(field, value, onChange) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— select —</option>
          {(field.options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    case "text":
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
