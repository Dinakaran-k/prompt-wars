import { useState } from 'react';
import api from '../services/api';

const MOODS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'STRESSED', label: 'Stressed' },
  { value: 'BORED', label: 'Bored' },
  { value: 'HABIT', label: 'Just habit' },
  { value: 'SOCIAL', label: 'Social / FOMO' },
  { value: 'OTHER', label: 'Other' },
];

export default function CheckInForm({ onCheckedIn }) {
  const [screenTimeMinutes, setScreenTimeMinutes] = useState('');
  const [triggerNote, setTriggerNote] = useState('');
  const [moodContext, setMoodContext] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const minutes = parseInt(screenTimeMinutes, 10);
    if (!Number.isInteger(minutes) || minutes < 0) {
      setErrors(['Enter today’s screen time in minutes (0 or more).']);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/checkins', {
        screenTimeMinutes: minutes,
        triggerNote: triggerNote.trim() || undefined,
        moodContext: moodContext || undefined,
      });
      onCheckedIn(data);
      setTriggerNote('');
      setMoodContext('');
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [err.response?.data?.error || 'Could not save your check-in. Please try again.'];
      setErrors(apiErrors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-calm-100 p-6">
      <h2 className="text-lg font-semibold text-calm-900 mb-4">Today's check-in</h2>

      <label htmlFor="screenTimeMinutes" className="block text-sm font-medium text-calm-800 mb-1">
        Screen time today (minutes)
      </label>
      <input
        id="screenTimeMinutes"
        type="number"
        min="0"
        required
        value={screenTimeMinutes}
        onChange={(e) => setScreenTimeMinutes(e.target.value)}
        className="w-full rounded-lg border border-calm-200 px-3 py-2 mb-4 focus:border-calm-500"
      />

      <label htmlFor="triggerNote" className="block text-sm font-medium text-calm-800 mb-1">
        What triggered it today? (optional)
      </label>
      <input
        id="triggerNote"
        type="text"
        value={triggerNote}
        onChange={(e) => setTriggerNote(e.target.value)}
        placeholder="e.g. couldn't sleep, checked phone before bed"
        maxLength={280}
        className="w-full rounded-lg border border-calm-200 px-3 py-2 mb-4 focus:border-calm-500"
      />

      <label htmlFor="moodContext" className="block text-sm font-medium text-calm-800 mb-1">
        How were you feeling? (optional)
      </label>
      <select
        id="moodContext"
        value={moodContext}
        onChange={(e) => setMoodContext(e.target.value)}
        className="w-full rounded-lg border border-calm-200 px-3 py-2 mb-4 focus:border-calm-500"
      >
        {MOODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>

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
        {submitting ? 'Checking in…' : 'Check in'}
      </button>
    </form>
  );
}
