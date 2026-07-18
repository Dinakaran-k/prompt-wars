import { useEffect, useState, useCallback } from 'react';
import api from './services/api';
import GoalSetup from './components/GoalSetup';
import CheckInForm from './components/CheckInForm';
import CoachingCard from './components/CoachingCard';
import StatsPanel from './components/StatsPanel';
import HistoryList from './components/HistoryList';

export default function App() {
  const [phase, setPhase] = useState('loading'); // loading | setup | dashboard | fatal
  const [goal, setGoal] = useState(null);
  const [fatalError, setFatalError] = useState(null);

  const [latestResult, setLatestResult] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [checkIns, setCheckIns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    api.get('/goal')
      .then(({ data }) => {
        setGoal(data);
        setPhase('dashboard');
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setPhase('setup');
        } else {
          setFatalError('Could not reach the server. Please refresh and try again.');
          setPhase('fatal');
        }
      });
  }, []);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    setStatsError(null);
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStatsError('Please try again shortly.'))
      .finally(() => setStatsLoading(false));
  }, []);

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    setHistoryError(null);
    api.get('/checkins')
      .then(({ data }) => {
        setCheckIns(data.checkIns);
        setNextCursor(data.nextCursor);
      })
      .catch(() => setHistoryError('Please try again shortly.'))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (phase === 'dashboard') {
      loadStats();
      loadHistory();
    }
  }, [phase, loadStats, loadHistory]);

  function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    api.get('/checkins', { params: { cursor: nextCursor } })
      .then(({ data }) => {
        setCheckIns((prev) => [...prev, ...data.checkIns]);
        setNextCursor(data.nextCursor);
      })
      .catch(() => setHistoryError('Please try again shortly.'))
      .finally(() => setLoadingMore(false));
  }

  function handleCheckedIn(result) {
    setLatestResult(result);
    loadStats();
    loadHistory();
  }

  if (phase === 'loading') {
    return <p aria-live="polite" className="min-h-screen flex items-center justify-center text-calm-600">Loading Unplug…</p>;
  }

  if (phase === 'fatal') {
    return <p role="alert" aria-live="polite" className="min-h-screen flex items-center justify-center text-sand-600">{fatalError}</p>;
  }

  if (phase === 'setup') {
    return <GoalSetup onGoalCreated={(g) => { setGoal(g); setPhase('dashboard'); }} />;
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-calm-900">Unplug</h1>
          <p className="text-calm-700">Resetting: {goal.habitLabel}</p>
        </header>

        {latestResult && (
          <CoachingCard coaching={latestResult.coaching} date={latestResult.checkIn.date} />
        )}

        <CheckInForm onCheckedIn={handleCheckedIn} />

        <StatsPanel stats={stats} loading={statsLoading} error={statsError} />

        <HistoryList
          checkIns={checkIns}
          loading={historyLoading}
          error={historyError}
          hasMore={Boolean(nextCursor)}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
}
