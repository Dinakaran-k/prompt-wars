import { useState } from 'react';
import api from '../services/api';

export default function GoalSetup({ onGoalCreated }) {
  const [habitLabel, setHabitLabel] = useState('');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const trimmedLabel = habitLabel.trim();
    if (!trimmedLabel) {
      setErrors(['Tell us what you want to reset.']);
      return;
    }
    if (trimmedLabel.length > 100) {
      setErrors(['Keep it under 100 characters.']);
      return;
    }

    const target = dailyTargetMinutes.trim() ? parseInt(dailyTargetMinutes, 10) : null;
    if (dailyTargetMinutes.trim() && (!Number.isInteger(target) || target <= 0)) {
      setErrors(['Daily target must be a positive whole number of minutes.']);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/goal', { habitLabel: trimmedLabel, dailyTargetMinutes: target });
      onGoalCreated(data);
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [err.response?.data?.error || 'Something went wrong. Please try again.'];
      setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-calm-100 p-8">
        <h1 className="text-2xl font-semibold text-calm-900 mb-2">Unplug</h1>
        <p className="text-calm-700 mb-6">
          A gentle, adaptive coach for resetting a screen-time habit. No
          judgment — just real, personalized support.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="habitLabel" className="block text-sm font-medium text-calm-800 mb-1">
            What do you want to reset?
          </label>
          <input
            id="habitLabel"
            type="text"
            value={habitLabel}
            onChange={(e) => setHabitLabel(e.target.value)}
            placeholder="e.g. Late-night scrolling"
            className="w-full rounded-lg border border-calm-200 px-3 py-2 mb-4 focus:border-calm-500"
            maxLength={100}
          />

          <label htmlFor="dailyTargetMinutes" className="block text-sm font-medium text-calm-800 mb-1">
            Daily target (minutes) — optional
          </label>
          <input
            id="dailyTargetMinutes"
            type="number"
            min="1"
            value={dailyTargetMinutes}
            onChange={(e) => setDailyTargetMinutes(e.target.value)}
            placeholder="e.g. 60"
            className="w-full rounded-lg border border-calm-200 px-3 py-2 mb-4 focus:border-calm-500"
          />

          {errors.length > 0 && (
            <div role="alert" aria-live="polite" className="mb-4 text-sm text-sand-600 bg-sand-50 border border-sand-200 rounded-lg px-3 py-2">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-calm-600 hover:bg-calm-700 disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            {submitting ? 'Starting…' : 'Start my reset'}
          </button>
        </form>
      </div>
    </div>
  );
}
