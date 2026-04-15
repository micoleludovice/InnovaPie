export default function AgingIndicator({ aging }) {
  if (!aging) return null;
  const level = aging.overdueLevel || "none";
  const total = aging.totalAgeDays;
  const inStatus = aging.timeInCurrentDays;
  const labelMap = { none: "", warn: " · warn", overdue: " · overdue" };
  return (
    <span className={`aging ${level}`} title={`In current status: ${inStatus}d`}>
      <span className="dot" />
      {total}d{labelMap[level]}
    </span>
  );
}
