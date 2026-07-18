function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function todayString() {
  return toDateString(new Date());
}

function addDays(dateString, delta) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateString(d);
}

module.exports = { todayString, addDays, toDateString };
