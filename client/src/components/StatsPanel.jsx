const TREND_COPY = {
  IMPROVING: { label: 'Trending down 📉', className: 'text-calm-700 bg-calm-50 border-calm-200' },
  WORSENING: { label: 'Trending up', className: 'text-sand-600 bg-sand-50 border-sand-200' },
  STEADY: { label: 'Holding steady', className: 'text-calm-700 bg-calm-50 border-calm-200' },
  NOT_ENOUGH_DATA: { label: 'Not enough data yet', className: 'text-calm-500 bg-white border-calm-100' },
};

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold text-calm-900">{value}</p>
      <p className="text-xs text-calm-600">{label}</p>
    </div>
  );
}

export default function StatsPanel({ stats, loading, error }) {
  if (loading) {
    return <p aria-live="polite" className="text-calm-600">Loading your progress…</p>;
  }
  if (error) {
    return <p role="alert" aria-live="polite" className="text-sand-600">Couldn't load your stats. {error}</p>;
  }
  if (!stats) return null;

  const trend = TREND_COPY[stats.trend] || TREND_COPY.NOT_ENOUGH_DATA;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-calm-100 p-6">
      <h2 className="text-lg font-semibold text-calm-900 mb-4">Your progress</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Day streak" value={stats.currentStreakDays} />
        <Stat label="7-day avg (min)" value={stats.avgMinutesLast7Days ?? '—'} />
        <Stat
          label="Days under target (7d)"
          value={stats.daysUnderTargetLast7 !== null ? stats.daysUnderTargetLast7 : '—'}
        />
      </div>
      <span className={`inline-block text-xs font-medium border rounded-full px-3 py-1 ${trend.className}`}>
        {trend.label}
      </span>
    </div>
  );
}
