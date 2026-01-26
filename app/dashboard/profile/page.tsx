"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DashboardDock from "@/components/dashboard-dock";
import { Avatar } from "@/components/ui/avatar";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

// Streak Calendar Component
const StreakCalendar = ({ streak, lastActive, user }: { streak: number; lastActive: string; user: any }) => {
  const [activityData, setActivityData] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;

      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000); // Last 7 days including today

      try {
        // Fetch mood entries for the last 7 days
        const { data: moodData } = await supabase
          .from("moods")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        // Fetch journal entries for the last 7 days
        const { data: journalData } = await supabase
          .from("mood_journals")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        // Create activity map
        const activityMap: {[key: string]: boolean} = {};
        
        // Mark days with mood entries
        moodData?.forEach(entry => {
          const date = entry.created_at.split('T')[0];
          activityMap[date] = true;
        });

        // Mark days with journal entries
        journalData?.forEach(entry => {
          const date = entry.created_at.split('T')[0];
          activityMap[date] = true;
        });

        setActivityData(activityMap);
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

    fetchActivityData();
  }, [user, streak]);

  // Generate the last 7 days
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['S','M','T','W','T','F','S'][date.getDay()];
      const hasActivity = activityData[dateStr] || false;
      
      days.push({
        day: dayName,
        date: dateStr,
        hasActivity,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const weekDays = generateWeekDays();

  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl mb-2">🔥</span>
      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {streak} day{streak === 1 ? '' : 's'} strong!
      </h3>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
        Last active: {lastActive ? new Date(lastActive).toLocaleDateString() : '—'}
      </div>
      
      {/* Day labels */}
      <div className="w-full flex justify-center mt-2">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                day.isToday 
                  ? "bg-gradient-to-r from-blue-500 to-cyan-300 text-white" 
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
      
      {/* Activity indicators */}
      <div className="w-full flex justify-center mt-2">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all ${
                day.hasActivity
                  ? day.isToday
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse" 
                    : "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
              }`}
              title={day.hasActivity ? `Active on ${new Date(day.date).toLocaleDateString()}` : `No activity on ${new Date(day.date).toLocaleDateString()}`}
            >
              {day.hasActivity ? '🔥' : '○'}
            </div>
          ))}
        </div>
      </div>
      
      {streak > 0 && (
        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 text-center">
          Keep it up! 🎯
        </div>
      )}
    </div>
  );
};

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "R&B", "Country", "Indie", "Chill", "Happy", "Sad", "Energetic", "Calm"
];
const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese", "Other"];
const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [language, setLanguage] = useState("");
  const [musicPrefs, setMusicPrefs] = useState<string[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastActive, setLastActive] = useState<string>("");

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (showEdit) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [showEdit]);

  // Fetch profile from Supabase on load
  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/signin");
        return;
      }
      setUser(userData.user);
      const { data, error } = await supabase
        .from("profiles")
        .select("name, place, about, gender, age_range, language, music_prefs")
        .eq("id", userData.user.id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        setError("Failed to load profile");
      } else if (data) {
        setName(data.name || "");
        setPlace(data.place || "");
        setAbout(data.about || "");
        setGender(data.gender || "");
        setAgeRange(data.age_range || "");
        setLanguage(data.language || "");
        setMusicPrefs(data.music_prefs || []);
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data: streakData, error: streakError } = await supabase
          .from("streaks")
          .select("streak_count, last_active")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (streakError && streakError.code !== 'PGRST116') {
          console.error("Streak fetch error:", streakError);
          setStreak(0);
          setLastActive("");
          return;
        }
        
        if (streakData) {
          setStreak(streakData.streak_count || 0);
          setLastActive(streakData.last_active || "");
        } else {
          setStreak(0);
          setLastActive("");
        }
      } catch (error) {
        console.error("Streak check error:", error);
        setStreak(0);
        setLastActive("");
      }
    };
    
    if (user) {
      fetchStreak();
    }
  }, [user]);

  // Save profile to Supabase
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      place,
      about,
      gender,
      age_range: ageRange,
      language,
      music_prefs: musicPrefs,
    });
    if (error) {
      setError("Failed to save profile");
    } else {
      setShowEdit(false);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  function handleGenreToggle(genre: string) {
    setMusicPrefs((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  return (
    <>
      <DashboardDock onSignOut={handleSignOut} />
      <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-4 pb-32 bg-white dark:bg-black">
        {/* Top Row: Greeting and Avatar */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-0 md:gap-10">
          {/* Greeting */}
          <div className="flex-1 flex flex-col items-start md:items-start w-full md:w-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-left mb-0">
              Hello, <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent animate-gradient-x [background-size:200%_auto] transition-all duration-1000 ease-in-out">{name || user.user_metadata?.name || user.email}!</span>
            </h1>
          </div>
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center mt-6 md:mt-0 md:ml-8">
            <Avatar
              src={user.user_metadata?.avatar_url}
                alt="User Avatar"
              size="xxl"
              fallbackText={name || user.user_metadata?.name || user.email}
              style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)' }}
              />
          </div>
        </div>
        {/* Card below row, centered */}
        <div className="w-full flex justify-center mt-10">
          <motion.div
            whileHover={{
              scale: 1.04,
              transition: { duration: 0.3, type: "spring" }
            }}
            className="relative max-w-2xl w-full"
          >
            <div className="p-[3px] rounded-3xl bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 shadow-lg group/card transition-all duration-300 hover:shadow-2xl hover:from-indigo-500 hover:to-yellow-400">
              <Card className="pt-10 pb-10 px-8 sm:px-12 rounded-3xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md flex flex-col items-center relative z-10 w-full border-0 shadow-xl group-hover/card:shadow-2xl transition-all duration-300" style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18), 0 1.5px 12px 0 rgba(80,80,255,0.10)" }}>
                {/* Name and Email */}
                <div className="flex flex-col items-center mb-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-zinc-800 dark:text-zinc-100 text-center flex items-center gap-2">
                    <span>{name || user.user_metadata?.name || user.email}</span>
                  </div>
                  <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm8 0a12 12 0 11-24 0 12 12 0 0124 0z" /></svg>
                    <span>{user.email}</span>
                  </div>
                </div>
                {/* Divider */}
                <div className="w-2/3 mx-auto h-[1.5px] bg-gradient-to-r from-indigo-200 via-pink-200 to-yellow-100 opacity-70 rounded-full my-4" />
                {/* Place and About */}
                <div className="flex flex-col items-center mb-4 w-full">
                  {place && (
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-base mb-1">
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                      <span>{place}</span>
                    </div>
                  )}
                  {about && (
                    <div className="text-zinc-700 dark:text-zinc-300 text-center text-base italic max-w-md">{about}</div>
                  )}
                </div>
                {/* Info Row: Gender, Age, Language */}
                {(gender || ageRange || language) && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-6 w-full">
                    {gender && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        {gender}
                      </span>
                    )}
                    {gender && (ageRange || language) && <span className="mx-1 text-zinc-300">•</span>}
                    {ageRange && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" /></svg>
                        {ageRange}
                      </span>
                    )}
                    {ageRange && language && <span className="mx-1 text-zinc-300">•</span>}
                    {language && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-6m0 0V4m0 10H6m6 0h6" /></svg>
                        {language}
                      </span>
                    )}
                  </div>
                )}
                {/* Divider */}
                <div className="w-2/3 mx-auto h-[1.5px] bg-gradient-to-r from-indigo-100 via-pink-100 to-yellow-50 opacity-60 rounded-full my-2" />
                {/* Music Preferences */}
                {musicPrefs.length > 0 && (
                  <div className="w-full flex flex-col items-center mb-6">
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-2 tracking-wide uppercase">Favorite Moods & Genres</div>
                    <div className="flex flex-wrap justify-center gap-2 w-full">
                      {musicPrefs.map((genre) => (
                        <span key={genre} className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 via-pink-100 to-yellow-100 text-zinc-900 dark:text-zinc-900 text-xs font-semibold shadow-sm border border-zinc-200 dark:border-zinc-700">{genre}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  className="mt-2 px-10 py-4 rounded-full bg-gradient-to-r from-pink-400 via-orange-300 to-yellow-300 text-white font-bold text-xl shadow-lg border-0 hover:from-pink-500 hover:to-yellow-400 transition-all"
                  onClick={() => setShowEdit(true)}
                >
                  Customize
                </Button>
      </Card>
    </div>
          </motion.div>
        </div>
        {/* Streak Widget Card */}
        <div className="w-full flex justify-center mt-6">
          <motion.div
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, type: "spring" }
            }}
            className="relative max-w-md w-full"
          >
            <div className="w-full max-w-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-indigo-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 rounded-3xl shadow-xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 min-w-[0] border-0 backdrop-blur-md relative overflow-hidden">
              <StreakCalendar streak={streak} lastActive={lastActive} user={user} />
            </div>
          </motion.div>
        </div>
        {/* Personalize Form - Dialog Popup */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-4xl p-8 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <DialogHeader className="relative z-10">
              <div className="flex flex-col items-center gap-2 pt-6 pb-2">
                <span className="text-4xl md:text-5xl">🎨</span>
                <DialogTitle className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent animate-gradient-x [background-size:200%_auto] text-center drop-shadow-lg">Personalize Your Experience</DialogTitle>
              </div>
            </DialogHeader>
            {/* Divider */}
            <div className="w-2/3 mx-auto h-[2px] bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-200 opacity-60 rounded-full mb-2" />
            <div className="relative z-10 p-4 md:p-6">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Name</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Place</label>
                    <Input
                      value={place}
                      onChange={e => setPlace(e.target.value)}
                      placeholder="Your Place"
                      className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Gender</label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 dark:bg-zinc-900 border-white/10 text-zinc-800 dark:text-white shadow-lg">
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Age Range</label>
                    <Select value={ageRange} onValueChange={setAgeRange}>
                      <SelectTrigger className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 dark:bg-zinc-900 border-white/10 text-zinc-800 dark:text-white shadow-lg">
                        {AGE_RANGES.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Preferred Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 dark:bg-zinc-900 border-white/10 text-zinc-800 dark:text-white shadow-lg">
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">About</label>
                  <textarea
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full bg-white/40 dark:bg-black/30 border-white/20 text-zinc-800 dark:text-white shadow-sm backdrop-blur-md rounded-md p-3 resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-3 font-semibold text-zinc-700 dark:text-zinc-200">Music Preferences</label>
                  <div className="flex flex-wrap gap-4">
                    {GENRES.map((genre) => (
                      <button
                        type="button"
                        key={genre}
                        className={`px-5 py-2 rounded-full border text-base font-semibold transition-all duration-200 focus:outline-none shadow-sm
                          ${musicPrefs.includes(genre)
                            ? "bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 text-white border-transparent shadow-lg animate-gradient-x [background-size:200%_auto]"
                            : "bg-white/40 dark:bg-black/30 text-zinc-700 dark:text-zinc-300 border-white/20 hover:border-indigo-400"}
                        `}
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2 text-xl font-bold bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 text-white shadow-2xl hover:from-indigo-500 hover:to-yellow-400 py-5 rounded-2xl transition-all duration-300 animate-gradient-x [background-size:200%_auto] drop-shadow-lg">Save Changes</Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
} 