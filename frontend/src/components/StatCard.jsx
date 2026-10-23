/**
 * Metric card component for high-level dataset statistics.
 * Clean, restrained, professional presentation.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  badge,
  badgeType = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend,
  className = '',
}) {
  const badgeColors = {
    default: 'bg-gray-100 text-gray-600 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div
      className={`rounded-md border border-gray-200 bg-white p-4 shadow-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        {badge && (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${
              badgeColors[badgeType] || badgeColors.default
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-gray-900">
          {value}
        </span>
        {trend && <span className="text-xs text-gray-500">{trend}</span>}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
