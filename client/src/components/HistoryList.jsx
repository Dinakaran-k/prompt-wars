export default function HistoryList({ checkIns, loading, error, hasMore, onLoadMore, loadingMore }) {
  if (loading) {
    return <p aria-live="polite" className="text-calm-600">Loading history…</p>;
  }
  if (error) {
    return <p role="alert" aria-live="polite" className="text-sand-600">Couldn't load history. {error}</p>;
  }
  if (checkIns.length === 0) {
    return <p className="text-calm-600">No check-ins yet — your history will show up here.</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-calm-100 p-6">
      <h2 className="text-lg font-semibold text-calm-900 mb-4">History</h2>
      <ul className="space-y-4">
        {checkIns.map((c) => (
          <li key={c.id} className="border-b border-calm-100 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-medium text-calm-900">{c.date}</span>
              <span className="text-calm-700">{c.screenTimeMinutes} min</span>
            </div>
            {c.triggerNote && <p className="text-sm text-calm-600 mb-1">"{c.triggerNote}"</p>}
            {c.coaching?.status === 'SUCCESS' && (
              <p className="text-sm text-calm-800 italic">{c.coaching.dailyMessage}</p>
            )}
            {c.coaching?.status === 'UNAVAILABLE' && (
              <p className="text-sm text-calm-500 italic">Coaching wasn't available for this check-in.</p>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mt-4 text-sm font-medium text-calm-700 hover:text-calm-900 disabled:opacity-60"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
