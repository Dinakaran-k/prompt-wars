const { todayString, addDays } = require('./dateUtils');

function computeStreak(checkInDates) {
  const today = todayString();
  let cursor = checkInDates.has(today) ? today : addDays(today, -1);

  if (!checkInDates.has(cursor)) return 0;

  let streak = 0;
  while (checkInDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function average(values) {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function computeStats(checkIns, dailyTargetMinutes) {
  const checkInDates = new Set(checkIns.map((c) => c.date));
  const today = todayString();

  const last7Start = addDays(today, -6);
  const prev7Start = addDays(today, -13);
  const prev7End = addDays(today, -7);

  const last7 = checkIns.filter((c) => c.date >= last7Start && c.date <= today);
  const prev7 = checkIns.filter((c) => c.date >= prev7Start && c.date <= prev7End);

  const avgMinutesLast7Days = average(last7.map((c) => c.screenTimeMinutes));
  const avgMinutesPrev7Days = average(prev7.map((c) => c.screenTimeMinutes));

  let trend = 'NOT_ENOUGH_DATA';
  if (avgMinutesLast7Days !== null && avgMinutesPrev7Days !== null) {
    const delta = avgMinutesLast7Days - avgMinutesPrev7Days;
    const threshold = Math.max(5, avgMinutesPrev7Days * 0.05);
    if (delta <= -threshold) trend = 'IMPROVING';
    else if (delta >= threshold) trend = 'WORSENING';
    else trend = 'STEADY';
  }

  const daysUnderTargetLast7 = dailyTargetMinutes != null
    ? last7.filter((c) => c.screenTimeMinutes <= dailyTargetMinutes).length
    : null;

  return {
    totalCheckIns: checkIns.length,
    currentStreakDays: computeStreak(checkInDates),
    avgMinutesLast7Days,
    avgMinutesPrev7Days,
    trend,
    daysUnderTargetLast7
  };
}

module.exports = { computeStats };
