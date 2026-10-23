/**
 * Metric card component for high-level dataset statistics.
 * Clean, restrained, professional presentation with strict design tokens.
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
    default: 'bg-[#F1F3F5] text-[#667085] border-[#E3E6EB]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-[#B98220] border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div
      className={`rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 shadow-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#89919F]">{title}</span>
        {badge && (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[10px] font-medium ${
              badgeColors[badgeType] || badgeColors.default
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-xl font-semibold tracking-tight text-[#20242C] font-mono">
          {value}
        </span>
        {trend && <span className="text-xs text-[#89919F]">{trend}</span>}
      </div>

      {subtitle && (
        <p className="mt-0.5 text-xs text-[#667085]">{subtitle}</p>
      )}
    </div>
  );
}
