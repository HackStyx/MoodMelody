"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardDock from "@/components/dashboard-dock";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExpandableCardDemo } from "@/components/expandable-cards";
import { MusicRecommendations } from "@/components/music-recommendations";
import { ClaudeChatInput } from "@/components/claude-style-chat-input";
import { EmojiPicker } from "@/components/emoji-picker";
import { History, Sparkles, Music2, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [profileName, setProfileName] = useState<string>("");
  const [journalText, setJournalText] = useState("");
  const [journalEmoji, setJournalEmoji] = useState("");
  const [journalTag, setJournalTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [latestJournal, setLatestJournal] = useState<{ text: string, tag: string, emotion: string, created_at: string } | null>(null);
  const [latestMood, setLatestMood] = useState<{ mood: string, created_at: string } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastActive, setLastActive] = useState<string>("");
  const [showPrevious, setShowPrevious] = useState(false);
  const [previousJournals, setPreviousJournals] = useState<Array<{ text: string, tag: string, emotion: string, created_at: string }>>([]);
  const [musicRecommendations, setMusicRecommendations] = useState<Array<{ id: string, name: string, artist: string, album: string, image: string, preview_url: string, external_url: string }>>([]);
  const [showMusicRecommendations, setShowMusicRecommendations] = useState(false);
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
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

  // Fetch latest journal and mood on load
  useEffect(() => {
    const fetchLatestData = async () => {
      if (!user) return;

      try {
        // Fetch latest journal
        const { data: journalData, error: journalError } = await supabase
          .from("mood_journals")
          .select("text, tag, emotion, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (journalData) setLatestJournal(journalData);

        // Fetch latest mood
        const { data: moodData, error: moodError } = await supabase
          .from("moods")
          .select("mood, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (moodError) {
          console.error("Error fetching latest mood:", moodError);
        }
        if (moodData) {
          setLatestMood(moodData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchLatestData();
  }, [user]);

  // On dashboard load, ensure streak is up to date and only one entry per user
  useEffect(() => {
    const checkAndUpdateStreak = async () => {
      if (!user) return;
      try {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        // Use upsert to handle the unique constraint properly
        const { data: streakData, error: streakError } = await supabase
          .from("streaks")
          .select("streak_count, last_active")
          .eq("user_id", user.id)
          .single();

        if (streakError && streakError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is okay
          console.error("Streak fetch error:", streakError);
          setStreak(0);
          setLastActive("");
          return;
        }

        let newStreak = 1;
        if (streakData) {
          if (streakData.last_active === today) {
            // Already active today
            newStreak = streakData.streak_count;
          } else if (streakData.last_active === yesterday) {
            // Continue the streak
            newStreak = streakData.streak_count + 1;
          }
          // If last_active is older than yesterday, streak resets to 1
        }

        // Use upsert to update or create the streak record
        const { error: upsertError } = await supabase
          .from("streaks")
          .upsert({
            user_id: user.id,
            streak_count: newStreak,
            last_active: today
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error("Streak upsert error:", upsertError);
          setStreak(0);
          setLastActive("");
        } else {
          setStreak(newStreak);
          setLastActive(today);
        }
      } catch (error) {
        console.error("Streak check error:", error);
        setStreak(0);
        setLastActive("");
      }
    };
    checkAndUpdateStreak();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  const handleJournalSubmit = async (text: string, tag?: string) => {
    if (!text.trim()) return;

    setIsSubmitting(true);
    let detectedEmotion = "";
    let emotionConfidence = 0;

    try {
      // Call our enhanced emotion detection API
      const resp = await fetch("/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const result = await resp.json();
      detectedEmotion = result.emotion || "";
      emotionConfidence = result.confidence || 0;
    } catch (err) {
      console.error("Emotion detection failed:", err);
      detectedEmotion = "joy"; // fallback
    }

    try {
      // Save to Supabase
      const { data, error } = await supabase.from("mood_journals").insert({
        user_id: user.id,
        text: text,
        tag: tag || journalTag || "",
        emotion: detectedEmotion
      });

      if (error) {
        console.error("Error saving journal:", error);
        alert("Failed to save journal entry. Please try again.");
        return;
      }

      // Reset form
      setJournalText("");
      setJournalTag("");
      setSelectedEmoji("");
      if (tagInputRef.current) tagInputRef.current.value = "";

      // Refetch latest journal
      const { data: latestData } = await supabase
        .from("mood_journals")
        .select("text, tag, emotion, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestData) setLatestJournal(latestData);

      // Update streak
      await updateStreak();

      // Get music recommendations based on detected emotion
      if (detectedEmotion) {
        try {
          const musicResp = await fetch("/api/spotify/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emotion: detectedEmotion, limit: 5 })
          });
          const musicData = await musicResp.json();
          setMusicRecommendations(musicData.recommendations || []);
          setShowMusicRecommendations(true);
        } catch (err) {
          console.error("Music recommendations failed:", err);
        }
      }

      alert(`Journal submitted! Emotion detected: ${detectedEmotion} (${Math.round(emotionConfidence * 100)}% confidence)`);

    } catch (err) {
      console.error("Journal submission failed:", err);
      alert("Failed to submit journal entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSubmit = (data: {
    message: string;
    files: any[];
    pastedContent: any[];
    model: string;
    isThinkingEnabled: boolean;
  }) => {
    // Extract tag from message if it contains #hashtag
    const tagMatch = data.message.match(/#(\w+)/);
    const tag = tagMatch ? tagMatch[1] : "";
    const text = data.message.replace(/#\w+/g, "").trim();

    // Prepend emoji if selected
    const finalText = selectedEmoji ? `${selectedEmoji} ${text}` : text;

    handleJournalSubmit(finalText, tag);
  };

  // Save mood to Supabase
  const handleMoodUpdate = async (mood: string) => {
    if (!user) return;
    await supabase.from("moods").insert({ user_id: user.id, mood });
    // Refetch latest mood
    const { data: moodData } = await supabase
      .from("moods")
      .select("mood, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (moodData) setLatestMood(moodData);
    // Update streak
    await updateStreak();
  };

  // Update streak logic
  const updateStreak = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      // Fetch current streak
      const { data: streakData, error } = await supabase
        .from("streaks")
        .select("streak_count, last_active")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is okay
        return;
      }

      let newStreak = 1;
      if (streakData) {
        if (streakData.last_active === today) {
          // Already active today, don't change streak
          newStreak = streakData.streak_count;
        } else if (streakData.last_active === yesterday) {
          // Continue the streak
          newStreak = streakData.streak_count + 1;
        }
        // If last_active is older than yesterday, streak resets to 1
      }

      // Use upsert with conflict resolution
      const { error: upsertError } = await supabase
        .from("streaks")
        .upsert({
          user_id: user.id,
          streak_count: newStreak,
          last_active: today
        }, {
          onConflict: 'user_id'
        });

      if (!upsertError) {
        setStreak(newStreak);
        setLastActive(today);
      }
    } catch (error) {
      // Silent error handling
      console.error("Update streak error:", error);
    }
  };

  const handleShowPrevious = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mood_journals")
      .select("text, tag, emotion, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      // Exclude the latest entry
      setPreviousJournals(data.slice(1));
      setShowPrevious(true);
    }
  };

  const handleGetPersonalizedRecommendations = async () => {
    if (!user) return;
    setIsLoadingPersonalized(true);

    try {
      const response = await fetch("/api/spotify/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, limit: 6 })
      });

      const data = await response.json();

      if (data.recommendations) {
        setMusicRecommendations(data.recommendations);
        setShowMusicRecommendations(true);
      }
    } catch (error) {
      console.error("Failed to get personalized recommendations:", error);
      alert("Failed to get personalized recommendations. Please try again.");
    } finally {
      setIsLoadingPersonalized(false);
    }
  };

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardDock onSignOut={handleSignOut} />
      <div className="px-2 sm:px-4 pb-20 flex flex-col items-center h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
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
          {/* Subtle dot pattern overlay for depth */}
          <div className="absolute inset-0 dark:hidden opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, rgb(15 23 42 / 0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          <div className="absolute inset-0 hidden dark:block opacity-40" style={{
            backgroundImage: 'radial-gradient(circle, rgb(203 213 225 / 0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-transparent to-slate-200/30 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/60 pointer-events-none"></div>
        {/* Additional dark mode accent */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Chat Interface Header */}
          <div className="w-full max-w-4xl mx-auto mt-16 mb-6 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                    {profileName || user.user_metadata?.name ? (
                      <>
                        {getGreeting()}, {profileName || user.user_metadata?.name}
                      </>
                    ) : (
                      <>
                        {getGreeting()}, Dear
                      </>
                    )}
                  </h1>
                  <div className="flex items-center gap-3">
                    <EmojiPicker
                      onEmojiSelect={async (emoji) => {
                        setSelectedEmoji(emoji);
                        await handleMoodUpdate(emoji);
                      }}
                      selectedEmoji={latestMood?.mood || ""}
                    />
                    <button
                      onClick={handleShowPrevious}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-medium shadow-sm border-0 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">History</span>
                    </button>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium mt-3" style={{ fontFamily: 'var(--font-inter)' }}>
                  How are you feeling today? Share your thoughts with me.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="w-full max-w-4xl mx-auto mt-8 mb-8 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden">
              <div className="relative z-10">
                {/* Latest Journal Entry Display */}
                {isLoadingData ? (
                  <div className="mb-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-16 rounded-md" />
                          <Skeleton className="h-6 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-9 w-40 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ) : latestJournal && (
                  <div className="mb-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-xl">
                        📝
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Last entry
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            •
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(latestJournal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-base font-medium text-slate-900 dark:text-slate-100 mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                          {latestJournal.text}
                        </div>
                        <div className="flex items-center justify-between gap-4 flex-wrap w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            {latestJournal.tag && (
                              <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                #{latestJournal.tag}
                              </span>
                            )}
                            {latestJournal.emotion && (
                              <span className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium capitalize border border-blue-200 dark:border-blue-800">
                                {latestJournal.emotion}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setShowMusicRecommendations(!showMusicRecommendations)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-sm font-medium shadow-sm border-0 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 ml-auto sm:ml-0"
                            style={{ fontFamily: 'var(--font-inter)' }}
                          >
                            <Music2 className="w-4 h-4" />
                            <span>{showMusicRecommendations ? 'Hide' : 'See'} Recommendations</span>
                            {showMusicRecommendations ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Input Component */}
                <div className="relative">
                  <ClaudeChatInput
                    onSendMessage={handleChatSubmit}
                    placeholder="How are you feeling today? Share your thoughts..."
                    hideModelSelector={true}
                    hideThinkingToggle={true}
                  />
                  {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 rounded-2xl flex items-center justify-center z-20">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span>Processing your entry...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History Dialog */}
          <Dialog open={showPrevious} onOpenChange={setShowPrevious}>
            <DialogContent className="max-w-3xl p-8 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Your Mood Journey
              </DialogTitle>
              <DialogDescription className="text-base">
                Explore your past journal entries and see how your emotions have evolved over time.
              </DialogDescription>
              <div className="flex flex-col gap-4 mt-4">
                {previousJournals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                      No previous entries found. Start journaling to see your history here!
                    </p>
                  </div>
                ) : (
                  previousJournals.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="text-2xl">📔</div>
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                            {entry.text}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {entry.tag && (
                              <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-600">
                                #{entry.tag}
                              </span>
                            )}
                            {entry.emotion && (
                              <span className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium capitalize border border-blue-200 dark:border-blue-800">
                                {entry.emotion}
                              </span>
                            )}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Mood Journal and Expandable Cards Section */}
          {showMusicRecommendations && (
            <div className="w-full flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto mt-10 relative z-10">
              <div className="flex-1 flex items-stretch">
                <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-10 relative overflow-hidden">
                  <div className="relative z-10 w-full">
                    <MusicRecommendations
                      recommendations={musicRecommendations}
                      emotion={latestJournal?.emotion || 'joy'}
                      onGetPersonalizedRecommendations={handleGetPersonalizedRecommendations}
                      isLoadingPersonalized={isLoadingPersonalized}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 