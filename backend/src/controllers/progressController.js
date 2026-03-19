const Task = require('../models/Task');
const Subject = require('../models/Subject');

// ──────────────────────── HELPERS ───────────────────────────────────────────

function getDateRange(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6); // last 7 days including today
    return { start, end: new Date(today.getTime() + 86_400_000) };
  }
  if (period === 'month') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    return { start, end: new Date(today.getTime() + 86_400_000) };
  }
  // default: today
  return { start: today, end: new Date(today.getTime() + 86_400_000) };
}

function groupByDay(tasks) {
  const map = {};
  for (const t of tasks) {
    if (!t.scheduledTime) continue;
    const key = new Date(t.scheduledTime).toISOString().split('T')[0];
    if (!map[key]) map[key] = { date: key, total: 0, completed: 0, studyMinutes: 0 };
    map[key].total++;
    if (t.completed) {
      map[key].completed++;
      map[key].studyMinutes += t.duration || 0;
    }
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function computeStreak(dailyStats) {
  // Determine current streak (consecutive days ending today with ≥1 completed task)
  const today = new Date().toISOString().split('T')[0];
  const completedDays = new Set(
    dailyStats.filter((d) => d.completed > 0).map((d) => d.date)
  );

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (completedDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ──────────────────────── ENDPOINTS ─────────────────────────────────────────

// @desc  Overall completion rates (subject-level and topic-level)
// @route GET /api/progress/completion
const getCompletionRates = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });

    const subjectStats = subjects.map((s) => {
      const total = s.topics.length;
      const done = s.topics.filter((t) => t.completed).length;
      return {
        subjectId: s._id,
        subjectName: s.name,
        totalTopics: total,
        completedTopics: done,
        completionRate: total ? Math.round((done / total) * 100) : 0,
      };
    });

    const totalTopics = subjectStats.reduce((a, b) => a + b.totalTopics, 0);
    const completedTopics = subjectStats.reduce((a, b) => a + b.completedTopics, 0);

    res.json({
      overall: {
        totalTopics,
        completedTopics,
        completionRate: totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0,
      },
      bySubject: subjectStats,
    });
  } catch (error) {
    console.error('getCompletionRates error:', error);
    res.status(500).json({ message: 'Server error fetching completion rates' });
  }
};

// @desc  Study hours analysis
// @route GET /api/progress/study-hours?period=week|month|today
const getStudyHours = async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { start, end } = getDateRange(period);

    const tasks = await Task.find({
      userId: req.user._id,
      scheduledTime: { $gte: start, $lt: end },
    });

    const daily = groupByDay(tasks);

    const totalMinutes = tasks
      .filter((t) => t.completed)
      .reduce((acc, t) => acc + (t.duration || 0), 0);

    res.json({
      period,
      totalStudyMinutes: totalMinutes,
      totalStudyHours: +(totalMinutes / 60).toFixed(2),
      daily,
    });
  } catch (error) {
    console.error('getStudyHours error:', error);
    res.status(500).json({ message: 'Server error fetching study hours' });
  }
};

// @desc  Streak and daily/weekly stats
// @route GET /api/progress/stats
const getStats = async (req, res) => {
  try {
    // last 30 days for streak calculation
    const { start } = getDateRange('month');
    const tasks = await Task.find({
      userId: req.user._id,
      scheduledTime: { $gte: start },
    });

    const daily = groupByDay(tasks);
    const streak = computeStreak(daily);

    // This week
    const { start: weekStart } = getDateRange('week');
    const weekTasks = tasks.filter(
      (t) => t.scheduledTime && new Date(t.scheduledTime) >= weekStart
    );
    const weekCompleted = weekTasks.filter((t) => t.completed).length;
    const weekStudyMinutes = weekTasks
      .filter((t) => t.completed)
      .reduce((acc, t) => acc + (t.duration || 0), 0);

    res.json({
      currentStreak: streak,
      currentStreakUnit: 'days',
      thisWeek: {
        tasksScheduled: weekTasks.length,
        tasksCompleted: weekCompleted,
        studyMinutes: weekStudyMinutes,
        studyHours: +(weekStudyMinutes / 60).toFixed(2),
      },
      dailyStats: daily,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

module.exports = { getCompletionRates, getStudyHours, getStats };
