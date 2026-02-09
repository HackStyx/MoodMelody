"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardDock from "@/components/dashboard-dock";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { EmotionalIntelligenceIcon } from "@/components/icons/emotional-intelligence-icon";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Emotion colors for consistency
const emotionColors = {
  joy: "#FFD700",
  love: "#FF69B4",
  sadness: "#4169E1",
  anger: "#FF4500",
  fear: "#8A2BE2",
  surprise: "#32CD32"
};

const emotionGradients = {
  joy: "from-yellow-400 via-yellow-500 to-orange-400",
  love: "from-pink-400 via-rose-500 to-red-400",
  sadness: "from-blue-400 via-blue-500 to-indigo-500",
  anger: "from-red-400 via-red-500 to-orange-500",
  fear: "from-purple-400 via-violet-500 to-purple-600",
  surprise: "from-green-400 via-emerald-500 to-teal-500"
};

const emotionEmojis = {
  joy: "😄",
  love: "❤️",
  sadness: "😢",
  anger: "😡",
  fear: "😨",
  surprise: "😮"
};

const MoodHeatmap = ({ moodJournals }: { moodJournals: any[] }) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
  const endDate = new Date(now.getFullYear(), 11, 31); // End of current year

  // Create a map of dates to mood scores
  const moodMap = new Map();
  moodJournals.forEach(journal => {
    const date = journal.created_at.split('T')[0];
    const moodScores = { joy: 5, love: 4, surprise: 3, fear: 2, sadness: 1, anger: 0 };
    const score = moodScores[journal.emotion as keyof typeof moodScores] || 2.5;

    if (!moodMap.has(date)) {
      moodMap.set(date, []);
    }
    moodMap.get(date).push(score);
  });

  // Calculate average mood for each day
  const dailyMoods = new Map();
  moodMap.forEach((scores, date) => {
    const avgScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    dailyMoods.set(date, avgScore);
  });

  // Generate calendar grid
  const weeks: any[] = [];
  let currentDate = new Date(startDate);

  // Start from the beginning of the week containing January 1st
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const moodScore = dailyMoods.get(dateStr);

      week.push({
        date: new Date(currentDate),
        dateStr,
        moodScore,
        hasEntry: moodMap.has(dateStr)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  const entriesThisYear = moodJournals.filter(j => j.created_at.startsWith(now.getFullYear().toString())).length;
  const totalDays = 366; // leap year safe
  const filledPercent = Math.round((entriesThisYear / totalDays) * 100);

  const getColorIntensity = (score?: number, hasEntry?: boolean) => {
    if (!hasEntry) return 'bg-slate-200/40 dark:bg-slate-700/40'; // subtle, uses space without dominating
    if (!score) return 'bg-slate-300/60 dark:bg-slate-600/50';
    if (score >= 4.5) return 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-sm'; // Joy/Love
    if (score >= 3.5) return 'bg-gradient-to-br from-green-300 to-emerald-400 shadow-sm'; // Surprise
    if (score >= 2.5) return 'bg-gradient-to-br from-blue-200 to-indigo-300'; // Neutral
    if (score >= 1.5) return 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-sm'; // Fear/Sadness
    return 'bg-gradient-to-br from-red-400 to-pink-500 shadow-sm'; // Anger
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
    <Card className="overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/40 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-6 bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/30 dark:to-transparent">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl shadow-inner">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="py-1">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed" style={{ fontFamily: 'var(--font-poppins)' }}>{now.getFullYear()} Mood Journey</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>Your emotional landscape this year</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Heatmap: fills card width, grid uses space evenly */}
        <div className="w-full">
          {/* Month labels - 12 equal segments across full width */}
          <div className="flex w-full mb-2 pl-9 sm:pl-10">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
              <div key={month} className="flex-1 min-w-0 text-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {month}
              </div>
            ))}
          </div>

          <div className="flex w-full gap-0.5 sm:gap-1 min-h-0">
            {/* Day labels - fixed width, 7 rows */}
            <div className="flex flex-col gap-0.5 sm:gap-1 shrink-0 w-6 sm:w-8 pr-1.5 justify-evenly">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((letter, index) => (
                <div key={`${letter}-${index}`} className="flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-medium h-3 sm:h-4 shrink-0">
                  {letter}
                </div>
              ))}
            </div>

            {/* Grid: 53 columns share width evenly (flex-1) so no empty space */}
            <div className="flex-1 min-w-0 flex gap-0.5 sm:gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
                  {week.map((day: any, dayIndex: number) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`aspect-square min-h-[6px] sm:min-h-[8px] w-full max-h-4 sm:max-h-5 rounded-[3px] sm:rounded-[4px] ${getColorIntensity(day.moodScore, day.hasEntry)} hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 hover:scale-110 transition-all duration-200 cursor-pointer border border-slate-200/30 dark:border-slate-600/30`}
                      title={`${day.date.toLocaleDateString()}: ${day.hasEntry ? `Mood ${day.moodScore?.toFixed(1)}/5` : 'No entry'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: uses space with stats + legend + short tip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm sm:text-base">
                {entriesThisYear} entries this year
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, filledPercent)}%` }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{filledPercent}% of year</span>
            </div>
            {entriesThisYear < 7 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto" style={{ fontFamily: 'var(--font-inter)' }}>
                Journal more days to light up your year
              </p>
            )}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50 shrink-0">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-slate-300 dark:bg-slate-600 shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-blue-300 dark:bg-blue-600 shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-500 shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-amber-400 dark:bg-amber-500 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

