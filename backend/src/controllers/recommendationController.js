const Subject = require('../models/Subject');
const Task = require('../models/Task');

// ──────────────── HELPERS ────────────────────────────────────────────────────

// Topics not studied in the last N days
function getStaleTopics(subjects, days = 7) {
  const threshold = new Date(Date.now() - days * 86_400_000);
  const stale = [];

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (topic.completed) continue;
      const isStale =
        !topic.lastStudied || new Date(topic.lastStudied) < threshold;
      if (isStale) {
        stale.push({
          subjectId: subject._id,
          subjectName: subject.name,
          topicId: topic._id,
          topicTitle: topic.title,
          difficulty: topic.difficulty,
          lastStudied: topic.lastStudied || null,
          daysSinceStudied: topic.lastStudied
            ? Math.floor((Date.now() - new Date(topic.lastStudied).getTime()) / 86_400_000)
            : null,
          reason: 'Not studied recently',
        });
      }
    }
  }

  return stale.sort((a, b) => {
    // never-studied first, then by stalest
    if (a.lastStudied === null && b.lastStudied !== null) return -1;
    if (a.lastStudied !== null && b.lastStudied === null) return 1;
    if (a.lastStudied && b.lastStudied)
      return new Date(a.lastStudied) - new Date(b.lastStudied);
    return 0;
  });
}

// Hard topics with high difficulty that haven't been mastered
function getWeakTopics(subjects) {
  const weak = [];
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (topic.completed) continue;
      if (topic.difficulty >= 4) {
        weak.push({
          subjectId: subject._id,
          subjectName: subject.name,
          topicId: topic._id,
          topicTitle: topic.title,
          difficulty: topic.difficulty,
          lastStudied: topic.lastStudied || null,
          reason: `High difficulty (${topic.difficulty}/5)`,
        });
      }
    }
  }
  return weak.sort((a, b) => b.difficulty - a.difficulty);
}

// Suggest which completed topics to revise (spaced repetition-lite)
function getRevisionSuggestions(subjects) {
  const suggestions = [];
  const DAY_MS = 86_400_000;
  const now = Date.now();

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (!topic.completed || !topic.lastStudied) continue;
      const daysSince = (now - new Date(topic.lastStudied).getTime()) / DAY_MS;

      // Suggest revision after 3, 7, 14, or 30 days (spaced repetition windows)
      if (daysSince >= 3) {
        let urgency = 'low';
        if (daysSince >= 30) urgency = 'high';
        else if (daysSince >= 14) urgency = 'medium';
        else if (daysSince >= 7) urgency = 'medium';

        suggestions.push({
          subjectId: subject._id,
          subjectName: subject.name,
          topicId: topic._id,
          topicTitle: topic.title,
          difficulty: topic.difficulty,
          lastStudied: topic.lastStudied,
          daysSinceStudied: Math.floor(daysSince),
          urgency,
          reason: `Last revised ${Math.floor(daysSince)} days ago — due for spaced repetition`,
        });
      }
    }
  }

  // Sort by urgency (high → medium → low) then by daysSince desc
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort(
    (a, b) =>
      urgencyOrder[a.urgency] - urgencyOrder[b.urgency] ||
      b.daysSinceStudied - a.daysSinceStudied
  );
}

// Study tips based on behavioral patterns
function generateStudyTips({ streak, completionRate, weakTopicsCount, staleTopicsCount }) {
  const tips = [];

  if (streak === 0) {
    tips.push("🔥 Start your streak today! Even 30 minutes of focused study counts.");
  } else if (streak >= 7) {
    tips.push(`🏆 Amazing! You've maintained a ${streak}-day streak. Keep it up!`);
  } else {
    tips.push(`📅 You're on a ${streak}-day streak — don't break the chain!`);
  }

  if (completionRate < 30) {
    tips.push("📚 Your overall topic completion is low. Try focusing on one subject at a time.");
  } else if (completionRate >= 80) {
    tips.push("🎯 You're nearly done! Review remaining topics for full mastery.");
  }

  if (weakTopicsCount > 0) {
    tips.push(`💪 You have ${weakTopicsCount} high-difficulty topic(s) — dedicate extra time to them.`);
  }

  if (staleTopicsCount > 3) {
    tips.push("⏰ Several topics haven't been visited in a while. Schedule review sessions.");
  }

  tips.push("🧠 Use the Pomodoro technique: 25 min study, 5 min break for better focus.");
  tips.push("📝 After each session, write a 3-point summary to reinforce memory.");

  return tips;
}

