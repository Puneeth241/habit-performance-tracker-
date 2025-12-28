const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let habits = [];
let performanceLogs = [];

// CREATE HABIT
app.post("/habits", (req, res) => {
  const newHabit = {
    id: habits.length + 1,
    name: req.body.name,
  };
  habits.push(newHabit);
  res.json(newHabit);
});

// GET HABITS
app.get("/habits", (req, res) => {
  res.json(habits);
});

// LOG PERFORMANCE
app.post("/log", (req, res) => {
  const { habitId, score } = req.body;

  if (!habitId || !score) {
    return res.status(400).json({ error: "habitId and score are required" });
  }

  const log = {
    id: performanceLogs.length + 1,
    habitId,
    score,
    date: new Date().toISOString().split("T")[0],
  };

  performanceLogs.push(log);
  res.json(log);
});

// GET PERFORMANCE LOGS
app.get("/log", (req, res) => {
  res.json(performanceLogs);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get("/insights", (req, res) => {
  if (performanceLogs.length === 0) {
    return res.json({ message: "No performance data available" });
  }

  const habitMap = {};

  performanceLogs.forEach(log => {
    if (!habitMap[log.habitId]) {
      habitMap[log.habitId] = {
        totalScore: 0,
        count: 0
      };
    }

    habitMap[log.habitId].totalScore += log.score;
    habitMap[log.habitId].count += 1;
  });

  const insights = Object.keys(habitMap).map(habitId => {
    const avg = habitMap[habitId].totalScore / habitMap[habitId].count;

    const habit = habits.find(h => h.id == habitId);

    return {
      habit: habit ? habit.name : "Unknown",
      averageScore: avg.toFixed(2),
      totalLogs: habitMap[habitId].count,
      message:
        avg >= 7
          ? "This habit has a positive impact on performance"
          : "This habit needs improvement"
    };
  });

  res.json(insights);
});