const MoodStreaks = ({ moodJournals }: { moodJournals: any[] }) => {
  const calculateStreaks = () => {
    if (moodJournals.length === 0) return { current: 0, longest: 0, positive: 0 };

    // Sort by date
    const sorted = [...moodJournals].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let positiveStreak = 0;
    let tempPositive = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check current streak (consecutive days with entries)
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasEntry = sorted.some(j => j.created_at.startsWith(dateStr));
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak and positive mood streak
    let tempLongest = 0;
    const positiveEmotions = ['joy', 'love', 'surprise'];

    sorted.forEach((journal, index) => {
      tempLongest++;
      if (positiveEmotions.includes(journal.emotion)) {
        tempPositive++;
      } else {
        positiveStreak = Math.max(positiveStreak, tempPositive);
        tempPositive = 0;
      }

      if (index === sorted.length - 1 ||
        new Date(sorted[index + 1].created_at).getDate() !==
        new Date(journal.created_at).getDate() + 1) {
        longestStreak = Math.max(longestStreak, tempLongest);
        tempLongest = 0;
      }
    });

    positiveStreak = Math.max(positiveStreak, tempPositive);

    return { current: currentStreak, longest: longestStreak, positive: positiveStreak };
  };

  const streaks = calculateStreaks();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} whileHover={{ y: -4 }} className="group">
        <Card className="rounded-2xl border-0 overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/25 dark:shadow-orange-900/30 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Current Streak</p>
                <p className="text-4xl font-black text-white mt-1 mb-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {streaks.current}
                </p>
                <p className="text-white/80 text-xs font-medium">consecutive days</p>
                {streaks.current > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white/90">Active now!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-90 group-hover:scale-110 transition-transform duration-300">🔥</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ y: -4 }} className="group">
        <Card className="rounded-2xl border-0 overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500 text-white shadow-xl shadow-purple-500/25 dark:shadow-purple-900/30 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Longest Streak</p>
                <p className="text-4xl font-black text-white mt-1 mb-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {streaks.longest}
                </p>
                <p className="text-white/80 text-xs font-medium">personal best</p>
                {streaks.longest >= 7 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-amber-300 rounded-full" />
                    <span className="text-xs font-medium text-white/90">Champion!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-90 group-hover:scale-110 transition-transform duration-300">🏆</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} whileHover={{ y: -4 }} className="group">
        <Card className="rounded-2xl border-0 overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/25 dark:shadow-emerald-900/30 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Positive Streak</p>
                <p className="text-4xl font-black text-white mt-1 mb-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {streaks.positive}
                </p>
                <p className="text-white/80 text-xs font-medium">happy days</p>
                {streaks.positive >= 3 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white/90">Inspiring!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-90 group-hover:scale-110 transition-transform duration-300">✨</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const AIAnalysisCard = ({ moodJournals, analytics, user, profileName }: { moodJournals: any[], analytics: any, user: any, profileName: string }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);

  // Helper: Get Peak Mood Time
  const getPeakMoodTime = () => {
    if (!moodJournals.length) return { time: 'N/A', icon: 'clock' };
    const hours = moodJournals.map(j => new Date(j.created_at).getHours());
    const morning = hours.filter(h => h >= 5 && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 17).length;
    const evening = hours.filter(h => h >= 17 && h < 22).length;
    const night = hours.filter(h => h >= 22 || h < 5).length;

    if (morning >= afternoon && morning >= evening && morning >= night) return { time: 'Morning', icon: 'sun' };
    if (afternoon >= evening && afternoon >= night) return { time: 'Afternoon', icon: 'cloud-sun' };
    if (evening >= night) return { time: 'Evening', icon: 'moon' };
    return { time: 'Night', icon: 'stars' };
  };

  // Helper: Get Top Keywords (simple frequency)
  const getTopKeywords = () => {
    if (!moodJournals.length) return [];
    const text = moodJournals.map(j => j.text || '').join(' ').toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'for', 'my', 'was', 'with', 'on', 'at', 'but', 'so', 'just']);
    const freq: Record<string, number> = {};

    words.forEach(w => {
      if (!stopWords.has(w) && w.length > 3) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  };

  const peakTime = getPeakMoodTime();
  const keywords = getTopKeywords();

  const generateAIAnalysis = async (force: boolean = false) => {
    // If not forced, check for cached analysis first
    if (!force) {
      try {
        const cachedAnalysis = localStorage.getItem('mood_ai_analysis');
        const cachedTimestamp = localStorage.getItem('mood_ai_timestamp');

        if (cachedAnalysis && cachedTimestamp) {
          const now = Date.now();
          const age = now - parseInt(cachedTimestamp);
          const cooldown = 15 * 60 * 1000; // 15 minutes

          if (age < cooldown) {
            setAiAnalysis(cachedAnalysis);
            setAnalysisGenerated(true);
            return;
          }
        }
      } catch (e) {
        console.error('Cache read error', e);
      }
    }

    if ((analysisGenerated && !force) || moodJournals.length === 0) return;

    setLoading(true);

    try {
      const recentEntries = moodJournals.slice(0, 10);
      const emotionSummary = analytics.emotionDistribution.map((e: any) =>
        `${e.emotion}: ${e.count} entries`
      ).join(', ');

      const moodDataText = recentEntries.map(entry =>
        `Date: ${entry.created_at.split('T')[0]}, Emotion: ${entry.emotion}, Text: "${entry.text?.slice(0, 100) || ''}"`
      ).join('\n');

      const prompt = `Analyze this user's mood data:
Data: ${recentEntries.length} entries.
Emotions: ${emotionSummary}.
Avg Score: ${analytics.avgMoodScore?.toFixed(1) || 'N/A'}/5.
Entries:
${moodDataText}

Return a Markdown response using these icons in headers (don't repeat headers):
## 🧠 Intelligence
## 🌟 Strengths
## 🚀 Optimization
## 🎁 Toolkit

Provide specific, empathetic insights based on the text and emotions provided. Be professional yet warm.`;

      const response = await fetch('/api/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, isAnalysis: true })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.analysis;
        setAiAnalysis(result);

        try {
          localStorage.setItem('mood_ai_analysis', result);
          localStorage.setItem('mood_ai_timestamp', Date.now().toString());
        } catch (e) { console.error('Cache error', e); }
      } else {
        setAiAnalysis('Analysis unavailable. Please try again later.');
      }
      setAnalysisGenerated(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis('Connection error. Please check your internet and try again.');
      setAnalysisGenerated(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (moodJournals.length > 0 && !analysisGenerated) {
      generateAIAnalysis(false);
    }
  }, [moodJournals, analysisGenerated]);

  const handleRefresh = () => {
    const cachedTimestamp = localStorage.getItem('mood_ai_timestamp');
    if (cachedTimestamp) {
      const now = Date.now();
      const age = now - parseInt(cachedTimestamp);
      const cooldown = 15 * 60 * 1000;
      if (age < cooldown) {
        const remaining = Math.ceil((cooldown - age) / 60000);
        alert(`Please wait ${remaining} minutes before regenerating.`);
        return;
      }
    }
    localStorage.removeItem('mood_ai_analysis');
    localStorage.removeItem('mood_ai_timestamp');
    setAnalysisGenerated(false);
    setAiAnalysis('');
    generateAIAnalysis(true);
  };

  const insights = {
    positiveRatio: moodJournals.length > 0
      ? ((moodJournals.filter(j => ['joy', 'love', 'surprise'].includes(j.emotion)).length / moodJournals.length) * 100).toFixed(0)
      : 0,
    entries: moodJournals.length
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/40 transition-all duration-300">

      {/* Subtle gradient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-200/80 dark:border-slate-700">
              <EmotionalIntelligenceIcon size={32} className="text-indigo-500 dark:text-indigo-400 w-8 h-8" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins)' }}>AI Emotional Intelligence</h2>
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-md">
                Premium Analysis
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-inter)' }}>Deep learning insights from your {insights.entries} journal entries</p>
          </div>
        </div>

        <div className="flex gap-3">
          {analysisGenerated && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">

        {/* Left Sidebar - Key Metrics */}
        <div className="col-span-1 lg:col-span-4 p-6 sm:p-8 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-inter)' }}>Vital Metrics</h3>

          <div className="space-y-4">
            {/* Metric 1 */}
            <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Positivity Score</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{insights.positiveRatio}%</span>
                <span className="text-xs text-emerald-500 font-medium mb-1">Optimistic</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${insights.positiveRatio}%` }}></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Peak Mood Time</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{peakTime.time}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">You tend to be happiest in the {peakTime.time.toLowerCase()}</p>
            </div>

            {/* Metric 3 - Keywords */}
            <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Common Themes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                    #{word}
                  </span>
                ))}
                {keywords.length === 0 && <span className="text-xs text-slate-400">Not enough data yet</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - AI Analysis */}
        <div className="col-span-1 lg:col-span-8 p-8 min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-70">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin reverse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <EmotionalIntelligenceIcon size={24} className="text-indigo-500 animate-pulse w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 animate-pulse">Consulting Dr. AI...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => <h2 className="flex items-center gap-3 text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-4">{children}</h2>,
                  ul: ({ children }) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 list-none pl-0">{children}</ul>,
                  li: ({ children }) => <li className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm text-sm flex items-start gap-2"><span className="text-indigo-500 mt-1">●</span><span>{children}</span></li>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{children}</strong>,
                  p: ({ children }) => <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{children}</p>
                }}
              >
                {aiAnalysis}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                <EmotionalIntelligenceIcon size={40} className="text-indigo-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Analyze</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">Generate a comprehensive personality and emotional analysis based on your recent journal entries.</p>
              <Button onClick={() => generateAIAnalysis(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl shadow-lg shadow-indigo-500/20">
                Start Analysis
              </Button>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};



const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

    {/* Streak cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
      ))}
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export default function MoodHistory() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);



  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [moodJournals, setMoodJournals] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setIsScrolled(scrollContainerRef.current.scrollTop > 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container && !loading) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        router.replace("/signin");
      }
    };
    getUser();
  }, [router]);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      if (data && data.name) {
        setProfileName(data.name);
      }
    };
    getProfile();
  }, [user]);

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch mood journals
        const { data: journalData, error: journalError } = await supabase
          .from("mood_journals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (journalError) {
          console.error("Error fetching journals:", journalError);
        } else {
          setMoodJournals(journalData || []);
        }

        // Fetch moods
        const { data: moodData, error: moodError } = await supabase
          .from("moods")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (moodError) {
          console.error("Error fetching moods:", moodError);
        } else {
          setMoods(moodData || []);
        }

        // Fetch streak
        const { data: streakData, error: streakError } = await supabase
          .from("streaks")
          .select("streak_count")
          .eq("user_id", user.id)
          .maybeSingle();

        if (streakError) {
          console.error("Error fetching streak:", streakError);
        } else {
          setStreak(streakData?.streak_count || 0);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    };

    fetchMoodData();
  }, [user]);

  // Calculate analytics
  useEffect(() => {
    if (moodJournals.length === 0) return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter recent data
    const recentJournals = moodJournals.filter(j => new Date(j.created_at) >= thirtyDaysAgo);
    const weeklyJournals = moodJournals.filter(j => new Date(j.created_at) >= sevenDaysAgo);

    // Emotion distribution
    const emotionCounts: Record<string, number> = {};
    recentJournals.forEach(journal => {
      if (journal.emotion) {
        emotionCounts[journal.emotion] = (emotionCounts[journal.emotion] || 0) + 1;
      }
    });

    const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / recentJournals.length) * 100)
    }));

    // Daily mood trend (last 14 days)
    const dailyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayJournals = moodJournals.filter(j =>
        j.created_at.split('T')[0] === dateStr
      );

      // Calculate mood score (joy=5, love=4, surprise=3, fear=2, sadness=1, anger=0)
      const moodScores = {
        joy: 5, love: 4, surprise: 3, fear: 2, sadness: 1, anger: 0
      };

      const avgMood = dayJournals.length > 0
        ? dayJournals.reduce((sum, j) => sum + (moodScores[j.emotion as keyof typeof moodScores] || 2.5), 0) / dayJournals.length
        : null;

      dailyTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: avgMood,
        entries: dayJournals.length,
        dominantEmotion: dayJournals.length > 0 ? dayJournals[0].emotion : null
      });
    }

    // Weekly comparison
    const thisWeekEmotions = weeklyJournals.reduce((acc: Record<string, number>, j) => {
      acc[j.emotion] = (acc[j.emotion] || 0) + 1;
      return acc;
    }, {});

    const prevWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekJournals = moodJournals.filter(j => {
      const date = new Date(j.created_at);
      return date >= prevWeekStart && date < sevenDaysAgo;
    });

    const prevWeekEmotions = prevWeekJournals.reduce((acc: Record<string, number>, j) => {
      acc[j.emotion] = (acc[j.emotion] || 0) + 1;
      return acc;
    }, {});

    // Most active emotion
    const mostCommonEmotion = emotionDistribution.length > 0
      ? emotionDistribution.reduce((prev, current) => prev.count > current.count ? prev : current)
      : null;

    // Monthly summary
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthJournals = moodJournals.filter(j => {
        const jDate = new Date(j.created_at);
        return jDate >= monthDate && jDate < nextMonth;
      });

      const monthEmotions: Record<string, number> = {};
      monthJournals.forEach(j => {
        monthEmotions[j.emotion] = (monthEmotions[j.emotion] || 0) + 1;
      });

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        ...monthEmotions,
        total: monthJournals.length
      });
    }

    // Calculate average mood score
    const moodScores = { joy: 5, love: 4, surprise: 3, fear: 2, sadness: 1, anger: 0 };
    const avgMoodScore = recentJournals.length > 0
      ? recentJournals.reduce((sum, j) => sum + (moodScores[j.emotion as keyof typeof moodScores] || 2.5), 0) / recentJournals.length
      : 0;

    setAnalytics({
      totalEntries: moodJournals.length,
      recentEntries: recentJournals.length,
      weeklyEntries: weeklyJournals.length,
      emotionDistribution,
      dailyTrend,
      monthlyData,
      mostCommonEmotion,
      thisWeekEmotions,
      prevWeekEmotions,
      avgMoodScore,
      avgWordsPerEntry: recentJournals.length > 0
        ? Math.round(recentJournals.reduce((sum, j) => sum + (j.text?.split(' ').length || 0), 0) / recentJournals.length)
        : 0
    });
  }, [moodJournals]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <DashboardDock onSignOut={handleSignOut} />
        <div className="container mx-auto px-4 py-8 pb-32">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!user || !analytics || moodJournals.length === 0) {
    return (
      <>
        <DashboardDock onSignOut={handleSignOut} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-32">
          <Card className="w-full max-w-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Start Your Mood Journey</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Begin tracking your emotions to unlock powerful insights and beautiful visualizations of your mood patterns.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your First Journal Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <>
      <DashboardDock onSignOut={handleSignOut} />
      <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-y-auto">
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Light mode grid */}
          <div className="absolute inset-0 dark:hidden" style={{
            backgroundImage: `
              linear-gradient(to right, rgb(15 23 42 / 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(15 23 42 / 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0'
          }}></div>
          {/* Dark mode grid */}
          <div className="absolute inset-0 hidden dark:block" style={{
            backgroundImage: `
              linear-gradient(to right, rgb(203 213 225 / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(203 213 225 / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0'
          }}></div>
        </div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-transparent to-slate-200/30 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/60 pointer-events-none"></div>

        <div className="relative z-10 w-full min-h-full flex flex-col items-center">


          {/* Scrolling Content Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-y-auto overflow-x-hidden hide-scrollbar pb-32"
          >
            {/* Sticky Header Section */}
            <div className={`sticky top-0 z-50 transition-all duration-300 ease-in-out px-6 w-full ${isScrolled
                ? 'py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'
                : 'py-10 bg-transparent'
              }`}>
              <div className={`w-full max-w-[2000px] mx-auto flex flex-col transition-all duration-300 items-center text-center`}>
                <h1
                  className={`font-bold leading-tight text-slate-900 dark:text-slate-100 tracking-tight transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-4xl sm:text-5xl'
                    }`}
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Mood History
                </h1>
                <p
                  className={`text-slate-600 dark:text-slate-400 font-medium transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0 mt-0 text-[0px]' : 'h-auto opacity-100 mt-3 text-lg'
                    }`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Discover patterns and growth in your emotional well-being
                </p>
              </div>
            </div>

            <div className="w-full max-w-[2000px] mx-auto px-6 space-y-10">

              {/* Streak Cards - Modern gradient cards */}
              <MoodStreaks moodJournals={moodJournals} />

              {/* Quick Stats Grid - No duplicate streak; Total Entries, Most Frequent, Avg Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ y: -2 }}>
                  <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 hover:shadow-xl transition-all overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl mb-4 shadow-inner">
                        <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Total Entries</p>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 mt-2" style={{ fontFamily: 'var(--font-poppins)' }}>{moodJournals.length} <span className="text-lg font-medium text-slate-400">entries</span></h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">all-time journal count</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} whileHover={{ y: -2 }}>
                  <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 hover:shadow-xl transition-all overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl mb-4 shadow-inner">
                        <EmotionalIntelligenceIcon size={24} className="text-purple-500 dark:text-purple-400 w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Most Frequent</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 capitalize flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                        {analytics.mostCommonEmotion?.emotion || 'Balanced'}
                        <span className="text-2xl">{emotionEmojis[analytics.mostCommonEmotion?.emotion as keyof typeof emotionEmojis]}</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{analytics.mostCommonEmotion?.count || 0} entries this month</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} whileHover={{ y: -2 }}>
                  <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 hover:shadow-xl transition-all overflow-hidden">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl mb-4 shadow-inner">
                        <Activity className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>Avg Mood Score</p>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 mt-2" style={{ fontFamily: 'var(--font-poppins)' }}>{analytics.avgMoodScore?.toFixed(1) || '0.0'} <span className="text-lg font-medium text-slate-400">/ 5.0</span></h3>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (analytics.avgMoodScore / 5) * 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Charts Grid - Modern cards with gradients */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/30 dark:to-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-poppins)' }}>
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        14-Day Mood Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-80">
                        {analytics.dailyTrend.filter((d: any) => d.mood != null).length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.dailyTrend} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
                              <defs>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgb(226 232 240)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'var(--font-inter)' }} formatter={(value: number) => [value != null ? value.toFixed(1) : '—', 'Mood (1–5)']} labelStyle={{ fontFamily: 'var(--font-inter)' }} />
                              <Area type="monotone" dataKey="mood" name="Mood" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorMood)" connectNulls />
                              <Line type="monotone" dataKey="mood" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} connectNulls />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: 'var(--font-inter)' }}>Not enough data yet</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-[240px]">Journal on a few days in the last 14 days to see your mood journey here.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                  <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/30 dark:to-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-poppins)' }}>
                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                          <PieChart className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        </div>
                        Emotion Spectrum
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-80">
                        {analytics.emotionDistribution && analytics.emotionDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                              <Pie
                                data={analytics.emotionDistribution}
                                cx="50%"
                                cy="45%"
                                innerRadius={58}
                                outerRadius={92}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="emotion"
                                stroke="rgba(255,255,255,0.9)"
                                strokeWidth={2}
                                label={({ name, percent }) => `${name}: ${(percent ?? 0).toFixed(0)}%`}
                                labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                              >
                                {analytics.emotionDistribution.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={emotionColors[entry.emotion as keyof typeof emotionColors] || '#8884d8'} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgb(226 232 240)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'var(--font-inter)' }} formatter={(value: number, name: string, props: any) => [`${value} entries (${(props.payload?.percent ?? 0).toFixed(0)}%)`, name]} />
                              <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontFamily: 'var(--font-inter)' }} formatter={(value, entry: any) => <span className="text-slate-600 dark:text-slate-300 capitalize">{value} · {entry.payload?.count ?? 0}</span>} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <PieChart className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: 'var(--font-inter)' }}>Not enough data yet</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-[240px]">Add journal entries with detected emotions to see your emotion spectrum here.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Year Mood Heatmap */}
              <MoodHeatmap moodJournals={moodJournals} />

              {/* AI Analysis Card */}
              <div className="mb-8 w-full">
                <AIAnalysisCard moodJournals={moodJournals} analytics={analytics} user={user} profileName={profileName} />
              </div>

              {/* 6 Month Journey - Stacked bar chart */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden w-full">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/30 dark:to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-poppins)' }}>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      6-Month History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-80">
                      {analytics.monthlyData && analytics.monthlyData.some((m: any) => (m.total ?? 0) > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.monthlyData} margin={{ top: 16, right: 16, left: 8, bottom: 8 }} barCategoryGap="16%" barGap={4}>
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgb(226 232 240)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'var(--font-inter)' }} />
                            <Legend wrapperStyle={{ fontFamily: 'var(--font-inter)' }} />
                            {Object.keys(emotionColors).map((emotion) => (
                              <Bar key={emotion} dataKey={emotion} stackId="a" fill={emotionColors[emotion as keyof typeof emotionColors]} radius={[4, 4, 0, 0]} name={emotion} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: 'var(--font-inter)' }}>Not enough data yet</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-[240px]">Journal over the last 6 months to see your monthly history here.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
} 