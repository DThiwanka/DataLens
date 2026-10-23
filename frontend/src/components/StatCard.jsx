/**
 * Metric card component for high-level dataset statistics.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend,
  className = '',
}) {
  const badgeColors = {
    default: 'bg-white/5 text-slate-400 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/8 bg-[#141820]/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-amber-500/30 hover:bg-[#161c26] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {value}
            </span>
            {trend && <span className="text-xs text-slate-400">{trend}</span>}
          </div>
        </div>

        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <p className="text-xs text-slate-400">{subtitle}</p>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${badgeColors[badgeType] || badgeColors.default}`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
