"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/dashboard-navbar";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Brain, 
  BarChart3, 
  PieChart, 
  Activity,
  Flame,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
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
  CartesianGrid,
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

  const getColorIntensity = (score?: number) => {
    if (!score) return 'bg-gray-100 dark:bg-gray-800 opacity-20';
    if (score >= 4.5) return 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg'; // Joy/Love
    if (score >= 3.5) return 'bg-gradient-to-br from-green-300 to-emerald-400 shadow-md'; // Surprise
    if (score >= 2.5) return 'bg-gradient-to-br from-blue-200 to-indigo-300 shadow-sm'; // Neutral
    if (score >= 1.5) return 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-md'; // Fear/Sadness
    return 'bg-gradient-to-br from-red-400 to-pink-500 shadow-lg'; // Anger
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 border-0 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="py-1">
            <div className="text-xl font-bold leading-relaxed">{now.getFullYear()} Mood Journey</div>
            <div className="text-sm opacity-90 leading-relaxed">Your emotional landscape this year</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1 mb-4">
                         {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
               const monthStart = weeks.findIndex((week: any) => 
                 week.some((day: any) => day.date.getMonth() === index && day.date.getFullYear() === now.getFullYear())
               );
              return (
                <div 
                  key={month} 
                  className="text-xs text-muted-foreground font-medium"
                  style={{ marginLeft: monthStart > 0 ? `${monthStart * 14}px` : '0' }}
                >
                  {month}
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="w-2 h-2 text-xs text-muted-foreground flex items-center">
                  {index % 2 === 1 ? day.slice(0, 1) : ''}
                </div>
              ))}
            </div>
            
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                                     {week.map((day: any, dayIndex: number) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-md ${getColorIntensity(day.moodScore)} hover:scale-125 hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 transition-all duration-300 cursor-pointer border border-white/20`}
                      title={`${day.date.toLocaleDateString()}: ${
                        day.hasEntry 
                          ? `Mood score: ${day.moodScore?.toFixed(1)}/5` 
                          : 'No entries'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {moodJournals.filter(j => j.created_at.startsWith(now.getFullYear().toString())).length} entries this year
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Keep the streak going! 🔥
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-700/70 px-3 py-2 rounded-lg">
              <span className="text-xs font-medium">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm border border-white/20"></div>
                <div className="w-3 h-3 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-sm shadow-sm border border-white/20"></div>
                <div className="w-3 h-3 bg-gradient-to-br from-green-300 to-emerald-400 rounded-sm shadow-md border border-white/20"></div>
                <div className="w-3 h-3 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-sm shadow-lg border border-white/20"></div>
              </div>
              <span className="text-xs font-medium">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 text-white shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Current Streak</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {streaks.current}
                </p>
                <p className="text-blue-200 text-xs">consecutive days</p>
                {streaks.current > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-100">Active now!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-80 transform hover:scale-110 transition-transform">🔥</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 text-white shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Longest Streak</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {streaks.longest}
                </p>
                <p className="text-purple-200 text-xs">personal best</p>
                {streaks.longest >= 7 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-xs text-purple-100">Champion!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-80 transform hover:scale-110 transition-transform">🏆</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-white shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Positive Streak</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {streaks.positive}
                </p>
                <p className="text-green-200 text-xs">happy days</p>
                {streaks.positive >= 3 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-100">Inspiring!</span>
                  </div>
                )}
              </div>
              <div className="text-5xl opacity-80 transform hover:scale-110 transition-transform">✨</div>
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

  const generateAIAnalysis = async () => {
    if (analysisGenerated || moodJournals.length === 0) return;
    
    setLoading(true);
    
    try {
      // Prepare mood data for AI analysis
      const recentEntries = moodJournals.slice(0, 10);
      const emotionSummary = analytics.emotionDistribution.map((e: any) => 
        `${e.emotion}: ${e.count} entries (${e.percentage}%)`
      ).join(', ');
      
      const moodDataText = recentEntries.map(entry => 
        `Date: ${entry.created_at.split('T')[0]}, Emotion: ${entry.emotion}, Text: "${entry.text?.slice(0, 100) || 'No text'}"...`
      ).join('\n');
      
      const prompt = `You are Dr. AI, a leading AI emotional wellness specialist with expertise in mood pattern analysis and personalized mental health insights. Analyze this user's emotional journey with deep empathy and professional expertise.

## 📊 **MOOD DATA PROFILE**
**Timeline:** ${recentEntries.length} recent entries from ${moodJournals.length} total entries
**Emotional Landscape:** ${emotionSummary}
**Wellness Score:** ${analytics.avgMoodScore?.toFixed(1) || 'N/A'}/5.0 ⭐
**Consistency:** Regular journaling pattern detected

**Recent Emotional Journey:**
${moodDataText}

Provide a comprehensive, beautifully formatted analysis using this enhanced structure:

## 🧠 **EMOTIONAL INTELLIGENCE INSIGHTS**
*Your mind's unique emotional signature*

🔍 **Dominant Patterns:** [Identify 2-3 key emotional themes with specific examples]
🌊 **Emotional Flow:** [Describe how emotions transition and connect]
⚡ **Trigger Awareness:** [Note patterns in what sparks different emotions]
📈 **Trend Analysis:** [Weekly/monthly emotional trajectory]

---

## 🌟 **EMOTIONAL STRENGTHS SPOTLIGHT**
*Celebrating your natural resilience*

✨ **Self-Awareness:** [Acknowledge their journaling commitment and emotional intelligence]
💫 **Coping Mastery:** [Highlight positive emotional regulation patterns]
🎯 **Growth Mindset:** [Recognize learning from difficult emotions]
🏆 **Breakthrough Moments:** [Celebrate specific positive entries or progress]

---

## 🚀 **OPTIMIZATION PATHWAYS**
*Gentle guidance for emotional enhancement*

🎨 **Emotional Range:** [Suggestions for exploring emotional depth]
🧘 **Mindfulness Opportunities:** [Specific meditation or awareness practices]
🌱 **Challenge Navigation:** [Strategies for difficult emotional patterns]
⚖️ **Balance Techniques:** [Ways to maintain emotional equilibrium]

---

## 🎁 **PERSONALIZED WELLNESS TOOLKIT**
*Curated strategies just for you*

**🌅 Morning Rituals:**
- [Specific morning practice based on their patterns]
- [Mood-setting technique aligned with their needs]

**🌙 Evening Reflections:**
- [Journaling prompts tailored to their emotional style]
- [Relaxation method that matches their personality]

**⚡ Instant Mood Boosters:**
- [3 quick techniques for emotional regulation]
- [Activities that align with their positive patterns]

**📱 Digital Wellness:**
- [App recommendations or digital tools]
- [Online resources specific to their needs]

---

## 🏆 **CELEBRATION & MOMENTUM**
*Your emotional growth achievements*

🎊 **Progress Celebration:** [Specific improvements and milestones]
🎯 **Future Vision:** [Encouraging outlook on their emotional journey]
💝 **Personal Message:** [Warm, motivating closing that feels personal]
🌈 **Next Steps:** [Clear, achievable goals for continued growth]

**Remember:** Your emotional journey is uniquely yours, and every entry is a step toward greater self-understanding. You're building emotional intelligence that will serve you for life! 🌟

Use warm, professional language with specific examples from their data. Include actionable advice and maintain an encouraging, expert tone throughout.`;

      const response = await fetch('/api/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: prompt,
          isAnalysis: true 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis || 'Analysis completed successfully. Your mood journey shows positive patterns and growth opportunities.');
        
        // Show success toast notification
        console.log('✅ AI Analysis completed successfully!');
      } else {
        setAiAnalysis('Unable to generate AI analysis at this time. Your mood data shows consistent engagement and emotional awareness, which are positive signs for mental well-being.');
      }
      
      setAnalysisGenerated(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis('Your mood tracking shows dedication to self-awareness. Consider the patterns in your emotions and celebrate the positive moments while learning from challenging times.');
      setAnalysisGenerated(true);
    }
    
    setLoading(false);
  };

  // Auto-generate analysis when component mounts
  useEffect(() => {
    if (moodJournals.length > 0 && !analysisGenerated) {
      generateAIAnalysis();
    }
  }, [moodJournals, analysisGenerated]);

  const generateQuickInsights = () => {
    const totalEntries = moodJournals.length;
    const positiveEmotions = moodJournals.filter(j => ['joy', 'love', 'surprise'].includes(j.emotion)).length;
    const positiveRatio = totalEntries > 0 ? (positiveEmotions / totalEntries * 100).toFixed(1) : 0;
    
    const recentEntries = moodJournals.slice(0, 7);
    const recentPositive = recentEntries.filter(j => ['joy', 'love', 'surprise'].includes(j.emotion)).length;
    const trend = recentPositive >= recentEntries.length / 2 ? 'improving' : 'stable';
    
    return { positiveRatio, trend };
  };

  const insights = generateQuickInsights();

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-300/5 to-slate-400/5 dark:from-slate-600/5 dark:to-slate-700/5"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-300/10 to-slate-400/10 dark:from-slate-600/10 dark:to-slate-700/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-slate-300/8 to-slate-400/8 dark:from-slate-600/8 dark:to-slate-700/8 rounded-full translate-y-16 -translate-x-16 blur-3xl"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 text-white border-b border-slate-200/20 dark:border-slate-600/30">
        <CardTitle className="flex items-center gap-4 text-2xl">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-600/20 dark:to-pink-600/20 rounded-xl backdrop-blur-sm border border-purple-300/30 dark:border-purple-500/30 shadow-lg">
            <div className="relative">
              <Brain className="w-8 h-8 text-purple-200 dark:text-purple-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xl md:text-2xl font-bold text-white dark:text-slate-100">
              Emotional Wellness Analysis for {profileName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'}
            </div>
            <div className="text-sm md:text-base text-slate-200 dark:text-slate-300 opacity-90">Deep insights from your emotional journey</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-emerald-200 dark:text-emerald-300">{insights.positiveRatio}%</div>
              <div className="text-xs text-slate-300 dark:text-slate-400">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl">{insights.trend === 'improving' ? '📈' : '🔄'}</div>
              <div className="text-xs text-slate-300 dark:text-slate-400 capitalize">{insights.trend}</div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-6">
              {/* Enhanced loading animation */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200/30 dark:border-slate-600/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-slate-500 border-r-slate-600 border-b-slate-700 rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-slate-400 border-r-slate-500 border-b-slate-600 rounded-full animate-spin animate-reverse"></div>
                <div className="absolute top-6 left-6 w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-white text-xl animate-pulse">
                  🧠
                </div>
              </div>
              
              {/* Loading text with gradient */}
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  AI is analyzing your mood...
                </div>
                <div className="text-lg font-medium text-slate-600 dark:text-slate-400">
                  🔍 Discovering your emotional patterns
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center leading-relaxed">
                  Our advanced AI is carefully examining your emotional journey to provide deep, personalized insights
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Processing {moodJournals.length} journal entries</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-slate-600 dark:bg-slate-500 rounded-full animate-pulse animation-delay-200"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Analyzing emotional patterns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-slate-700 dark:bg-slate-600 rounded-full animate-pulse animation-delay-400"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Generating personalized insights</span>
                </div>
              </div>
              
              {/* Estimated time */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full">
                ⏱️ Estimated time: 10-15 seconds
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/60 via-slate-50/40 to-white/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/60 backdrop-blur-lg rounded-2xl p-8 border border-slate-200/30 dark:border-slate-600/30 shadow-inner overflow-hidden relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-300/10 to-slate-400/10 dark:from-slate-600/10 dark:to-slate-700/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-slate-300/8 to-slate-400/8 dark:from-slate-600/8 dark:to-slate-700/8 rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-indigo-600 dark:text-indigo-400">✨</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          AI's Analysis
                        </h3>
                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full text-white text-xs font-semibold shadow-md">
                          ✨ PREMIUM AI
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Personalized emotional wellness insights powered by advanced AI analysis
                      </p>
                    </div>
                    
                    <div className="prose prose-sm max-w-none 
                      prose-headings:bg-gradient-to-r prose-headings:from-indigo-600 prose-headings:via-purple-600 prose-headings:to-pink-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:font-bold prose-headings:mb-4 prose-headings:text-lg
                      prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-strong:font-semibold prose-strong:bg-indigo-50 dark:prose-strong:bg-indigo-900/30 prose-strong:px-1 prose-strong:py-0.5 prose-strong:rounded
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                      prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-2
                      prose-ul:my-3 prose-ul:space-y-2 prose-ol:my-3 prose-ol:space-y-2
                      prose-h2:text-xl prose-h2:border-b-2 prose-h2:border-gradient-to-r prose-h2:from-indigo-200 prose-h2:to-purple-200 dark:prose-h2:from-indigo-800 dark:prose-h2:to-purple-800 prose-h2:pb-3 prose-h2:mb-6
                      prose-h3:text-lg prose-h3:mb-3 prose-h3:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:my-4
                      prose-code:bg-indigo-100 dark:prose-code:bg-indigo-900/50 prose-code:text-indigo-800 dark:prose-code:text-indigo-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                      prose-hr:border-gradient-to-r prose-hr:from-indigo-200 prose-hr:via-purple-200 prose-hr:to-pink-200 prose-hr:border-2 prose-hr:my-6
                      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                      [&_em]:text-indigo-600 [&_em]:dark:text-indigo-400 [&_em]:font-medium [&_em]:not-italic
                      [&_hr]:border-t-2 [&_hr]:border-gradient-to-r [&_hr]:from-indigo-200 [&_hr]:via-purple-200 [&_hr]:to-pink-200 [&_hr]:dark:from-indigo-800 [&_hr]:dark:via-purple-800 [&_hr]:dark:to-pink-800
                      ">
                      {aiAnalysis ? (
                        <div className="space-y-4">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h2: ({ children }) => (
                                <h2 className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 pb-3 mb-6">
                                  {children}
                                </h2>
                              ),
                              hr: () => (
                                <div className="my-6 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-full opacity-60"></div>
                              ),
                              em: ({ children }) => (
                                <em className="text-indigo-600 dark:text-indigo-400 font-medium not-italic bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                                  {children}
                                </em>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-md shadow-sm">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-3 my-4">
                                  {children}
                                </ul>
                              ),
                              li: ({ children }) => (
                                <li className="flex items-start gap-3 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                  <span className="text-indigo-500 mt-1">•</span>
                                  <span className="flex-1">{children}</span>
                                </li>
                              )
                            }}
                          >
                            {aiAnalysis}
                          </ReactMarkdown>
                          
                          {/* Achievement badge */}
                          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                ✓
                              </div>
                              <div>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Analysis Complete!</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">Your emotional intelligence score has been updated based on this analysis.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🎯</div>
                          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                            Ready for Deep Insights?
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-sm">
                            Click "Generate Analysis" to unlock AI-powered insights about your emotional patterns and get personalized wellness recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {!analysisGenerated && !loading && (
              <div className="text-center">
                <Button 
                  onClick={generateAIAnalysis}
                  className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                  disabled={loading || moodJournals.length === 0}
                >
                  <Brain className="w-6 h-6 mr-3" />
                  Generate AI Analysis
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
                {moodJournals.length === 0 ? (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      📝 Add some mood entries to unlock AI analysis
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
                    ✨ Ready to discover insights from {moodJournals.length} mood entries
                  </p>
                )}
              </div>
            )}
            
            {analysisGenerated && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => {
                    setAnalysisGenerated(false);
                    setAiAnalysis('');
                    generateAIAnalysis();
                  }}
                  variant="outline"
                  className="text-indigo-600 border-2 border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/20 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={loading}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Refresh Analysis
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `linear-gradient(45deg, ${
              ['#60A5FA', '#A78BFA', '#F472B6', '#34D399', '#FBBF24'][i % 5]
            }, ${
              ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][i % 5]
            })`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [moodJournals, setMoodJournals] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!user || !analytics || moodJournals.length === 0) {
  return (
    <>
      <DashboardNavbar />
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 px-4">
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
      <DashboardNavbar />
      <div className="min-h-screen pt-24 px-4 pb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900/30 dark:to-purple-900/30 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-300/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <FloatingParticles />
          
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-relaxed pb-2">
              Your Mood Journey ✨
            </h1>
            <p className="text-muted-foreground text-xl">
              Discover patterns, insights, and growth in your emotional well-being
            </p>
          </motion.div>

          {/* Quick Stats - 3 Cards Only */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Current Streak */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -8 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group cursor-pointer"
            >
              <Card className="relative overflow-hidden h-48 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black border-0 shadow-xl hover:shadow-2xl dark:shadow-orange-500/25 dark:hover:shadow-orange-500/40 transition-all duration-300">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent dark:from-orange-500/20 dark:via-red-500/15 dark:to-pink-500/10 opacity-60"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/20 dark:from-yellow-400/30 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Enhanced dark mode border glow */}
                <div className="absolute inset-0 rounded-lg border border-transparent dark:border-orange-400/20 dark:shadow-inner dark:shadow-orange-500/10"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-300 dark:bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-orange-200 dark:bg-orange-300 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 left-6 w-1 h-1 bg-pink-200 dark:bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>

                <CardContent className="p-6 relative z-10 h-full flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <motion.p 
                      className="text-orange-100 dark:text-orange-200 text-sm font-medium tracking-wide"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Current Streak
                    </motion.p>
                    <motion.div
                      className="flex items-baseline gap-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-black text-white dark:text-orange-50 drop-shadow-lg dark:drop-shadow-2xl">{streak}</span>
                      <span className="text-base font-semibold text-orange-100 dark:text-orange-200">
                        {streak === 1 ? 'day' : 'days'}
                      </span>
                    </motion.div>
                    <p className="text-orange-200 dark:text-orange-300 text-xs font-medium tracking-wider">
                      consecutive journaling
                    </p>
                    
                    {/* Progress indicator */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full animate-pulse shadow-lg dark:shadow-yellow-400/50"></div>
                        <span className="text-xs text-orange-100 dark:text-orange-200 font-medium">
                          {streak > 0 ? 'Keep it going!' : 'Start your streak today!'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div className="relative ml-4">
                    <div className="text-5xl filter drop-shadow-lg dark:drop-shadow-2xl dark:brightness-110">🔥</div>
                    {streak > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-lg dark:shadow-yellow-500/60"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Emotion */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -8 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group cursor-pointer"
            >
              <Card className="relative overflow-hidden h-48 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black border-0 shadow-xl hover:shadow-2xl dark:shadow-purple-500/25 dark:hover:shadow-purple-500/40 transition-all duration-300">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent dark:from-purple-500/20 dark:via-indigo-500/15 dark:to-blue-500/10 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-300/15 dark:from-blue-400/25 to-transparent rounded-full transform -translate-x-20 translate-y-20 group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Enhanced dark mode border glow */}
                <div className="absolute inset-0 rounded-lg border border-transparent dark:border-purple-400/20 dark:shadow-inner dark:shadow-purple-500/10"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-6 right-4 w-1 h-1 bg-blue-200 dark:bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-12 left-8 w-1.5 h-1.5 bg-purple-200 dark:bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-8 right-6 w-1 h-1 bg-indigo-200 dark:bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
                </div>

                <CardContent className="p-6 relative z-10 h-full flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <motion.p 
                      className="text-purple-100 dark:text-purple-200 text-sm font-medium tracking-wide"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      Current Emotion
                    </motion.p>
                    <motion.div
                      className="space-y-1"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-2xl font-black text-white dark:text-purple-50 drop-shadow-lg dark:drop-shadow-2xl capitalize block">
                        {analytics.mostCommonEmotion?.emotion || 'Balanced'}
                      </span>
                    </motion.div>
                    <p className="text-purple-200 dark:text-purple-300 text-xs font-medium tracking-wider">
                      most frequent this week
                    </p>
                    
                    {/* Emotion strength indicator */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                i < (analytics.mostCommonEmotion?.count || 0) / 2 
                                  ? 'bg-yellow-300 dark:bg-yellow-400 shadow-sm dark:shadow-yellow-400/50' 
                                  : 'bg-white/30 dark:bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-purple-100 dark:text-purple-200 font-medium">
                          {analytics.mostCommonEmotion?.count || 0} entries
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div className="relative ml-4">
                    <div className="text-5xl filter drop-shadow-lg dark:drop-shadow-2xl dark:brightness-110">
                      {emotionEmojis[analytics.mostCommonEmotion?.emotion as keyof typeof emotionEmojis] || '🎭'}
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20 dark:bg-white/10"
                      animate={{ scale: [1, 1.3, 1], opacity: [0, 0.3, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Score */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -8 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group cursor-pointer"
            >
              <Card className="relative overflow-hidden h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black border-0 shadow-xl hover:shadow-2xl dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transition-all duration-300">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 opacity-60"></div>
                <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-br from-cyan-300/15 dark:from-cyan-400/25 to-transparent rounded-full transform -translate-x-18 -translate-y-18 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Enhanced dark mode border glow */}
                <div className="absolute inset-0 rounded-lg border border-transparent dark:border-emerald-400/20 dark:shadow-inner dark:shadow-emerald-500/10"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-8 left-6 w-1 h-1 bg-cyan-200 dark:bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-emerald-200 dark:bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-4 left-8 w-1 h-1 bg-teal-200 dark:bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <CardContent className="p-6 relative z-10 h-full flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <motion.p 
                      className="text-emerald-100 dark:text-emerald-200 text-sm font-medium tracking-wide"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      Mood Score
                    </motion.p>
                    <motion.div
                      className="flex items-baseline gap-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-black text-white dark:text-emerald-50 drop-shadow-lg dark:drop-shadow-2xl">
                        {analytics.avgMoodScore ? analytics.avgMoodScore.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-base font-semibold text-emerald-100 dark:text-emerald-200">
                        /5.0
                      </span>
                    </motion.div>
                    <p className="text-emerald-200 dark:text-emerald-300 text-xs font-medium tracking-wider">
                      average this month
                    </p>
                    
                    {/* Progress bar */}
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-white/20 dark:bg-white/10 rounded-full h-2 overflow-hidden shadow-inner dark:shadow-emerald-900/50">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-yellow-300 to-emerald-300 dark:from-yellow-400 dark:to-emerald-400 rounded-full shadow-sm dark:shadow-emerald-400/50"
                          initial={{ width: 0 }}
                          animate={{ width: `${((analytics.avgMoodScore || 0) / 5) * 100}%` }}
                          transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-100 dark:text-emerald-200 font-medium">
                          {analytics.avgMoodScore >= 4 ? 'Excellent! 🌟' : 
                           analytics.avgMoodScore >= 3 ? 'Good progress 👍' : 
                           analytics.avgMoodScore >= 2 ? 'Building up 💪' : 
                           'New beginning 🌱'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div className="relative ml-4">
                    <div className="text-5xl filter drop-shadow-lg dark:drop-shadow-2xl dark:brightness-110">🌟</div>
                    <motion.div
                      className="absolute -inset-2 rounded-full border-2 border-white/30 dark:border-white/20 shadow-lg dark:shadow-emerald-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mood Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group"
            >
              <Card className="h-[420px] relative overflow-hidden bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black border-0 shadow-xl hover:shadow-2xl dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30 transition-all duration-300">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent dark:from-blue-500/15 dark:via-indigo-500/10 dark:to-purple-500/5 opacity-60"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-300/20 dark:from-blue-400/25 to-transparent rounded-full transform translate-x-20 -translate-y-20 group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Enhanced dark mode border glow */}
                <div className="absolute inset-0 rounded-lg border border-transparent dark:border-blue-400/20 dark:shadow-inner dark:shadow-blue-500/10"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-6 left-8 w-1 h-1 bg-blue-200 dark:bg-blue-300 rounded-full animate-ping"></div>
                  <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-8 left-12 w-1 h-1 bg-purple-200 dark:bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
                </div>

                <CardHeader className="relative z-10 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 dark:from-slate-700/95 dark:via-slate-800/95 dark:to-slate-900/95 text-white border-b border-white/10 dark:border-slate-600/30">
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                      <TrendingUp className="w-6 h-6 text-blue-100 dark:text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-white dark:text-slate-100">14-Day Mood Journey</div>
                      <div className="text-sm text-blue-100 dark:text-slate-300 opacity-90">Track your emotional patterns over time</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white dark:text-slate-100">
                        {analytics.dailyTrend.filter((d: any) => d.mood !== null).length}
                      </div>
                      <div className="text-xs text-blue-200 dark:text-slate-400">active days</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 p-6 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 backdrop-blur-sm">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailyTrend.filter((d: any) => d.mood !== null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs text-slate-600 dark:text-slate-400"
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                        />
                        <YAxis 
                          domain={[0, 5]} 
                          className="text-xs text-slate-600 dark:text-slate-400"
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                                    Mood Score: {payload[0].value?.toFixed(1)}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{data.entries} entries</p>
                                  {data.dominantEmotion && (
                                    <p className="text-sm font-medium mt-1">
                                      {emotionEmojis[data.dominantEmotion as keyof typeof emotionEmojis]} {data.dominantEmotion}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#3B82F6" 
                          fill="url(#colorMood)" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                        />
                        <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emotion Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group"
            >
              <Card className="h-[420px] relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-black border-0 shadow-xl hover:shadow-2xl dark:shadow-purple-500/20 dark:hover:shadow-purple-500/30 transition-all duration-300">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent dark:from-purple-500/15 dark:via-pink-500/10 dark:to-rose-500/5 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-pink-300/20 dark:from-pink-400/25 to-transparent rounded-full transform -translate-x-22 translate-y-22 group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Enhanced dark mode border glow */}
                <div className="absolute inset-0 rounded-lg border border-transparent dark:border-purple-400/20 dark:shadow-inner dark:shadow-purple-500/10"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-8 right-6 w-1 h-1 bg-purple-200 dark:bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-pink-200 dark:bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-12 right-8 w-1 h-1 bg-rose-200 dark:bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
                </div>

                <CardHeader className="relative z-10 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-rose-600/90 dark:from-slate-700/95 dark:via-slate-800/95 dark:to-slate-900/95 text-white border-b border-white/10 dark:border-slate-600/30">
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                      <PieChart className="w-6 h-6 text-purple-100 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-white dark:text-slate-100">Emotion Distribution</div>
                      <div className="text-sm text-purple-100 dark:text-slate-300 opacity-90">Your emotional spectrum (30 days)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white dark:text-slate-100">
                        {analytics.emotionDistribution.length}
                      </div>
                      <div className="text-xs text-purple-200 dark:text-slate-400">emotions</div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 p-6 bg-gradient-to-br from-white/80 via-purple-50/60 to-pink-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 backdrop-blur-sm">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.emotionDistribution}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {analytics.emotionDistribution.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={emotionColors[entry.emotion as keyof typeof emotionColors] || '#8884d8'}
                              stroke="rgba(255,255,255,0.8)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl">
                                  <p className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    {emotionEmojis[data.emotion as keyof typeof emotionEmojis]} 
                                    <span className="capitalize">{data.emotion}</span>
                                  </p>
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {data.count} entries ({data.percentage}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          content={({ payload }) => (
                            <div className="flex flex-wrap gap-3 justify-center mt-4">
                              {payload?.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-slate-700/70 rounded-full text-xs font-medium backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                                  <div 
                                    className="w-3 h-3 rounded-full shadow-sm" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="capitalize text-slate-700 dark:text-slate-300">
                                    {(entry.payload as any)?.emotion}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Analysis Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <AIAnalysisCard moodJournals={moodJournals} analytics={analytics} user={user} profileName={profileName} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 border-0 shadow-2xl overflow-hidden">
              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-6 left-8 w-1 h-1 bg-emerald-200 dark:bg-emerald-300 rounded-full animate-ping"></div>
                <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-teal-200 dark:bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-8 left-12 w-1 h-1 bg-green-200 dark:bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
              </div>

              <CardHeader className="relative z-10 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-green-600/90 dark:from-slate-700/95 dark:via-slate-800/95 dark:to-slate-900/95 text-white border-b border-white/10 dark:border-slate-600/30">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                    <BarChart3 className="w-6 h-6 text-emerald-100 dark:text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white dark:text-slate-100">6-Month Emotional Journey</div>
                    <div className="text-sm text-emerald-100 dark:text-slate-300 opacity-90">Your emotional patterns over the past 6 months</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white dark:text-slate-100">
                      {analytics.monthlyData.reduce((sum: number, month: any) => sum + month.total, 0)}
                    </div>
                    <div className="text-xs text-emerald-200 dark:text-slate-400">total entries</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-6 bg-gradient-to-br from-white/80 via-emerald-50/60 to-teal-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 backdrop-blur-sm">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs text-slate-600 dark:text-slate-400"
                        tick={{ fontSize: 12, fill: 'currentColor' }}
                      />
                      <YAxis 
                        className="text-xs text-slate-600 dark:text-slate-400"
                                                tick={{ fontSize: 12, fill: 'currentColor' }}
                      />
                      <Tooltip 
                        cursor={false}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const validPayload = payload.filter(item => item.value && item.value > 0);
                            if (validPayload.length === 0) return null;
                            
                            const total = validPayload.reduce((sum, item) => sum + (item.value || 0), 0);
                            return (
                              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{label}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Total: {total} entries</p>
                                <div className="space-y-1">
                                  {validPayload.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                      />
                                      <span className="text-xs capitalize text-slate-700 dark:text-slate-300">
                                        {emotionEmojis[item.dataKey as keyof typeof emotionEmojis]} {item.dataKey}: {item.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        content={({ payload }) => (
                          <div className="flex flex-wrap gap-3 justify-center mt-4">
                            {payload?.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-slate-700/70 rounded-full text-xs font-medium backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                                <div 
                                  className="w-3 h-3 rounded-full shadow-sm" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="capitalize text-slate-700 dark:text-slate-300">
                                  {emotionEmojis[entry.value as keyof typeof emotionEmojis]} {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      {Object.keys(emotionColors).map((emotion) => (
                        <Bar 
                          key={emotion}
                          dataKey={emotion} 
                          stackId="emotions"
                          fill={emotionColors[emotion as keyof typeof emotionColors]}
                          name={emotion}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <Brain className="w-5 h-5" />
                  Writing Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg words per entry:</span>
                    <span className="font-semibold">{analytics.avgWordsPerEntry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Most productive day:</span>
                    <span className="font-semibold">
                      {analytics.dailyTrend.reduce((max: any, day: any) => 
                        day.entries > max.entries ? day : max, { entries: 0, date: 'None' }
                      ).date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total words written:</span>
                    <span className="font-semibold">
                      {moodJournals.reduce((sum, j) => sum + (j.text?.split(' ').length || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <Heart className="w-5 h-5" />
                  Emotional Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Days journaling:</span>
                    <span className="font-semibold">
                      {new Set(moodJournals.map(j => j.created_at.split('T')[0])).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Longest streak:</span>
                    <span className="font-semibold">{streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current momentum:</span>
                    <span className="font-semibold text-green-600">
                      {analytics.weeklyEntries >= 3 ? 'Strong 💪' : analytics.weeklyEntries >= 1 ? 'Building 🌱' : 'Starting 🌟'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Activity className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Journal Entry
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                  onClick={() => router.push('/dashboard/profile')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Update Preferences
                </Button>
        </CardContent>
      </Card>
          </motion.div>
        </div>
    </div>
    </>
  );
} 