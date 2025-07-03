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

const AIAnalysisCard = ({ moodJournals, analytics }: { moodJournals: any[], analytics: any }) => {
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
      
      const prompt = `As an AI emotional wellness expert, analyze this user's mood journal data and provide a comprehensive yet encouraging analysis:

## Mood Data Analysis:
**Recent Entries:** ${recentEntries.length} entries
**Emotion Distribution:** ${emotionSummary}
**Average Mood Score:** ${analytics.avgMoodScore?.toFixed(1) || 'N/A'}/5.0
**Total Journal Entries:** ${moodJournals.length}

**Recent Mood Journal Entries:**
${moodDataText}

Please provide a well-structured analysis in this format:

## 🎯 **Key Emotional Patterns**
- Identify the dominant emotions and any notable patterns
- Look for emotional triggers or themes in the journal entries
- Note any cycles or trends

## 💪 **Strengths & Positive Highlights**
- Celebrate what's going well emotionally
- Acknowledge positive coping strategies or mindset
- Highlight growth and resilience

## 🌱 **Growth Opportunities**
- Gently suggest areas for emotional development
- Identify potential triggers or challenges
- Offer constructive observations

## 🎁 **Personalized Recommendations**
- Provide 3-4 specific, actionable wellness strategies
- Suggest mindfulness or emotional regulation techniques
- Recommend activities based on their patterns

## ✨ **Encouraging Progress Notes**
- Celebrate their self-awareness and journal commitment
- Highlight positive trends and emotional intelligence
- End with motivation and support

Keep the tone warm, supportive, and professionally insightful. Use emojis sparingly for section headers. Focus on actionable insights and emotional growth.`;

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
    <Card className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/30 border-0 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-indigo-200/20 rounded-full translate-y-16 -translate-x-16 blur-3xl"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-4 text-2xl">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Brain className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">AI Mood Analysis</div>
            <div className="text-lg opacity-90">Deep insights from your emotional journey</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.positiveRatio}%</div>
              <div className="text-xs opacity-75">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">{insights.trend === 'improving' ? '📈' : '🔄'}</div>
              <div className="text-xs opacity-75 capitalize">{insights.trend}</div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                🤖 AI is analyzing your mood patterns...
              </div>
              <div className="text-sm text-muted-foreground max-w-md text-center">
                Our AI is carefully examining your emotional journey to provide personalized insights
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-500">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>Processing {moodJournals.length} journal entries</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-3 text-indigo-700 dark:text-indigo-300">
                    Personal AI Insights
                  </div>
                  <div className="prose prose-sm max-w-none 
                    prose-headings:text-indigo-700 dark:prose-headings:text-indigo-300 prose-headings:font-bold prose-headings:mb-3
                    prose-strong:text-gray-800 dark:prose-strong:text-gray-200 prose-strong:font-semibold
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
                    prose-ul:my-2 prose-ul:space-y-1 prose-ol:my-2 prose-ol:space-y-1
                    prose-h2:text-lg prose-h2:border-b prose-h2:border-indigo-200 dark:prose-h2:border-indigo-800 prose-h2:pb-2
                    prose-h3:text-base prose-h3:mb-2
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {aiAnalysis ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAnalysis}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 italic">
                        Click "Generate Analysis" to get AI-powered insights about your mood patterns.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {!analysisGenerated && !loading && (
              <div className="text-center">
                <Button 
                  onClick={generateAIAnalysis}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3"
                  disabled={loading || moodJournals.length === 0}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Generate AI Analysis
                </Button>
                {moodJournals.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add some mood entries to unlock AI analysis
                  </p>
                )}
              </div>
            )}
            
            {analysisGenerated && (
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => {
                    setAnalysisGenerated(false);
                    setAiAnalysis('');
                    generateAIAnalysis();
                  }}
                  variant="outline"
                  className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                  disabled={loading}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Refresh Analysis
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
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 text-white shadow-2xl border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Current Streak</p>
                      <p className="text-4xl font-bold text-white mb-1">{streak}</p>
                      <p className="text-blue-200 text-xs">consecutive days</p>
                    </div>
                    <div className="text-5xl opacity-80">🔥</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Emotion */}
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 text-white shadow-2xl border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Current Emotion</p>
                      <p className="text-2xl font-bold text-white mb-1 capitalize">
                        {analytics.mostCommonEmotion?.emotion || 'Balanced'}
                      </p>
                      <p className="text-purple-200 text-xs">most frequent</p>
                    </div>
                    <div className="text-5xl opacity-80">
                      {emotionEmojis[analytics.mostCommonEmotion?.emotion as keyof typeof emotionEmojis] || '🎭'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Score */}
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-white shadow-2xl border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Mood Score</p>
                      <p className="text-4xl font-bold text-white mb-1">
                        {analytics.avgMoodScore ? analytics.avgMoodScore.toFixed(1) : '0.0'}
                      </p>
                      <p className="text-green-200 text-xs">out of 5.0</p>
                    </div>
                    <div className="text-5xl opacity-80">📊</div>
                  </div>
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
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/30 border-0 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                <CardHeader className="relative z-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="py-1">
                      <div className="font-bold leading-relaxed">14-Day Mood Journey</div>
                      <div className="text-sm opacity-90 leading-relaxed">Track your emotional patterns</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.dailyTrend.filter((d: any) => d.mood !== null)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{label}</p>
                                <p className="text-blue-600">Mood Score: {payload[0].value?.toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground">{data.entries} entries</p>
                                {data.dominantEmotion && (
                                  <p className="text-sm">
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
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emotion Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-96 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-900 dark:via-purple-900/30 dark:to-pink-900/30 border-0 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardHeader className="relative z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div className="py-1">
                      <div className="font-bold leading-relaxed">Emotion Distribution</div>
                      <div className="text-sm opacity-90 leading-relaxed">Your emotional spectrum (30 days)</div>
                    </div>
                  </CardTitle>
        </CardHeader>
        <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics.emotionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {analytics.emotionDistribution.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={emotionColors[entry.emotion as keyof typeof emotionColors] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg">
                                <p className="font-medium flex items-center gap-2">
                                  {emotionEmojis[data.emotion as keyof typeof emotionEmojis]} 
                                  {data.emotion}
                                </p>
                                <p className="text-sm">
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
                          <div className="flex flex-wrap gap-2 justify-center mt-4">
                            {payload?.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="capitalize">{(entry.payload as any)?.emotion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
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
            <AIAnalysisCard moodJournals={moodJournals} analytics={analytics} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 py-1">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span className="leading-relaxed">6-Month Emotional Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
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