export default function CoachingCard({ coaching, date }) {
  if (!coaching) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-calm-600 text-white rounded-2xl shadow-sm p-6"
    >
      <p className="text-xs uppercase tracking-wide text-calm-100 mb-2">
        {date ? `Coaching for ${date}` : 'Your coaching'}
      </p>

      {coaching.status === 'SUCCESS' ? (
        <>
          <p className="text-lg mb-4">{coaching.dailyMessage}</p>
          {coaching.nudgePlan?.length > 0 && (
            <ul className="space-y-1 list-disc list-inside text-calm-50">
              {coaching.nudgePlan.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          )}
        </>
      ) : (
        <p>
          Your check-in was saved. Coaching is temporarily unavailable —
          it'll be back for your next check-in.
        </p>
      )}
    </div>
  );
}
