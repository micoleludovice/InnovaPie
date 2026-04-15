// Renders a colored status badge. Resolves the label+color from the current
// Config.statuses list — falls back gracefully to a grey chip with the raw
// key if the status was deleted from config.
export default function StatusBadge({ statusKey, statuses }) {
  const def = (statuses || []).find((s) => s.key === statusKey);
  const label = def ? def.label : statusKey;
  const color = def ? def.color : "#9ca3af";
  return (
    <span className="badge" style={{ background: color }}>
      {label}
    </span>
  );
}
