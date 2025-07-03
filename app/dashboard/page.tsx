"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExpandableCardDemo } from "@/components/expandable-cards";
import { MusicRecommendations } from "@/components/music-recommendations";

const MOODS = [
  { emoji: "😄", label: "Happy" },
  { emoji: "😊", label: "Content" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😱", label: "Surprised" },
  { emoji: "🥳", label: "Celebratory" },
  { emoji: "😔", label: "Disappointed" },
  { emoji: "😇", label: "Blessed" },
  { emoji: "🤔", label: "Thoughtful" },
];

type Mood = { emoji: string; label: string };

const EMOJI_OPTIONS = ["😄", "😊", "😐", "😢", "😡", "😴", "🤩", "😱", "🥳", "😔", "😇", "🤔"];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>("");
  const [journalText, setJournalText] = useState("");
  const [journalEmoji, setJournalEmoji] = useState("");
  const [journalTag, setJournalTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [latestJournal, setLatestJournal] = useState<{text: string, tag: string, emotion: string, created_at: string} | null>(null);
  const [latestMood, setLatestMood] = useState<{mood: string, created_at: string} | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastActive, setLastActive] = useState<string>("");
  const [showPrevious, setShowPrevious] = useState(false);
  const [previousJournals, setPreviousJournals] = useState<Array<{text: string, tag: string, emotion: string, created_at: string}>>([]);
  const [musicRecommendations, setMusicRecommendations] = useState<Array<{id: string, name: string, artist: string, album: string, image: string, preview_url: string, external_url: string}>>([]);
  const [showMusicRecommendations, setShowMusicRecommendations] = useState(false);
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false);

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

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let detectedEmotion = "";
    let emotionConfidence = 0;
    
    try {
      // Call our enhanced emotion detection API
      const resp = await fetch("/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: journalText })
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
        text: journalText,
        tag: journalTag,
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar onSignOut={handleSignOut} />
      <div className="pt-20 px-2 sm:px-4 flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 transition-colors">
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch mt-8">
          {/* Greeting Card */}
          <div className="w-full max-w-full md:max-w-[420px] flex-1 flex flex-col items-start justify-center bg-white/90 dark:bg-zinc-900/80 rounded-3xl shadow-xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 min-w-[0] border-0 backdrop-blur-md relative overflow-hidden h-full min-h-[180px] mb-6 md:mb-0">
            {/* Subtle background gradient blob */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-indigo-300 via-pink-200 to-yellow-100 opacity-30 rounded-full blur-2xl z-0" />
            <div className="relative z-10 w-full">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] bg-gradient-to-r from-indigo-400 via-pink-400 via-50% to-yellow-300 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg">
                Good Morning
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-indigo-400 via-50% to-yellow-300 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg mt-1">
                {profileName || user.user_metadata?.name || user.email}
                <Avatar
                  src={user.user_metadata?.avatar_url}
                  alt="User Avatar"
                  size="sm"
                  fallbackText={profileName || user.user_metadata?.name || user.email}
                  className="inline-block ml-2 align-middle"
                />
                <span className="align-middle ml-2 text-black dark:text-white text-xl sm:text-2xl md:text-3xl">👋</span>
              </span>
              <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-200 font-medium mt-2">
                Welcome back to MoodMelody, continue your journey!
              </p>
            </div>
          </div>
          {/* Mood Picker Card */}
          <div className="w-full max-w-full md:max-w-[420px] flex-1 flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/80 rounded-3xl shadow-xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 min-w-[0] border-0 backdrop-blur-md relative overflow-hidden h-full min-h-[180px] mb-6 md:mb-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-200 via-yellow-100 to-indigo-200 opacity-30 rounded-full blur-2xl z-0" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-2 text-center">
                <span className="block text-5xl md:text-6xl mb-2">
                  {latestMood?.mood || "❓"}
                </span>
                <div className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
                  {latestMood?.mood ? "Today's Mood" : "Current Mood"}
                </div>
              </div>
              <button
                className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 text-white font-bold shadow-lg border-0 hover:from-indigo-500 hover:to-yellow-400 transition-all text-lg"
                onClick={() => setPickerOpen(true)}
              >
                {currentMood ? "Change Mood" : "Update Mood"}
              </button>
            </div>
            {/* Mood Picker Modal */}
            <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
              <DialogContent className="max-w-md p-8 max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col items-center">
                <DialogTitle>Pick your mood</DialogTitle>
                <DialogDescription>
                  Select an emoji that best represents how you're feeling right now.
                </DialogDescription>
                <div className="text-3xl font-bold mb-4 text-center">Pick your mood</div>
                <div className="grid grid-cols-6 gap-3 mb-4">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.emoji}
                      className={`text-3xl rounded-full p-2 transition-all border-2 ${currentMood && currentMood.emoji === mood.emoji ? "border-pink-400 bg-pink-100 dark:bg-pink-900/30" : "border-transparent hover:border-indigo-300"}`}
                      onClick={() => {
                        const selectedMood = { emoji: mood.emoji, label: mood.label };
                        setCurrentMood(selectedMood);
                        setPickerOpen(false);
                        handleMoodUpdate(mood.emoji);
                      }}
                      aria-label={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Streak Widget Card */}
          <div className="w-full max-w-full md:max-w-[420px] flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-indigo-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 rounded-3xl shadow-xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 min-w-[0] border-0 backdrop-blur-md relative overflow-hidden h-full min-h-[180px]">
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-2">🔥</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{streak} day{streak === 1 ? '' : 's'} strong!</h3>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Last active: {lastActive ? new Date(lastActive).toLocaleDateString() : '—'}</div>
              {/* Streak Calendar Placeholder */}
              <div className="w-full flex justify-center mt-2">
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 6 ? "bg-gradient-to-r from-blue-500 to-cyan-300 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"}`}>
                      {['S','M','T','W','T','F','S'][i]}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full flex justify-center mt-2">
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold ${i === 6 ? "bg-gradient-to-r from-blue-500 to-cyan-300 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                      {/* Placeholder for streak days */}
                      {i === 6 ? '🔥' : '☠️'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mood Journal and Expandable Cards Section */}
        <div className="w-full flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto mt-10">
          <div className="flex-1">
            {/* Mood Journal Section */}
            <div className="w-full bg-white/80 dark:bg-zinc-900/80 rounded-3xl shadow-xl p-6 sm:p-10 backdrop-blur-md flex flex-col items-center relative overflow-hidden animate-fade-in">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-200 via-pink-100 to-yellow-100 opacity-20 rounded-full blur-2xl z-0" />
              <div className="relative z-10 w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">Mood Journal</h2>
                <form onSubmit={handleJournalSubmit} className="flex flex-col gap-4">
                  <textarea
                    className="w-full min-h-[200px] rounded-xl p-6 text-2xl bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition resize-none"
                    placeholder="How are you feeling today?"
                    value={journalText}
                    onChange={e => setJournalText(e.target.value)}
                    required
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-medium">Add tag:</span>
                    <input
                      ref={tagInputRef}
                      type="text"
                      className="rounded-lg px-3 py-1 border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="#anxious, #grateful..."
                      value={journalTag}
                      onChange={e => setJournalTag(e.target.value)}
                      maxLength={32}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 text-white font-bold shadow-lg border-0 hover:from-blue-500 hover:to-yellow-400 transition-all text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </form>
                {latestJournal && (
                  <div className="w-full mt-6 p-4 rounded-xl bg-blue-50 dark:bg-zinc-800/60 border border-blue-200 dark:border-zinc-700 shadow">
                    <div className="text-base text-zinc-700 dark:text-zinc-200 mb-1">Last entry:</div>
                    <div className="text-lg font-semibold mb-1">{latestJournal.text}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">Tag: {latestJournal.tag || '—'} | Emotion: {latestJournal.emotion || '—'}</div>
                    <div className="text-xs text-zinc-400 mt-1">{new Date(latestJournal.created_at).toLocaleString()}</div>
                    <button
                      className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 text-white font-bold shadow border-0 hover:from-blue-500 hover:to-yellow-400 transition-all text-base"
                      onClick={handleShowPrevious}
                    >
                      See Previous Entries
                    </button>
                  </div>
                )}
                <Dialog open={showPrevious} onOpenChange={setShowPrevious}>
                  <DialogContent className="max-w-2xl p-8 max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <DialogTitle>Previous Journal Entries</DialogTitle>
                    <DialogDescription>
                      View your past journal entries and emotions detected.
                    </DialogDescription>
                    <div className="flex flex-col gap-4 mt-2">
                      {previousJournals.length === 0 ? (
                        <div className="text-center text-zinc-500">No previous entries found.</div>
                      ) : (
                        previousJournals.map((entry, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 shadow">
                            <div className="text-lg font-semibold mb-1">{entry.text}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-300">Tag: {entry.tag || '—'} | Emotion: {entry.emotion || '—'}</div>
                            <div className="text-xs text-zinc-400 mt-1">{new Date(entry.created_at).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-stretch">
            <div className="w-full bg-white/80 dark:bg-zinc-900/80 rounded-3xl shadow-xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-200 via-blue-100 to-pink-100 opacity-20 rounded-full blur-2xl z-0" />
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
      </div>
    </>
  );
} 