// ─────────────────────── ENDPOINTS ──────────────────────────────────────────

// @desc  Get weak topics (high difficulty, not yet completed)
// @route GET /api/recommendations/weak-topics
const getWeakTopicsEndpoint = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const weak = getWeakTopics(subjects);
    res.json({ count: weak.length, topics: weak });
  } catch (error) {
    console.error('getWeakTopics error:', error);
    res.status(500).json({ message: 'Server error fetching weak topics' });
  }
};

// @desc  Get stale topics (not studied in >7 days)
// @route GET /api/recommendations/stale-topics?days=7
const getStaleTopicsEndpoint = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const subjects = await Subject.find({ userId: req.user._id });
    const stale = getStaleTopics(subjects, days);
    res.json({ count: stale.length, topics: stale });
  } catch (error) {
    console.error('getStaleTopics error:', error);
    res.status(500).json({ message: 'Server error fetching stale topics' });
  }
};

// @desc  Get revision suggestions (spaced-repetition for completed topics)
// @route GET /api/recommendations/revisions
const getRevisions = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const suggestions = getRevisionSuggestions(subjects);
    res.json({ count: suggestions.length, suggestions });
  } catch (error) {
    console.error('getRevisions error:', error);
    res.status(500).json({ message: 'Server error fetching revision suggestions' });
  }
};

// @desc  Get personalised study tips based on patterns
// @route GET /api/recommendations/tips
const getTips = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });

    // Streak calculation (last 30 days)
    const start30 = new Date(Date.now() - 30 * 86_400_000);
    const recentTasks = await Task.find({
      userId: req.user._id,
      scheduledTime: { $gte: start30 },
    });

    const completedDays = new Set(
      recentTasks
        .filter((t) => t.completed && t.scheduledTime)
        .map((t) => new Date(t.scheduledTime).toISOString().split('T')[0])
    );

    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = cursor.toISOString().split('T')[0];
      if (completedDays.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }

    // Completion rate
    const allTopics = subjects.flatMap((s) => s.topics);
    const completedTopics = allTopics.filter((t) => t.completed).length;
    const completionRate = allTopics.length
      ? Math.round((completedTopics / allTopics.length) * 100)
      : 0;

    const weakTopicsCount = getWeakTopics(subjects).length;
    const staleTopicsCount = getStaleTopics(subjects, 7).length;

    const tips = generateStudyTips({ streak, completionRate, weakTopicsCount, staleTopicsCount });

    res.json({
      context: { streak, completionRate, weakTopicsCount, staleTopicsCount },
      tips,
    });
  } catch (error) {
    console.error('getTips error:', error);
    res.status(500).json({ message: 'Server error generating tips' });
  }
};

// @desc  Full recommendation summary (all in one)
// @route GET /api/recommendations
const getAllRecommendations = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const weakTopics = getWeakTopics(subjects).slice(0, 5);
    const staleTopics = getStaleTopics(subjects, 7).slice(0, 5);
    const revisions = getRevisionSuggestions(subjects).slice(0, 5);

    // Streak
    const start30 = new Date(Date.now() - 30 * 86_400_000);
    const recentTasks = await Task.find({
      userId: req.user._id,
      scheduledTime: { $gte: start30 },
    });
    const completedDays = new Set(
      recentTasks
        .filter((t) => t.completed && t.scheduledTime)
        .map((t) => new Date(t.scheduledTime).toISOString().split('T')[0])
    );
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = cursor.toISOString().split('T')[0];
      if (completedDays.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
      else break;
    }

    const allTopics = subjects.flatMap((s) => s.topics);
    const completedTopics = allTopics.filter((t) => t.completed).length;
    const completionRate = allTopics.length
      ? Math.round((completedTopics / allTopics.length) * 100)
      : 0;

    const tips = generateStudyTips({
      streak,
      completionRate,
      weakTopicsCount: weakTopics.length,
      staleTopicsCount: staleTopics.length,
    });

    res.json({
      weakTopics,
      staleTopics,
      revisionSuggestions: revisions,
      tips,
    });
  } catch (error) {
    console.error('getAllRecommendations error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
};

module.exports = {
  getWeakTopicsEndpoint,
  getStaleTopicsEndpoint,
  getRevisions,
  getTips,
  getAllRecommendations,
};
