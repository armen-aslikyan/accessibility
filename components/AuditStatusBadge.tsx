const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-slate-100 text-slate-700" },
  running: { label: "Running", className: "bg-blue-100 text-blue-700 animate-pulse" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

export default function AuditStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
